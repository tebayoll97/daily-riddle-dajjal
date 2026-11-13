"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import WeddingAccountControls from "./WeddingAccountControls";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";
import "../wedding-anak-dajjal/wedding.css";

const copy = {
  en: {
    back: "DAJJAL FAMILY UNIVERSE", eyebrow: "A BEAUTIFUL WAY TO CELEBRATE LOVE",
    title: "Your story deserves", accent: "a beautiful invitation.",
    intro: "Create a personal digital wedding invitation, share it with the people you love, and keep every special moment in one place.",
    dashboard: "MY WEDDING DASHBOARD", create: "CREATE YOUR INVITATION", sample: "VIEW SAMPLE INVITATION",
    loginPrompt: "Sign in with your Google account to create and manage wedding invitations.", google: "CONTINUE WITH GOOGLE", loggingIn: "CONNECTING...", loginError: "Google sign-in could not be started.", loginPrompt: "Sign in with your Google account to create and manage wedding invitations.", google: "CONTINUE WITH GOOGLE", loggingIn: "CONNECTING...", loginError: "Google sign-in could not be started.",
    limit: "One Dajjal Family account · Up to 3 invitations per account",
    steps: [
      ["01", "Choose your style", "Start with a visual theme and colors that reflect your celebration."],
      ["02", "Tell your story", "Add the couple, event details, photos, music, and personal touches."],
      ["03", "Share the moment", "Preview your invitation, publish it, and share its unique link."]
    ],
    footer: "DAJJAL FAMILY · WEDDING EXPERIENCES"
  },
  id: {
    back: "DAJJAL FAMILY UNIVERSE", eyebrow: "CARA INDAH MERAYAKAN CINTA",
    title: "Kisah istimewamu layak memiliki", accent: "undangan yang menawan.",
    intro: "Buat undangan pernikahan digital yang personal, bagikan kepada orang-orang tersayang, dan simpan setiap momen istimewa dalam satu tempat.",
    dashboard: "DASHBOARD UNDANGAN SAYA", create: "BUAT UNDANGAN", sample: "LIHAT CONTOH UNDANGAN",
    loginPrompt: "Masuk menggunakan akun Google untuk membuat dan mengelola undangan pernikahan.", google: "LANJUTKAN DENGAN GOOGLE", loggingIn: "MENGHUBUNGKAN...", loginError: "Login Google belum dapat dimulai.", loginPrompt: "Masuk menggunakan akun Google untuk membuat dan mengelola undangan pernikahan.", google: "LANJUTKAN DENGAN GOOGLE", loggingIn: "MENGHUBUNGKAN...", loginError: "Login Google belum dapat dimulai.",
    limit: "Satu akun Dajjal Family · Maksimal 3 undangan per akun",
    steps: [
      ["01", "Pilih gaya undangan", "Mulai dengan tema visual dan warna yang mencerminkan perayaanmu."],
      ["02", "Ceritakan kisah kalian", "Tambahkan nama pasangan, detail acara, foto, musik, dan sentuhan personal."],
      ["03", "Bagikan momen bahagia", "Lihat pratinjau, publikasikan undangan, lalu bagikan tautan uniknya."]
    ],
    footer: "DAJJAL FAMILY · WEDDING EXPERIENCES"
  }
};

export default function WeddingHomePage() {
  const { language, setLanguage } = useLanguage();
  const t = copy[language] || copy.en;
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) setSignedIn(!!data.session?.user && !data.session.user.is_anonymous); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session?.user && !session.user.is_anonymous));
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  async function handleGoogleLogin() {
    if (busy) return;
    setBusy(true);
    setLoginError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/df/wedding", queryParams: { prompt: "select_account" } }
    });
    if (error) { setLoginError(error.message || t.loginError); setBusy(false); }
  }

  return <div className="df-main">
    <main className="wedding-page wedding-platform">
      <header className="wedding-topbar">
        <Link href="/df" className="wedding-back">♛ <span>{t.back}</span></Link>
        <div className="wedding-tools">
          <WeddingAccountControls />
          <div className="wedding-lang" aria-label="Language">
            <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
            <button type="button" onClick={() => setLanguage("id")} aria-pressed={language === "id"}>ID</button>
          </div>
        </div>
      </header>
      <section className="wedding-opening wedding-platform-hero">
        <div className="opening-sparkle">✦　❧　✦</div>
        <p className="wedding-kicker">{t.eyebrow}</p>
        <h1>{t.title}<br/><em>{t.accent}</em></h1>
        <p className="wedding-intro">{t.intro}</p>
        <div className="wedding-platform-actions">
          {signedIn ? <>
            <Link className="wedding-primary" href="/df/wedding/dashboard">{t.dashboard}</Link>
            <Link className="wedding-platform-secondary" href="/df/wedding/create">{t.create}</Link>
            <Link className="wedding-platform-secondary" href="/df/wedding=anak-dajjal-malika">{t.sample}</Link>
          </> : <div className="wedding-google-login-wrap">
            <p className="wedding-login-prompt">{t.loginPrompt}</p>
            <button type="button" className="wedding-google-login" onClick={handleGoogleLogin} disabled={busy}>
              <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 37.95 46.98 31.75 46.98 24.55z"/><path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.93-5.8l-7.73-6c-2.14 1.45-4.87 2.3-8.2 2.3-6.55 0-12.07-4.22-14.04-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="#FBBC05" d="M10.04 28.59A14.4 14.4 0 0 1 9.27 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78l7.48-6.19z"/><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.06 13.22l7.98 6.19C11.93 13.72 17.45 9.5 24 9.5z"/></svg>
              {busy ? t.loggingIn : t.google}
            </button>
            {loginError && <p className="wedding-login-error" role="alert">{loginError}</p>}
          </div>}
        </div>
        <p className="opening-footnote">{t.limit}</p>
      </section>
      <section className="wedding-platform-steps">
        {t.steps.map(([number, title, description]) => <article className="wedding-section" key={number}>
          <span className="wedding-platform-number">{number}</span>
          <h2 className="wedding-section-heading">{title}</h2>
          <p className="section-copy">{description}</p>
        </article>)}
      </section>
      <footer className="wedding-footer"><span>✧</span><strong>{t.footer}</strong></footer>
    </main>
  </div>;
}
