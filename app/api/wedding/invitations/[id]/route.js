import { supabaseAdmin } from "@/lib/supabaseAdmin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail = (error, status) => Response.json({ error }, { status });
const columns = [
  "groom_name","bride_name","groom_parent_names","bride_parent_names",
  "event_date","event_time","event_type","venue","address","maps_url",
  "event_schedule","theme_name","theme_color","main_photo_url","music_url",
  "gallery_urls","love_story","rsvp_enabled","guestbook_enabled","gift_info","draft_step"
];

async function getOwner(request, invitationId) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\\s+/i, "");
  if (!token) return { error: "Sign in to continue.", status: 401 };
  const { data: auth, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !auth?.user || auth.user.is_anonymous) return { error: "Your session has expired. Please sign in again.", status: 401 };
  const { data: invitation, error } = await supabaseAdmin.from("df_invitations").select("id,title,slug,owner_user_id,is_active").eq("id", invitationId).maybeSingle();
  if (error) throw error;
  if (!invitation) return { error: "Invitation not found.", status: 404 };
  if (invitation.owner_user_id !== auth.user.id) return { error: "You do not have permission to edit this invitation.", status: 403 };
  return { user: auth.user, invitation };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!UUID.test(id)) return fail("Invalid invitation ID.", 400);
    const owner = await getOwner(request, id);
    if (owner.error) return fail(owner.error, owner.status);
    const { data, error } = await supabaseAdmin.from("df_wedding_profiles").select(columns.join(",")).eq("invitation_id", id).maybeSingle();
    if (error) throw error;
    return Response.json({ invitation: owner.invitation, profile: data || {} }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Wedding profile GET:", error);
    return fail("Unable to load invitation details.", 500);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!UUID.test(id)) return fail("Invalid invitation ID.", 400);
    const owner = await getOwner(request, id);
    if (owner.error) return fail(owner.error, owner.status);
    const body = await request.json().catch(() => ({}));
    const profile = {};
    const textLimits = {
      groom_name:80, bride_name:80, groom_parent_names:180, bride_parent_names:180,
      event_time:80, event_type:40, venue:180, address:500, maps_url:1000,
      theme_name:60, theme_color:40, main_photo_url:1500, music_url:1500,
      love_story:5000, gift_info:2000
    };
    for (const [field, max] of Object.entries(textLimits)) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const value = String(body[field] ?? "").trim();
        if (value.length > max) return fail(`${field} is too long.`, 400);
        profile[field] = value;
      }
    }
    if (Object.prototype.hasOwnProperty.call(body, "event_date")) {
      const value = String(body.event_date || "");
      if (value && !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return fail("Invalid event date.", 400);
      profile.event_date = value || null;
    }
    for (const field of ["event_schedule", "gallery_urls"]) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        if (!Array.isArray(body[field]) || body[field].length > 100) return fail(`Invalid ${field}.`, 400);
        profile[field] = body[field].map(item => String(item).trim()).filter(Boolean).slice(0, 100);
      }
    }
    for (const field of ["rsvp_enabled", "guestbook_enabled"]) {
      if (Object.prototype.hasOwnProperty.call(body, field)) profile[field] = Boolean(body[field]);
    }
    if (Object.prototype.hasOwnProperty.call(body, "draft_step")) {
      const step = Number(body.draft_step);
      if (!Number.isInteger(step) || step < 0 || step > 6) return fail("Invalid builder step.", 400);
      profile.draft_step = step;
    }
    const { data, error } = await supabaseAdmin.from("df_wedding_profiles")
      .upsert({ invitation_id: id, ...profile, updated_at: new Date().toISOString() }, { onConflict: "invitation_id" })
      .select(columns.join(",")).single();
    if (error) throw error;
    return Response.json({ profile: data });
  } catch (error) {
    console.error("Wedding profile PATCH:", error);
    return fail("Unable to save your draft. Please try again.", 500);
  }
}
