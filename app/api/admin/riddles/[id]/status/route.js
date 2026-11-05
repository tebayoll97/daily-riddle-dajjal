
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

    if (!id) {
      return Response.json(
        { error: "Riddle ID is required." },
        { status: 400 }
      );
    }

    if (typeof body.is_active !== "boolean") {
      return Response.json(
        { error: "Invalid status value." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("riddles")
      .update({
        is_active: body.is_active,
      })
      .eq("id", id)
      .select("id, riddle_date, is_active")
      .maybeSingle();

    if (error) {
      console.error("Update riddle status error:", error);

      return Response.json(
        { error: "Failed to update riddle status." },
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
      message: data.is_active
        ? "Riddle activated successfully."
        : "Riddle deactivated successfully.",
    });
  } catch (error) {
    console.error("Riddle status API error:", error);

    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
