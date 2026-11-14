-- Associate RSVP records with their invitation without deleting historical submissions.
-- ON DELETE SET NULL preserves the RSVP row if an invitation is later removed.
alter table public.df_rsvps
  add column if not exists invitation_id uuid
  references public.df_invitations(id) on delete set null;

create index if not exists df_rsvps_invitation_id_created_at_idx
  on public.df_rsvps (invitation_id, created_at desc);

-- Public submissions must pass through server routes that verify publication and feature flags.
drop policy if exists "Public can submit wedding RSVP" on public.df_rsvps;
drop policy if exists "Public can submit DF guestbook messages" on public.df_guestbook;

-- Existing approved-message reads and admin moderation/read policies remain unchanged.
-- Apply only after the server routes are deployed and durable rate limiting is enabled.
