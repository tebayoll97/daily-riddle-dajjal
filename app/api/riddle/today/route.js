
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveAuthenticatedPlayer } from "@/lib/serverPlayerAccount";

export async function GET(request) {
  try {
    const auth = await resolveAuthenticatedPlayer(
      request,
      "id, nickname, server_number"
    );

    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const player = auth.player;

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
