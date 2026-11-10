import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isGoogleUser(user) {
  const providers = user?.app_metadata?.providers || [];
  const identities = user?.identities || [];
  return user?.app_metadata?.provider === "google" ||
    providers.includes("google") ||
    identities.some((identity) => identity.provider === "google");
}

function nicknameBase(email) {
  const local = String(email || "").split("@")[0] || "player";
  const cleaned = local.trim().replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^[_ .-]+|[_ .-]+$/g, "");
  return (cleaned || "player").slice(0, 30);
}

export async function POST(request) {
  try {
    const authorization = request.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authorization.slice(7);
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    const user = authData?.user;

    if (authError || !user) {
      return Response.json({ error: "Invalid session" }, { status: 401 });
    }

    if (user.is_anonymous || !isGoogleUser(user) || !user.email) {
      return Response.json({ error: "A verified Google account is required." }, { status: 403 });
    }

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("players")
      .select("id, nickname, server_number, avatar_url")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existing) return Response.json({ player: existing, created: false });

    const base = nicknameBase(user.email);
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const suffix = attempt === 0 ? "" : `_${Math.random().toString(36).slice(2, 6)}`;
      const nickname = `${base.slice(0, 30 - suffix.length)}${suffix}`;

      const { data: player, error: insertError } = await supabaseAdmin
        .from("players")
        .insert({
          auth_user_id: user.id,
          nickname,
          avatar_url: avatar,
        })
        .select("id, nickname, server_number, avatar_url")
        .single();

      if (!insertError && player) {
        return Response.json({ player, created: true });
      }

      if (insertError?.code === "23505") {
        const { data: racedPlayer, error: racedError } = await supabaseAdmin
          .from("players")
          .select("id, nickname, server_number, avatar_url")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (racedError) throw racedError;
        if (racedPlayer) return Response.json({ player: racedPlayer, created: false });
        continue;
      }

      throw insertError;
    }

    return Response.json({ error: "Could not generate a unique nickname. Please try again." }, { status: 409 });
  } catch (error) {
    console.error("Ensure player profile error:", error);
    return Response.json({ error: "Unable to prepare your player profile." }, { status: 500 });
  }
}
