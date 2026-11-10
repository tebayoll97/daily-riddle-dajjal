
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return Response.json({ error: "Login menggunakan akun Google untuk melihat leaderboard." }, { status: 401 });
  }
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(authorization.slice(7));
  const user = authData?.user;
  const hasGoogle = Boolean(user && !user.is_anonymous && (
    user.app_metadata?.provider === "google" ||
    user.app_metadata?.providers?.includes("google") ||
    user.identities?.some((identity) => identity.provider === "google")
  ));
  if (authError || !hasGoogle) {
    return Response.json({ error: "Login menggunakan akun Google untuk melihat leaderboard." }, { status: 403 });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("global_leaderboard")
      .select("*")
      .order("total_points", { ascending: false })
      .order("riddles_solved", { ascending: false })
      .order("last_completed_at", { ascending: true })
      // Stable tie-breaker keeps ranks deterministic when all score fields match.
      .order("player_id", { ascending: true })
      .limit(100);

    if (error) throw error;

    const ranking = (data || []).map((player, index) => ({
      rank: index + 1,
      player_id: player.player_id,
      nickname: player.nickname,
      server_number: player.server_number,
      total_points: player.total_points,
      riddles_solved: player.riddles_solved,
      last_completed_at: player.last_completed_at,
      avatar_url: player.avatar_url || null,
    }));

    return Response.json({
      ranking,
      total: ranking.length,
    });

  } catch (error) {
    console.error("Global leaderboard API error:", error);

    return Response.json(
      { error: "Unable to load global leaderboard." },
      { status: 500 }
    );
  }
}
