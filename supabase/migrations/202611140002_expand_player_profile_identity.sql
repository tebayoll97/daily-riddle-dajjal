-- Draft migration for the account profile expansion.
-- Review and apply only through the approved Supabase migration workflow.
alter table public.players
  add column if not exists username varchar(20),
  add column if not exists gender varchar(16),
  add column if not exists phone_number varchar(20),
  add column if not exists birth_date date;

create unique index if not exists players_username_global_unique
  on public.players (lower(btrim(username)))
  where username is not null and btrim(username) <> '';

create unique index if not exists players_phone_number_global_unique
  on public.players (phone_number)
  where phone_number is not null and btrim(phone_number) <> '';

alter table public.players
  drop constraint if exists players_username_format_check,
  add constraint players_username_format_check
    check (username is null or username ~ '^[A-Za-z0-9]{3,20}$'),
  drop constraint if exists players_gender_check,
  add constraint players_gender_check
    check (gender is null or gender in ('male', 'female')),
  drop constraint if exists players_phone_e164_check,
  add constraint players_phone_e164_check
    check (phone_number is null or phone_number ~ '^\+[1-9][0-9]{7,14}$');
