
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveAuthenticatedPlayer } from "@/lib/serverPlayerAccount";

export async function POST(request) {
  try {
    // Resolve the verified session to the universal player identity.
    const auth = await resolveAuthenticatedPlayer(request, "id");

    if (!auth.ok) {
      return Response.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const player = auth.player;

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

    // Validate answer using both language lists
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

    let isCorrect = acceptedAnswers.includes(normalizedAnswer);

    // Compatibility with older riddles
    if (acceptedAnswers.length === 0 && riddle.answer_hash) {
      const submittedHash = createHash("sha256")
        .update(normalizedAnswer)
        .digest("hex");

      isCorrect = submittedHash === riddle.answer_hash;
    }

    const hasGoogle = Boolean(auth.user && !auth.user.is_anonymous && (
      auth.user.app_metadata?.provider === "google" ||
      auth.user.app_metadata?.providers?.includes("google") ||
      auth.user.identities?.some((identity) => identity.provider === "google")
    ));
    if (!hasGoogle) {
      const attemptNumber = Math.min(3, Math.max(1, Number(body?.attemptNumber) || 1));
      return Response.json({
        correct: isCorrect,
        attempts: attemptNumber,
        attemptsLeft: isCorrect ? 0 : Math.max(0, 3 - attemptNumber),
        score: isCorrect ? Number(riddle.points || 0) : 0,
        completed: isCorrect,
        finished: isCorrect || attemptNumber >= 3,
        saved: false,
        guest: true,
      });
    }

    // Google accounts persist the attempt atomically in PostgreSQL.
    const { data: result, error: submitError } = await supabaseAdmin.rpc(
      "submit_riddle_attempt",
      {
        p_player_id: player.id,
        p_riddle_id: riddle.id,
        p_is_correct: isCorrect,
        p_base_points: riddle.points,
      }
    );

    if (submitError) throw submitError;

    return Response.json(result);

  } catch (error) {
    console.error("Answer API error:", error);

    return Response.json(
      { error: "Unable to check your answer." },
      { status: 500 }
    );
  }
}
