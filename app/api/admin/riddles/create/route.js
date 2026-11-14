
import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const auth = await verifyAdmin(request);

  if (!auth.authorized) {
    return Response.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const {
      riddle_date,
      question_en,
      question_id,
      hint_en,
      hint_id,
      answers_en,
      answers_id,
      points,
      is_active,
    } = body;

    if (
      typeof riddle_date !== "string" ||
      typeof question_en !== "string" ||
      typeof question_id !== "string" ||
      typeof hint_en !== "string" ||
      typeof hint_id !== "string" ||
      !question_en.trim() ||
      !question_id.trim() ||
      !hint_en.trim() ||
      !hint_id.trim()
    ) {
      return Response.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(answers_en) ||
      !Array.isArray(answers_id) ||
      answers_en.length === 0 ||
      answers_id.length === 0 ||
      answers_en.length > 30 ||
      answers_id.length > 30 ||
      answers_en.some((answer) => typeof answer !== "string") ||
      answers_id.some((answer) => typeof answer !== "string")
    ) {
      return Response.json(
        { error: "At least one accepted answer is required for each language." },
        { status: 400 }
      );
    }

    const cleanAnswersEn = answers_en
      .map((answer) => answer.trim().toLowerCase())
      .filter(Boolean);

    const cleanAnswersId = answers_id
      .map((answer) => answer.trim().toLowerCase())
      .filter(Boolean);

    if (
      cleanAnswersEn.length === 0 ||
      cleanAnswersId.length === 0 ||
      cleanAnswersEn.some((answer) => answer.length > 120) ||
      cleanAnswersId.some((answer) => answer.length > 120)
    ) {
      return Response.json(
        { error: "Accepted answers cannot be empty." },
        { status: 400 }
      );
    }

    if (question_en.length > 2000 || question_id.length > 2000 || hint_en.length > 500 || hint_id.length > 500) {
      return Response.json({ error: "Question or hint is too long." }, { status: 400 });
    }

    const parsedDate = new Date(`${riddle_date}T00:00:00Z`);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(riddle_date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== riddle_date
    ) {
      return Response.json(
        { error: "Invalid riddle date." },
        { status: 400 }
      );
    }

    const cleanPoints = Number(points ?? 100);

    if (
      !Number.isInteger(cleanPoints) ||
      cleanPoints < 1 ||
      cleanPoints > 1000
    ) {
      return Response.json(
        { error: "Points must be between 1 and 1000." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("riddles")
      .insert({
        riddle_date,
        question_en: question_en.trim(),
        question_id: question_id.trim(),
        hint_en: hint_en.trim(),
        hint_id: hint_id.trim(),
        answers_en: [...new Set(cleanAnswersEn)],
        answers_id: [...new Set(cleanAnswersId)],
        points: cleanPoints,
        is_active: is_active ?? true,
        question: question_en.trim(),
        hint: hint_en.trim(),
        answer_hash: "bilingual-answers",
      })
      .select()
      .single();

    if (error) {
      console.error("Create riddle error:", error);

      if (error.code === "23505") {
        return Response.json(
          { error: "A riddle already exists for this date." },
          { status: 409 }
        );
      }

      return Response.json(
        { error: "Failed to create riddle." },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      riddle: data,
    });
  } catch (error) {
    console.error("Create riddle API error:", error);

    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
