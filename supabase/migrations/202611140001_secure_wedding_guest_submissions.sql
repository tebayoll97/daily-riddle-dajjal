-- Associate RSVP records with their invitation while preserving historical rows.
alter table public.df_rsvps
  add column if not exists invitation_id uuid
  references public.df_invitations(id) on delete cascade;

create index if not exists df_rsvps_invitation_id_created_at_idx
  on public.df_rsvps (invitation_id, created_at desc);

-- Public submissions must pass through server routes that verify publication and feature flags.
drop policy if exists "Public can submit wedding RSVP" on public.df_rsvps;
drop policy if exists "Public can submit DF guestbook messages" on public.df_guestbook;

-- Existing approved-message reads and admin moderation/read policies remain unchanged.
