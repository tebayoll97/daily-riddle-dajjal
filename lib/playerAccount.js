"use client";

import { supabase } from "@/lib/supabase";

function getAccountType(user) {
  if (!user) return "signed_out";
  if (user.is_anonymous) return "guest";

  const providers = [
    user.app_metadata?.provider,
    ...(user.app_metadata?.providers || []),
    ...(user.identities || []).map((identity) => identity.provider),
  ].filter(Boolean);

  return providers.includes("google") ? "google" : "registered";
}

/**
 * Resolve the signed-in Supabase identity to the one universal player profile.
 *
 * This helper never creates a player row and never merges accounts.
 * A missing profile is returned as "profile_required" so the caller can
 * collect the required nickname/server details through the registration flow.
 */
export async function getPlayerContext({ createGuest = false } = {}) {
  let {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;

  if (!user && createGuest) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    user = data.user;
  }

  if (!user) {
    return {
      status: "signed_out",
      accountType: "signed_out",
      user: null,
      player: null,
    };
  }

  const accountType = getAccountType(user);

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id, nickname, server_number, avatar_url")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (playerError) throw playerError;

  return {
    status: player ? "ready" : "profile_required",
    accountType,
    user,
    player: player || null,
  };
}

/**
 * Return the current Supabase access token for authenticated game API calls.
 * The token is never persisted or copied into a separate player identity.
 */
export async function getPlayerAccessToken() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session?.access_token || null;
}

export { getAccountType };
