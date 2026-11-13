import { supabaseAdmin } from "@/lib/supabaseAdmin";

const fail=(error,status)=>Response.json({error},{status});

export async function POST(request,{params}) {
  try {
    const {id}=await params;
    const token=(request.headers.get("authorization")||"").replace(/^Bearer\\s+/i,"");
    if(!token) return fail("Sign in to publish.",401);
    const {data:auth,error:authError}=await supabaseAdmin.auth.getUser(token);
    if(authError||!auth?.user||auth.user.is_anonymous) return fail("Session expired.",401);
    const {data:invitation,error}=await supabaseAdmin.from("df_invitations").select("id,slug,title,owner_user_id").eq("id",id).maybeSingle();
    if(error) throw error;
    if(!invitation) return fail("Invitation not found.",404);
    if(invitation.owner_user_id!==auth.user.id) return fail("Not authorized.",403);
    const {data:profile,error:profileError}=await supabaseAdmin.from("df_wedding_profiles").select("*").eq("invitation_id",id).maybeSingle();
    if(profileError) throw profileError;
    if(!profile?.groom_name||!profile?.bride_name) return fail("Lengkapi nama kedua mempelai sebelum publikasi.",400);
    const {data:updated,error:updateError}=await supabaseAdmin.from("df_invitations").update({is_active:true,updated_at:new Date().toISOString()}).eq("id",id).eq("owner_user_id",auth.user.id).select("id,slug,title,is_active").single();
    if(updateError) throw updateError;
    return Response.json({invitation:updated});
  } catch(error) {
    console.error("Wedding publish:",error);
    return fail("Undangan belum berhasil dipublikasikan.",500);
  }
}
