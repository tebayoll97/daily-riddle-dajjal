import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveAuthenticatedPlayer } from "@/lib/serverPlayerAccount";

const GAME_SLUG = "mamah-ngamuk";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getGame() {
  const { data, error } = await supabaseAdmin
    .from("games")
    .select("id")
    .eq("slug", GAME_SLUG)
    .eq("status", "active")
    .single();
  if (error) throw error;
  return data;
}

export async function GET(request) {
  try {
    const auth = await resolveAuthenticatedPlayer(request, "id, nickname, server_number, avatar_url");
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
    const game = await getGame();
    const { data, error } = await supabaseAdmin
      .from("player_game_wallets")
      .select("balance, currency_code")
      .eq("player_id", auth.player.id)
      .eq("game_id", game.id)
      .eq("currency_code", "coin")
      .maybeSingle();
    if (error) throw error;
    const { data: stats, error: statsError } = await supabaseAdmin.from("player_game_stats").select("games_played, total_points, best_score").eq("player_id", auth.player.id).eq("game_id", game.id).maybeSingle();
    if (statsError) throw statsError;
    return Response.json({ player: { id: auth.player.id, nickname: auth.player.nickname, serverNumber: auth.player.server_number, avatarUrl: auth.player.avatar_url }, balance: Number(data?.balance || 0), currency: "coin", stats: { gamesPlayed: Number(stats?.games_played || 0), totalPoints: Number(stats?.total_points || 0), bestScore: Number(stats?.best_score || 0) } });
  } catch (error) {
    console.error("Mamah Ngamuk wallet GET error:", error);
    return Response.json({ error: "Unable to load game wallet." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await resolveAuthenticatedPlayer(request, "id");
    if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
    const distance = Number(body?.distance);
    const coins = Number(body?.coins);
    const score = Number(body?.score);

    if (!UUID.test(sessionId)
      || !Number.isSafeInteger(distance) || distance < 0 || distance > 10000000
      || !Number.isSafeInteger(coins) || coins < 0 || coins > 100000
      || !Number.isSafeInteger(score) || score !== distance * 12 + coins * 25) {
      return Response.json({ error: "Invalid game result." }, { status: 400 });
    }

    const game = await getGame();
    const { data, error } = await supabaseAdmin.rpc("record_mamah_ngamuk_result", {
      p_player_id: auth.player.id,
      p_session_id: sessionId,
      p_distance: distance,
      p_coins: coins,
      p_score: score,
    });
    if (error) throw error;

    return Response.json({
      ok: true,
      balance: Number(data?.balance || 0),
      coinsEarned: Number(data?.coins_earned || 0),
      duplicate: Boolean(data?.duplicate),
    });
  } catch (error) {
    console.error("Mamah Ngamuk result POST error:", error);
    return Response.json({ error: "Unable to save game result." }, { status: 500 });
  }
}
