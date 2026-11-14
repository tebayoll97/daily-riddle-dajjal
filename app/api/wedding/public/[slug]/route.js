import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PUBLIC_PROFILE_FIELDS = [
  "groom_name",
  "bride_name",
  "event_date",
  "event_time",
  "venue",
  "event_schedule",
  "main_photo_url",
  "music_url",
  "gallery_urls",
  "rsvp_enabled",
  "guestbook_enabled",
].join(",");

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (typeof slug !== "string" || !slug.trim() || slug.length > 120) {
      return Response.json({ error: "Invitation not found." }, { status: 404 });
    }

    const { data: invitation, error } = await supabaseAdmin
      .from("df_invitations")
      .select("id,slug,title,is_active")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!invitation) {
      return Response.json({ error: "Invitation not found." }, { status: 404 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("df_wedding_profiles")
      .select(PUBLIC_PROFILE_FIELDS)
      .eq("invitation_id", invitation.id)
      .maybeSingle();

    if (profileError) throw profileError;

    return Response.json(
      { invitation, profile: profile || {} },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    console.error("Public wedding invitation:", error);
    return Response.json(
      { error: "Unable to load invitation." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
