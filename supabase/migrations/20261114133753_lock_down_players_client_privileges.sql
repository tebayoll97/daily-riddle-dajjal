-- Browser clients must not create player rows; the verified server-side ensure API uses service_role.
-- Remove broad anonymous/authenticated table privileges, then restore only the required player UI access.
revoke all privileges on table public.players from anon, authenticated;

grant select on table public.players to authenticated;

-- Profile editing is the only browser write path. Identity and audit columns remain immutable to clients.
grant update (nickname, server_number, avatar_url, avatar_path)
on table public.players to authenticated;
