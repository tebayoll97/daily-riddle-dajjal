
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function normalizeAnswer(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function POST(request) {
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

    const body = await request.json();
    const answer = body.answer;

    if (typeof answer !== "string" || !answer.trim()) {
      return Response.json(
        { error: "Please enter your answer." },
        { status: 400 }
      );
    }

    if (answer.length > 200) {
      return Response.json(
        { error: "Answer is too long." },
        { status: 400 }
      );
    }

    const { data: player, error: playerError } =
      await supabaseAdmin
        .from("players")
        .select("id")
        .eq("auth_user_id", authData.user.id)
        .maybeSingle();

    if (playerError) throw playerError;

    if (!player) {
      return Response.json(
        { error: "Player profile not found." },
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

    const today =
      `${dateMap.year}-${dateMap.month}-${dateMap.day}`;

    const { data: riddle, error: riddleError } =
      await supabaseAdmin
        .from("riddles")
        .select("id, answer_hash, points")
        .eq("riddle_date", today)
        .eq("is_active", true)
        .maybeSingle();

    if (riddleError) throw riddleError;

    if (!riddle) {
      return Response.json(
        { error: "Today's riddle is not available." },
        { status: 404 }
      );
    }

    const { data: existing, error: scoreError } =
      await supabaseAdmin
        .from("scores")
        .select("id, attempts, score, completed_at")
        .eq("player_id", player.id)
        .eq("riddle_id", riddle.id)
        .maybeSingle();

    if (scoreError) throw scoreError;

    if (existing?.completed_at) {
      return Response.json({
        correct: true,
        alreadyCompleted: true,
        score: existing.score,
        message: "You have already solved today's riddle.",
      });
    }

    const previousAttempts = existing?.attempts || 0;

    if (previousAttempts >= 3) {
      return Response.json({
        correct: false,
        exhausted: true,
        attemptsLeft: 0,
        message: "No attempts left today.",
      });
    }

    const normalized = normalizeAnswer(answer);

    const submittedHash = createHash("sha256")
      .update(normalized)
      .digest("hex");

    const correct = submittedHash === riddle.answer_hash;
    const attempts = previousAttempts + 1;

    const points = correct
      ? Math.round(riddle.points * (1 - (attempts - 1) * 0.3))
      : 0;

    const scoreData = {
      player_id: player.id,
      riddle_id: riddle.id,
      attempts,
      score: correct ? points : 0,
      completed_at: correct ? new Date().toISOString() : null,
    };

    if (existing) {
      const { error } = await supabaseAdmin
        .from("scores")
        .update(scoreData)
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("scores")
        .insert(scoreData);

      if (error) throw error;
    }

    return Response.json({
      correct,
      attempts,
      attemptsLeft: 3 - attempts,
      score: correct ? points : 0,
      message: correct
        ? "Congratulations! Correct answer!"
        : attempts >= 3
          ? "Incorrect. No attempts left today."
          : "Incorrect. Try again!",
    });

  } catch (error) {
    console.error("Answer API error:", error);

    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
