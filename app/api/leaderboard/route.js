
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("scores")
      .select(`
        score,
        attempts,
        completed_at,
        players!inner (
          id,
          nickname,
          server_number
        )
      `)
      .not("completed_at", "is", null)
      .order("score", { ascending: false })
      .order("completed_at", { ascending: true })
      .limit(100);

    if (error) throw error;

    const ranking = (data || []).map((item) => ({
      player_id: item.players.id,
      nickname: item.players.nickname,
      server_number: item.players.server_number,
      score: item.score,
      attempts: item.attempts,
      completed_at: item.completed_at,
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
