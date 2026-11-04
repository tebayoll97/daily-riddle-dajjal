
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    // Verify player identity
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authorization.slice(7);

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      return Response.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    // Find registered player
    const { data: player, error: playerError } =
      await supabaseAdmin
        .from("players")
        .select("id, nickname, server_number")
        .eq("auth_user_id", authData.user.id)
        .maybeSingle();

    if (playerError) throw playerError;

    if (!player) {
      return Response.json(
        { error: "Player profile not found" },
        { status: 404 }
      );
    }

    // Get today's date in Indonesia (WIB)
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const dateMap = Object.fromEntries(
      dateParts.map((part) => [part.type, part.value])
    );

    const today = `${dateMap.year}-${dateMap.month}-${dateMap.day}`;

    // Find today's active riddle
    const { data: riddle, error: riddleError } =
      await supabaseAdmin
        .from("riddles")
        .select("id, riddle_date, question, hint, points")
        .eq("riddle_date", today)
        .eq("is_active", true)
        .maybeSingle();

    if (riddleError) throw riddleError;

    if (!riddle) {
      return Response.json(
        { error: "Today's riddle is not available yet." },
        { status: 404 }
      );
    }

    return Response.json({
      player,
      riddle,
    });

  } catch (error) {
    console.error("Today's riddle API error:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
