"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "./LanguageProvider";

export default function AccountEntry() {
  const { language } = useLanguage();
  const isID = language === "id";
  const [status, setStatus] = useState("checking");
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    let active = true;
    async function syncAccount(session) {
      if (!session?.user) {
        if (active) { setPlayer(null); setStatus("signed-out"); }
        return;
      }
      if (active) setStatus("loading");
      try {
        const { data, error } = await supabase.from("players")
          .select("nickname, avatar_url")
          .eq("auth_user_id", session.user.id).maybeSingle();
        if (error) throw error;
        if (active) { setPlayer(data || null); setStatus("signed-in"); }
      } catch (error) {
        console.error("Account menu profile lookup failed:", error);
        if (active) { setPlayer(null); setStatus("signed-in"); }
      }
    }
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) { console.error("Account session check failed:", error); if (active) setStatus("signed-out"); return; }
      syncAccount(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        if (active) { setPlayer(null); setStatus("signed-out"); }
        return;
      }
      if (["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) {
        Promise.resolve().then(() => syncAccount(session));
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const label = status === "checking" || status === "loading"
    ? (isID ? "Memeriksa..." : "Checking...")
    : status === "signed-in"
      ? (player?.nickname || (isID ? "Profil Saya" : "My Profile"))
      : (isID ? "Masuk" : "Log in");
  const href = status === "signed-in" ? "/profile" : "/login?next=%2Fprofile";
  const initials = (player?.nickname || "U").trim().charAt(0).toUpperCase();

  return <Link href={href} aria-label={status === "signed-in" ? (isID ? "Buka profil" : "Open profile") : label} title={label}
    className="inline-flex min-w-10 h-10 items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-2.5 text-sm font-semibold text-purple-200 transition hover:border-purple-400/60 hover:bg-purple-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
    {player?.avatar_url ? <img src={player.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" /> :
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-xs font-black" aria-hidden="true">{status === "signed-in" ? initials : "♙"}</span>}
    <span className="hidden max-w-36 truncate text-xs sm:inline">{label}</span>
  </Link>;
}
