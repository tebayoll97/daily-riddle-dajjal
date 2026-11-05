
import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function verifyAdmin(request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return {
        authorized: false,
        status: 401,
        error: "Unauthorized.",
      };
    }

    const token = authorization.slice(7);

    // Verify Supabase user session
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      return {
        authorized: false,
        status: 401,
        error: "Invalid session.",
      };
    }

    // Verify admin registration
    const { data: admin, error: adminError } =
      await supabaseAdmin
        .from("admin_users")
        .select("user_id")
        .eq("user_id", authData.user.id)
        .maybeSingle();

    if (adminError) {
      console.error("Admin verification error:", adminError);

      return {
        authorized: false,
        status: 500,
        error: "Unable to verify administrator.",
      };
    }

    if (!admin) {
      return {
        authorized: false,
        status: 403,
        error: "Access denied. Admin privileges required.",
      };
    }

    return {
      authorized: true,
      user: authData.user,
    };

  } catch (error) {
    console.error("Admin authentication error:", error);

    return {
      authorized: false,
      status: 500,
      error: "Internal server error.",
    };
  }
}
