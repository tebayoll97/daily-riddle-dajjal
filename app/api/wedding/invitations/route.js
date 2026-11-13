import { supabaseAdmin } from "@/lib/supabaseAdmin";

function jsonError(error, status) { return Response.json({ error }, { status }); }

async function getUser(request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(authorization.slice(7));
  if (error || !data?.user || data.user.is_anonymous) return null;
  return data.user;
}

export async function GET(request) {
  try {
    const user = await getUser(request);
    if (!user) return jsonError("Please sign in with your Dajjal Family account.", 401);
    const { data, error } = await supabaseAdmin.from("df_invitations").select("id,slug,title,is_active,created_at").eq("owner_user_id", user.id).order("created_at", { ascending: false });
    if (error) throw error;
    return Response.json({ invitations: data || [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Wedding invitation list error:", error);
    return jsonError("Unable to load your invitations.", 500);
  }
}

export async function POST(request) {
  try {
    const user = await getUser(request);
    if (!user) return jsonError("Please sign in with your Dajjal Family account.", 401);
    const body = await request.json().catch(() => ({}));
    const title = String(body.title || "").trim().replace(/\s+/g, " ");
    if (title.length < 3 || title.length > 100) return jsonError("Title must be between 3 and 100 characters.", 400);

    const { count, error: countError } = await supabaseAdmin.from("df_invitations").select("id", { count: "exact", head: true }).eq("owner_user_id", user.id);
    if (countError) throw countError;
    if ((count || 0) >= 3) return jsonError("You have reached the limit of 3 invitations for this account.", 409);

    const base = title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "wedding";
    const slug = `${base}-${crypto.randomUUID().slice(0, 8)}`;
    const { data, error } = await supabaseAdmin.from("df_invitations").insert({ title, slug, owner_user_id: user.id, is_active: false }).select("id,slug,title,is_active,created_at").single();
    if (error) throw error;
    return Response.json({ invitation: data }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Wedding invitation create error:", error);
    return jsonError("Unable to create the invitation. Please try again.", 500);
  }
}
