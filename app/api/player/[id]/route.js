
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Validate player ID
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!id || !uuidPattern.test(id)) {
      return Response.json(
        { error: "Invalid player ID." },
        { status: 400 }
      );
    }

    // Get public player information
    const { data: player, error: playerError } =
      await supabaseAdmin
        .from("players")
        .select("id, nickname, server_number, created_at")
        .eq("id", id)
        .maybeSingle();

    if (playerError) {
      throw playerError;
    }

    if (!player) {
      return Response.json(
        { error: "Player not found." },
        { status: 404 }
      );
    }

    // Get global ranking statistics
    const { data: stats, error: statsError } =
      await supabaseAdmin
        .from("global_leaderboard")
        .select("total_points, riddles_solved, last_completed_at")
        .eq("player_id", id)
        .maybeSingle();

    if (statsError) {
      throw statsError;
    }

    return Response.json({
      player,
      stats: stats || {
        total_points: 0,
        riddles_solved: 0,
        last_completed_at: null,
      },
    });

  } catch (error) {
    console.error("Player profile API error:", error);

    return Response.json(
      { error: "Unable to load player profile." },
      { status: 500 }
    );
  }
}
