-- This legacy generic score RPC has no callers in the current application repository.
-- Current game results are recorded through the dedicated server-side game APIs/RPCs.
-- Preserve the function for compatibility/recovery, but prevent direct client execution until a reviewed caller requires it.
revoke execute on function public.record_game_result(text, uuid, integer, boolean)
from public, anon, authenticated;
