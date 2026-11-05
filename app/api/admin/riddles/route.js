
import { verifyAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const auth = await verifyAdmin(request);

  if (!auth.authorized) {
    return Response.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("riddles")
      .select(`
        id,
        riddle_date,
        question_en,
        question_id,
        hint_en,
        hint_id,
        answers_en,
        answers_id,
        points,
        is_active,
        created_at
      `)
      .order("riddle_date", { ascending: false });

    if (error) {
      console.error("Fetch riddles error:", error);

      return Response.json(
        { error: "Failed to load riddles." },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      riddles: data || [],
    });
  } catch (error) {
    console.error("Admin riddles API error:", error);

    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
