-- Add invitation ownership to RSVP records while preserving historical rows.
alter table public.df_rsvps
  add column if not exists invitation_id uuid
  references public.df_invitations(id) on delete set null;

create index if not exists df_rsvps_invitation_id_created_at_idx
  on public.df_rsvps (invitation_id, created_at desc);

-- Private, salted, hashed per-IP counters for direct Supabase Data API inserts.
create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create table if not exists private.wedding_submission_rate_limit_config (
  id boolean primary key default true check (id = true),
  hash_salt text not null
);

insert into private.wedding_submission_rate_limit_config (id, hash_salt)
values (true, pg_catalog.gen_random_uuid()::text)
on conflict (id) do nothing;

create table if not exists private.wedding_submission_rate_limits (
  scope text not null check (scope in ('rsvp', 'guestbook')),
  ip_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (scope, ip_hash, window_started_at)
);

alter table private.wedding_submission_rate_limit_config enable row level security;
alter table private.wedding_submission_rate_limits enable row level security;
revoke all on private.wedding_submission_rate_limit_config from public, anon, authenticated;
revoke all on private.wedding_submission_rate_limits from public, anon, authenticated;

-- Safe, narrow feature check used by public INSERT policies.
create or replace function private.wedding_submission_feature_enabled(
  p_invitation_id uuid,
  p_feature text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.df_invitations as i
    join public.df_wedding_profiles as p on p.invitation_id = i.id
    where i.id = p_invitation_id
      and i.is_active = true
      and (
        (p_feature = 'rsvp' and p.rsvp_enabled = true)
        or (p_feature = 'guestbook' and p.guestbook_enabled = true)
      )
  );
$function$;

revoke all on function private.wedding_submission_feature_enabled(uuid, text) from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.wedding_submission_feature_enabled(uuid, text) to anon, authenticated;

-- Direct anon/authenticated inserts are limited to five per IP, per feature, per 10-minute window.
-- Server-side service_role submissions are protected by the Vercel WAF rule and are excluded here.
create or replace function private.enforce_wedding_submission_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_headers jsonb;
  v_claims jsonb;
  v_role text;
  v_forwarded text;
  v_client_ip inet;
  v_scope text;
  v_salt text;
  v_ip_hash text;
  v_window timestamptz;
  v_count integer;
begin
  v_claims := coalesce(
    nullif(current_setting('request.jwt', true), ''),
    nullif(current_setting('request.jwt.claims', true), ''),
    '{}'
  )::jsonb;

  v_role := coalesce(
    v_claims ->> 'role',
    current_setting('request.jwt.claim.role', true),
    current_setting('role', true),
    ''
  );

  if v_role not in ('anon', 'authenticated') then
    return new;
  end if;

  v_headers := coalesce(
    nullif(current_setting('request.headers', true), ''),
    '{}'
  )::jsonb;
  v_forwarded := split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1);

  if nullif(btrim(v_forwarded), '') is null then
    raise sqlstate 'PGRST'
      using message = json_build_object(
        'code', 'CLIENT-IP-UNAVAILABLE',
        'message', 'Submission temporarily unavailable',
        'details', 'Please retry shortly.',
        'hint', null
      )::text,
      detail = json_build_object(
        'status', 503,
        'headers', json_build_object('Retry-After', '60')
      )::text;
  end if;

  begin
    v_client_ip := btrim(v_forwarded)::inet;
  exception when others then
    raise sqlstate 'PGRST'
      using message = json_build_object(
        'code', 'CLIENT-IP-INVALID',
        'message', 'Submission temporarily unavailable',
        'details', 'Please retry shortly.',
        'hint', null
      )::text,
      detail = json_build_object(
        'status', 503,
        'headers', json_build_object('Retry-After', '60')
      )::text;
  end;

  v_scope := case when tg_table_name = 'df_rsvps' then 'rsvp' else 'guestbook' end;

  select c.hash_salt
    into v_salt
  from private.wedding_submission_rate_limit_config as c
  where c.id = true;

  if v_salt is null then
    raise sqlstate 'PGRST'
      using message = json_build_object(
        'code', 'RATE-LIMITER-UNAVAILABLE',
        'message', 'Submission temporarily unavailable',
        'details', 'Please retry shortly.',
        'hint', null
      )::text,
      detail = json_build_object(
        'status', 503,
        'headers', json_build_object('Retry-After', '60')
      )::text;
  end if;

  v_ip_hash := encode(
    sha256(convert_to(v_salt || ':' || host(v_client_ip), 'UTF8')),
    'hex'
  );
  v_window := to_timestamp(floor(extract(epoch from clock_timestamp()) / 600) * 600);

  perform pg_advisory_xact_lock(
    hashtextextended(v_scope || ':' || v_ip_hash, 0)
  );

  insert into private.wedding_submission_rate_limits (
    scope, ip_hash, window_started_at, request_count
  )
  values (v_scope, v_ip_hash, v_window, 1)
  on conflict (scope, ip_hash, window_started_at)
  do update
    set request_count = private.wedding_submission_rate_limits.request_count + 1
  returning request_count into v_count;

  if v_count > 5 then
    raise sqlstate 'PGRST'
      using message = json_build_object(
        'code', 'WEDDING-RATE-LIMIT',
        'message', 'Too many submissions',
        'details', 'Please wait before submitting again.',
        'hint', null
      )::text,
      detail = json_build_object(
        'status', 429,
        'headers', json_build_object('Retry-After', '600')
      )::text;
  end if;

  delete from private.wedding_submission_rate_limits
  where window_started_at < v_window - interval '1 day';

  return new;
end;
$function$;

revoke all on function private.enforce_wedding_submission_rate_limit() from public, anon, authenticated;

drop trigger if exists df_guestbook_submission_rate_limit on public.df_guestbook;
create trigger df_guestbook_submission_rate_limit
before insert on public.df_guestbook
for each row execute function private.enforce_wedding_submission_rate_limit();

drop trigger if exists df_rsvps_submission_rate_limit on public.df_rsvps;
create trigger df_rsvps_submission_rate_limit
before insert on public.df_rsvps
for each row execute function private.enforce_wedding_submission_rate_limit();

-- Keep direct public inserts backward-compatible, but require a live invitation with the feature enabled.
drop policy if exists "Public can submit DF guestbook messages" on public.df_guestbook;
create policy "Public can submit DF guestbook messages"
on public.df_guestbook
for insert
to anon, authenticated
with check (
  length(trim(guest_name)) between 1 and 100
  and length(trim(message)) between 1 and 500
  and is_approved = false
  and private.wedding_submission_feature_enabled(invitation_id, 'guestbook')
);

drop policy if exists "Public can submit wedding RSVP" on public.df_rsvps;
create policy "Public can submit wedding RSVP"
on public.df_rsvps
for insert
to anon, authenticated
with check (
  length(trim(guest_name)) between 1 and 100
  and guest_count >= 1
  and attendance = any (array['yes'::text, 'no'::text])
  and private.wedding_submission_feature_enabled(invitation_id, 'rsvp')
);
