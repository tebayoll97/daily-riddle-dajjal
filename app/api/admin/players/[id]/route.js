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

    // User Management must never lock an administrator out of the platform.
    // Admin role changes require a separate, reviewed role-management workflow.
    if (body.action === "ban") {
      const { data: targetAdmin, error: adminLookupError } = await supabaseAdmin
        .from("admin_users")
        .select("user_id")
        .eq("user_id", result.player.auth_user_id)
        .maybeSingle();

      if (adminLookupError) {
        console.error("Admin target protection lookup error:", adminLookupError);
        return Response.json(
          { error: "Unable to verify account privileges. No changes were made." },
          { status: 500 }
        );
      }

      if (targetAdmin) {
        return Response.json(
          { error: "Administrator accounts cannot be banned from User Management. Review administrator privileges through the dedicated role-management process." },
          { status: 409 }
        );
      }
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

    // Deletion is intentionally blocked until it can be performed atomically.
    // The previous multi-step flow could erase scores before a player delete failed.
    return Response.json({
      error: "Player deletion is temporarily disabled to protect game history. Use ban/unban until an atomic deletion workflow is available.",
    }, { status: 409 });
  } catch (error) {
    console.error("Admin player delete guard error:", error);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
