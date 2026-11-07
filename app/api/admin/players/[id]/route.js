import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

async function getAuthorizedPlayer(request, playerId) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return {
      response: Response.json({ error: auth.error }, { status: auth.status }),
    };
  }

  const { data: player, error } = await supabaseAdmin
    .from("players")
    .select("id, auth_user_id, nickname")
    .eq("id", playerId)
    .maybeSingle();

  if (error) {
    console.error("Admin player lookup error:", error);
    return { response: Response.json({ error: "Unable to find player." }, { status: 500 }) };
  }

  if (!player) {
    return { response: Response.json({ error: "Player not found." }, { status: 404 }) };
  }

  return { player };
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const result = await getAuthorizedPlayer(request, id);
    if (result.response) return result.response;

    const body = await request.json();
    if (!["ban", "unban"].includes(body?.action)) {
      return Response.json({ error: "Invalid player action." }, { status: 400 });
    }

    if (!result.player.auth_user_id) {
      return Response.json({ error: "This player has no linked login account." }, { status: 409 });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      result.player.auth_user_id,
      { ban_duration: body.action === "ban" ? "876000h" : "none" }
    );

    if (error) {
      console.error("Admin player ban error:", error);
      return Response.json({ error: "Unable to update player access." }, { status: 500 });
    }

    return Response.json({ success: true, action: body.action });
  } catch (error) {
    console.error("Admin player action error:", error);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await getAuthorizedPlayer(request, id);
    if (result.response) return result.response;

    // Scores use a restrictive FK, so remove score history first.
    const { error: scoresError } = await supabaseAdmin
      .from("scores")
      .delete()
      .eq("player_id", id);

    if (scoresError) {
      console.error("Admin player score cleanup error:", scoresError);
      return Response.json({ error: "Unable to remove player score history." }, { status: 500 });
    }

    // Related game stats and events are configured to cascade on player deletion.
    const { error: playerError } = await supabaseAdmin
      .from("players")
      .delete()
      .eq("id", id);

    if (playerError) {
      console.error("Admin player delete error:", playerError);
      return Response.json({ error: "Unable to delete player profile." }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: "Player profile and game history deleted. The linked Auth login account remains intact.",
    });
  } catch (error) {
    console.error("Admin player delete error:", error);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
