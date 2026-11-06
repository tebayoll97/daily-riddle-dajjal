
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
        item.trim().toLowerCase().replace(/\\s+/g, " ")
      );

    let isCorrect = acceptedAnswers.includes(normalizedAnswer);

    // Compatibility with older riddles
    if (acceptedAnswers.length === 0 && riddle.answer_hash) {
      const submittedHash = createHash("sha256")
        .update(normalizedAnswer)
        .digest("hex");

      isCorrect = submittedHash === riddle.answer_hash;
    }

    // Persist the attempt atomically in PostgreSQL.
    // The database function serializes concurrent submissions per player/riddle.
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
