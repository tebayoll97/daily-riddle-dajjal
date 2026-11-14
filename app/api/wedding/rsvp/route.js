import { supabaseAdmin } from "@/lib/supabaseAdmin";

function validOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    if (!validOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
    const body = await request.json();
    if (body?.website) return Response.json({ ok: true });
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    const guestName = typeof body?.guest_name === "string" ? body.guest_name.trim() : "";
    const invitedName = typeof body?.invited_name === "string" ? body.invited_name.trim() : "";
    const guestCount = Number(body?.guest_count);
    const attendance = body?.attendance;
    const language = body?.language === "id" ? "id" : "en";
    if (!slug || slug.length > 120 || guestName.length < 1 || guestName.length > 100 ||
        invitedName.length > 100 || !Number.isInteger(guestCount) || guestCount < 1 ||
        guestCount > 10 || !["yes", "no"].includes(attendance)) {
      return Response.json({ error: "Invalid RSVP details." }, { status: 400 });
    }
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("df_invitations").select("id").eq("slug", slug).eq("is_active", true).maybeSingle();
    if (invitationError) throw invitationError;
    if (!invitation) return Response.json({ error: "Invitation not found." }, { status: 404 });
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("df_wedding_profiles").select("rsvp_enabled").eq("invitation_id", invitation.id).maybeSingle();
    if (profileError) throw profileError;
    if (profile?.rsvp_enabled !== true) return Response.json({ error: "RSVP is disabled." }, { status: 403 });
    const { error } = await supabaseAdmin.from("df_rsvps").insert({
      invitation_id: invitation.id, guest_name: guestName, invited_name: invitedName || null,
      guest_count: guestCount, attendance, language,
    });
    if (error) throw error;
    return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Wedding RSVP submission:", error);
    return Response.json({ error: "Unable to submit RSVP." }, { status: 500 });
  }
}
