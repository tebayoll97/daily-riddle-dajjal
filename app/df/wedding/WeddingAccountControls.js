"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function WeddingAccountControls() {
  const router = useRouter();
  const { language } = useLanguage();
  const isID = language === "id";
  const [email, setEmail] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setEmail(data.session?.user && !data.session.user.is_anonymous ? data.session.user.email || "" : "");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setEmail(session?.user && !session.user.is_anonymous ? session.user.email || "" : "");
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  async function confirmLogout() {
    if (busy) return;
    setBusy(true);
    setError("");
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message || (isID ? "Tidak dapat keluar dari akun." : "Unable to sign out."));
      setBusy(false);
      return;
    }
    setShowConfirm(false);
    router.replace("/df/wedding");
    router.refresh();
  }

  if (!email) return null;

  return <>
    <div className="wedding-account-controls">
      <span className="wedding-account-email" title={email}>{email}</span>
      <button type="button" className="wedding-account-logout" onClick={() => { setError(""); setShowConfirm(true); }}>
        {isID ? "Keluar akun" : "Log out"}
      </button>
    </div>
    {showConfirm && <div className="wedding-logout-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setShowConfirm(false); }}>
      <section className="wedding-logout-modal" role="dialog" aria-modal="true" aria-labelledby="wedding-logout-title">
        <span className="wedding-logout-flower">✿</span>
        <p className="wedding-kicker">{isID ? "KONFIRMASI AKUN" : "ACCOUNT CONFIRMATION"}</p>
        <h2 id="wedding-logout-title">{isID ? "Keluar dari akun?" : "Log out of your account?"}</h2>
        <p>{isID ? "Kamu akan keluar dari akun Dajjal Family yang digunakan bersama oleh Game dan Wedding." : "You will sign out of the shared Dajjal Family account used by Game and Wedding."}</p>
        {error && <p className="wedding-logout-error" role="alert">{error}</p>}
        <div className="wedding-logout-actions">
          <button type="button" className="wedding-logout-cancel" disabled={busy} onClick={() => setShowConfirm(false)}>{isID ? "Tidak, batal" : "No, stay"}</button>
          <button type="button" className="wedding-logout-confirm" disabled={busy} onClick={confirmLogout}>{busy ? (isID ? "MEMPROSES..." : "PLEASE WAIT...") : (isID ? "Ya, keluar" : "Yes, log out")}</button>
        </div>
      </section>
    </div>}
  </>;
}
