
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    // Authenticate player
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

    // Get player profile
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

    // Read and validate submitted answer
    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const answer = body?.answer;

    if (typeof answer !== "string" || !answer.trim()) {
      return Response.json(
        { error: "Please enter an answer." },
        { status: 400 }
      );
    }

    if (answer.length > 200) {
      return Response.json(
        { error: "Answer is too long. Maximum 200 characters." },
        { status: 400 }
      );
    }

    const normalizedAnswer = answer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    // Get today's date using Jakarta timezone
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

    // Get today's riddle
    const { data: riddle, error: riddleError } =
      await supabaseAdmin
        .from("riddles")
        .select(
          "id, answer_hash, answers_en, answers_id, points"
        )
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

    // Check previous attempts
    const { data: previousScore, error: scoreError } =
      await supabaseAdmin
        .from("scores")
        .select("id, attempts, score, completed_at")
        .eq("player_id", player.id)
        .eq("riddle_id", riddle.id)
        .maybeSingle();

    if (scoreError) throw scoreError;

    const previousAttempts = previousScore?.attempts || 0;

    if (previousScore?.completed_at) {
      return Response.json({
        correct: true,
        completed: true,
        attempts: previousAttempts,
        attemptsLeft: 0,
        score: previousScore.score,
        message: "You have already completed today's riddle.",
      });
    }

    if (previousAttempts >= 3) {
      return Response.json({
        correct: false,
        finished: true,
        attempts: previousAttempts,
        attemptsLeft: 0,
        score: previousScore?.score || 0,
        message: "No attempts left for today.",
      });
    }

    // Prepare accepted answers in both languages
    const englishAnswers = Array.isArray(riddle.answers_en)
      ? riddle.answers_en
      : [];

    const indonesianAnswers = Array.isArray(riddle.answers_id)
      ? riddle.answers_id
      : [];

    const acceptedAnswers = [
      ...englishAnswers,
      ...indonesianAnswers,
    ]
      .filter((item) => typeof item === "string")
      .map((item) =>
        item.trim().toLowerCase().replace(/\s+/g, " ")
      );

    // Validate answer using both language lists
    let isCorrect = acceptedAnswers.includes(normalizedAnswer);

    // Compatibility with older riddles
    if (acceptedAnswers.length === 0 && riddle.answer_hash) {
      const submittedHash = createHash("sha256")
        .update(normalizedAnswer)
        .digest("hex");

      isCorrect = submittedHash === riddle.answer_hash;
    }

    const attempts = previousAttempts + 1;
    const attemptsLeft = 3 - attempts;

    const points = isCorrect
      ? Math.round(
          riddle.points * (1 - (attempts - 1) * 0.3)
        )
      : 0;

    const completedAt = isCorrect
      ? new Date().toISOString()
      : null;

    const scoreData = {
      player_id: player.id,
      riddle_id: riddle.id,
      attempts,
      score: points,
      completed_at: completedAt,
    };

    // Update or create score record
    let saveError;

    if (previousScore) {
      const { error } = await supabaseAdmin
        .from("scores")
        .update(scoreData)
        .eq("id", previousScore.id);

      saveError = error;
    } else {
      const { error } = await supabaseAdmin
        .from("scores")
        .insert(scoreData);

      saveError = error;
    }

    if (saveError) throw saveError;

    return Response.json({
      correct: isCorrect,
      finished: isCorrect || attemptsLeft === 0,
      attempts,
      attemptsLeft,
      score: points,
      message: isCorrect
        ? "Correct answer!"
        : attemptsLeft > 0
          ? "Incorrect answer. Try again!"
          : "No attempts left for today.",
    });

  } catch (error) {
    console.error("Answer API error:", error);

    return Response.json(
      { error: "Unable to check your answer." },
      { status: 500 }
    );
  }
}
