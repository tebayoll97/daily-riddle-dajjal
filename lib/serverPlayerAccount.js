import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Resolve a verified Supabase bearer token to the universal player profile.
 * Never accepts a client-supplied player ID as identity proof.
 */
export async function resolveAuthenticatedPlayer(request, select = "id") {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const token = authorization.slice(7);
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.getUser(token);

  if (authError || !authData.user) {
    return { ok: false, status: 401, error: "Invalid session" };
  }

  const { data: player, error: playerError } = await supabaseAdmin
    .from("players")
    .select(select)
    .eq("auth_user_id", authData.user.id)
    .maybeSingle();

  if (playerError) throw playerError;

  if (!player) {
    return { ok: false, status: 404, error: "Player profile not found" };
  }

  return { ok: true, user: authData.user, player };
}
