import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveAuthenticatedPlayer } from "@/lib/serverPlayerAccount";

const GAME_SLUG = "mamah-ngamuk";

export async function GET(request) {
  try {
    const auth = await resolveAuthenticatedPlayer(request, "id");
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
    const user = auth.user;
    const isGoogle = Boolean(user && !user.is_anonymous && (
      user.app_metadata?.provider === "google" ||
      user.app_metadata?.providers?.includes("google") ||
      user.identities?.some((identity) => identity.provider === "google")
    ));
    if (!isGoogle) return Response.json({ error: "Login Google diperlukan." }, { status: 403 });

    const { data: game, error: gameError } = await supabaseAdmin
      .from("games").select("id").eq("slug", GAME_SLUG).eq("status", "active").single();
    if (gameError) throw gameError;

    const { data: stats, error: statsError } = await supabaseAdmin
      .from("player_game_stats")
      .select("player_id,best_distance")
      .eq("game_id", game.id)
      .gt("best_distance", 0)
      .order("best_distance", { ascending: false })
      .order("player_id", { ascending: true })
      .limit(100);
    if (statsError) throw statsError;

    const ids = (stats || []).map((row) => row.player_id);
    if (!ids.length) return Response.json({ ranking: [] });

    const { data: players, error: playersError } = await supabaseAdmin
      .from("players").select("id,nickname,server_number,avatar_url").in("id", ids);
    if (playersError) throw playersError;
    const byId = new Map((players || []).map((p) => [p.id, p]));

    const ranking = (stats || []).map((row) => {
      const player = byId.get(row.player_id);
      return player ? {
        player_id: row.player_id,
        nickname: player.nickname,
        server_number: player.server_number,
        avatar_url: player.avatar_url,
        best_distance: Number(row.best_distance || 0),
      } : null;
    }).filter(Boolean).map((row, index) => ({ rank: index + 1, ...row }));

    return Response.json({ ranking });
  } catch (error) {
    console.error("Mamah Ngamuk leaderboard error:", error);
    return Response.json({ error: "Gagal memuat leaderboard Mamah Ngamuk." }, { status: 500 });
  }
}
