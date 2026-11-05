
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("global_leaderboard")
      .select("*")
      .order("total_points", { ascending: false })
      .order("riddles_solved", { ascending: false })
      .order("last_completed_at", { ascending: true })
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
