
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
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

    const { data: riddle, error: riddleError } =
      await supabaseAdmin
        .from("riddles")
        .select(`
          id,
          riddle_date,
          question,
          hint,
          question_en,
          question_id,
          hint_en,
          hint_id,
          points
        `)
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

    const { data: previousScore, error: scoreError } =
      await supabaseAdmin
        .from("scores")
        .select("attempts, score, completed_at")
        .eq("player_id", player.id)
        .eq("riddle_id", riddle.id)
        .maybeSingle();

    if (scoreError) throw scoreError;

    const attempts = previousScore?.attempts || 0;
    const solved = Boolean(previousScore?.completed_at);
    const finished = solved || attempts >= 3;

    return Response.json({
      player,
      riddle: {
        id: riddle.id,
        riddle_date: riddle.riddle_date,
        question: riddle.question_en || riddle.question,
        hint: riddle.hint_en || riddle.hint,
        question_en: riddle.question_en || riddle.question,
        question_id: riddle.question_id || riddle.question,
        hint_en: riddle.hint_en || riddle.hint,
        hint_id: riddle.hint_id || riddle.hint,
        points: riddle.points,
      },
      progress: {
        attempts,
        attemptsLeft: finished ? 0 : Math.max(0, 3 - attempts),
        score: previousScore?.score || 0,
        completed: solved,
        finished,
      },
    });

  } catch (error) {
    console.error("Today's riddle API error:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
