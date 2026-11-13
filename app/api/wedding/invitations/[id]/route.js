import { supabaseAdmin } from "@/lib/supabaseAdmin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail = (error, status) => Response.json({ error }, { status });

async function getOwner(request, invitationId) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
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
    const { data, error } = await supabaseAdmin.from("df_wedding_profiles").select("groom_name,bride_name,groom_parent_names,bride_parent_names,updated_at").eq("invitation_id", id).maybeSingle();
    if (error) throw error;
    return Response.json({ invitation: owner.invitation, profile: data || { groom_name: "", bride_name: "", groom_parent_names: "", bride_parent_names: "" } }, { headers: { "Cache-Control": "no-store" } });
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
    const fields = ["groom_name", "bride_name", "groom_parent_names", "bride_parent_names"];
    const profile = {};
    for (const field of fields) {
      const value = String(body[field] || "").trim().replace(/\s+/g, " ");
      const max = field.includes("parent") ? 180 : 80;
      if (value.length > max) return fail(`${field} is too long.`, 400);
      profile[field] = value;
    }
    if (!profile.groom_name || !profile.bride_name) return fail("Please enter both names.", 400);
    const { data, error } = await supabaseAdmin.from("df_wedding_profiles").upsert({ invitation_id: id, ...profile, updated_at: new Date().toISOString() }, { onConflict: "invitation_id" }).select("groom_name,bride_name,groom_parent_names,bride_parent_names,updated_at").single();
    if (error) throw error;
    return Response.json({ profile: data });
  } catch (error) {
    console.error("Wedding profile PATCH:", error);
    return fail("Unable to save the couple details.", 500);
  }
}
