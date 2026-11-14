import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const token = authorization.slice(7);
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    const user = authData?.user;
    if (authError || !user) return Response.json({ error: "Invalid session" }, { status: 401 });
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!id || !uuidPattern.test(id)) {
      return Response.json({ error: "Invalid player ID." }, { status: 400 });
    }

    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .select("id, auth_user_id, nickname, server_number, created_at, avatar_url")
      .eq("id", id)
      .maybeSingle();

    if (playerError) throw playerError;
    if (!player) {
      return Response.json({ error: "Player not found." }, { status: 404 });
    }

    if (player.auth_user_id !== user.id) return Response.json({ error: "Forbidden" }, { status: 403 });

    const { data: gameStats, error: statsError } = await supabaseAdmin
      .from("player_game_stats")
      .select(
        "game_id, total_points, games_played, wins, best_score, current_streak, longest_streak, last_played_at, games(id, slug, name, status)"
      )
      .eq("player_id", id)
      .order("total_points", { ascending: false });

    if (statsError) throw statsError;

    const stats = (gameStats || []).map((item) => ({
      gameId: item.game_id,
      slug: item.games?.slug || null,
      gameName: item.games?.name || "Unknown Game",
      gameStatus: item.games?.status || null,
      totalPoints: Number(item.total_points || 0),
      gamesPlayed: Number(item.games_played || 0),
      wins: Number(item.wins || 0),
      bestScore: Number(item.best_score || 0),
      currentStreak: Number(item.current_streak || 0),
      longestStreak: Number(item.longest_streak || 0),
      lastPlayedAt: item.last_played_at,
    }));

    const { data: activityRows, error: activityError } = await supabaseAdmin
      .from("game_result_events")
      .select("id, score, won, created_at, games(name, slug)")
      .eq("player_id", id)
      .order("created_at", { ascending: false })
      .limit(15);

    if (activityError) throw activityError;

    const activity = (activityRows || []).map((item) => ({
      id: item.id,
      gameName: item.games?.name || "Unknown Game",
      slug: item.games?.slug || null,
      score: Number(item.score || 0),
      won: Boolean(item.won),
      createdAt: item.created_at,
    }));

    const summary = stats.reduce(
      (total, item) => ({
        totalPoints: total.totalPoints + item.totalPoints,
        gamesPlayed: total.gamesPlayed + item.gamesPlayed,
        wins: total.wins + item.wins,
        gamesActive: total.gamesActive + (item.totalPoints > 0 || item.gamesPlayed > 0 ? 1 : 0),
      }),
      { totalPoints: 0, gamesPlayed: 0, wins: 0, gamesActive: 0 }
    );

    return Response.json({
      player: { id: player.id, nickname: player.nickname, username: null, gender: null, phone_number: null, birth_date: null, server_number: player.server_number, created_at: player.created_at, avatar_url: player.avatar_url || null },
      stats: { summary, games: stats, activity },
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Player profile API error:", error);
    return Response.json(
      { error: "Unable to load player profile." },
      { status: 500 }
    );
  }
}
