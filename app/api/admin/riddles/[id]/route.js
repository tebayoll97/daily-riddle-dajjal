
import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request, { params }) {
  const auth = await verifyAdmin(request);

  if (!auth.authorized) {
    return Response.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

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

    if (!id) {
      return Response.json(
        { error: "Riddle ID is required." },
        { status: 400 }
      );
    }

    if (
      !riddle_date ||
      !question_en?.trim() ||
      !question_id?.trim() ||
      !hint_en?.trim() ||
      !hint_id?.trim()
    ) {
      return Response.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(answers_en) ||
      !Array.isArray(answers_id)
    ) {
      return Response.json(
        { error: "Invalid accepted answers." },
        { status: 400 }
      );
    }

    const cleanAnswersEn = answers_en
      .filter((answer) => typeof answer === "string")
      .map((answer) => answer.trim().toLowerCase())
      .filter(Boolean);

    const cleanAnswersId = answers_id
      .filter((answer) => typeof answer === "string")
      .map((answer) => answer.trim().toLowerCase())
      .filter(Boolean);

    if (
      cleanAnswersEn.length === 0 ||
      cleanAnswersId.length === 0
    ) {
      return Response.json(
        { error: "At least one accepted answer is required for each language." },
        { status: 400 }
      );
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

    const cleanPoints = Number(points);

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

    if (typeof is_active !== "boolean") {
      return Response.json(
        { error: "Invalid active status." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("riddles")
      .update({
        riddle_date,
        question_en: question_en.trim(),
        question_id: question_id.trim(),
        hint_en: hint_en.trim(),
        hint_id: hint_id.trim(),
        answers_en: [...new Set(cleanAnswersEn)],
        answers_id: [...new Set(cleanAnswersId)],
        points: cleanPoints,
        is_active,
        question: question_en.trim(),
        hint: hint_en.trim(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Update riddle error:", error);

      if (error.code === "23505") {
        return Response.json(
          { error: "A riddle already exists for this date." },
          { status: 409 }
        );
      }

      return Response.json(
        { error: "Failed to update riddle." },
        { status: 500 }
      );
    }

    if (!data) {
      return Response.json(
        { error: "Riddle not found." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      riddle: data,
    });
  } catch (error) {
    console.error("Update riddle API error:", error);

    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAdmin(request);

  if (!auth.authorized) {
    return Response.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "Riddle ID is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("riddles")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Delete riddle error:", error);

      if (error.code === "23503") {
        return Response.json(
          {
            error: "This riddle has existing player scores and cannot be deleted.",
          },
          { status: 409 }
        );
      }

      return Response.json(
        { error: "Failed to delete riddle." },
        { status: 500 }
      );
    }

    if (!data) {
      return Response.json(
        { error: "Riddle not found." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Riddle deleted successfully.",
    });
  } catch (error) {
    console.error("Delete riddle API error:", error);

    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
