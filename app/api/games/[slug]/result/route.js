import { supabaseAdmin } from "@/lib/supabaseAdmin";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== "string" || !/^[a-z0-9-]{2,60}$/.test(slug)) {
      return Response.json({ error: "Invalid game." }, { status: 400 });
    }

    // Daily Riddle uses its own atomic scoring pipeline and database trigger.
    if (slug === "daily-riddle") {
      return Response.json(
        { error: "This game uses its dedicated result pipeline." },
        { status: 409 }
      );
    }

    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const token = authorization.slice(7);
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      return Response.json({ error: "Invalid session." }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { sessionId, score, won } = body || {};
    if (!uuidPattern.test(sessionId || "")) {
      return Response.json({ error: "A valid session ID is required." }, { status: 400 });
    }
    if (!Number.isSafeInteger(score) || score < 0 || score > 1000000) {
      return Response.json({ error: "Invalid score." }, { status: 400 });
    }
    if (typeof won !== "boolean") {
      return Response.json({ error: "Invalid result status." }, { status: 400 });
    }

    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .select("id")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();

    if (playerError) throw playerError;
    if (!player) {
      return Response.json({ error: "Player profile not found." }, { status: 404 });
    }

    const { data: game, error: gameError } = await supabaseAdmin
      .from("games")
      .select("id, slug, status")
      .eq("slug", slug)
      .maybeSingle();

    if (gameError) throw gameError;
    if (!game || game.status !== "active") {
      return Response.json({ error: "Game is not available." }, { status: 404 });
    }

    const { data: stats, error: resultError } = await supabaseAdmin.rpc(
      "record_game_result",
      {
        p_player_id: player.id,
        p_game_id: game.id,
        p_session_id: sessionId,
        p_score: score,
        p_won: won,
      }
    );

    if (resultError) throw resultError;

    return Response.json({ success: true, stats });
  } catch (error) {
    console.error("Universal game result API error:", error);
    return Response.json(
      { error: "Unable to save game result." },
      { status: 500 }
    );
  }
}
