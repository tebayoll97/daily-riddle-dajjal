import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!id || !uuidPattern.test(id)) {
      return Response.json(
        { error: "Invalid player ID." },
        { status: 400 }
      );
    }

    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .select("id, nickname, server_number, created_at, avatar_url")
      .eq("id", id)
      .maybeSingle();

    if (playerError) throw playerError;

    if (!player) {
      return Response.json(
        { error: "Player not found." },
        { status: 404 }
      );
    }

    return Response.json({
      player: {
        ...player,
        avatar_url: player.avatar_url || null,
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
