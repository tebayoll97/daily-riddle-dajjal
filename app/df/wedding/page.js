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
    dashboard: "MY WEDDING DASHBOARD", create: "CREATE YOUR INVITATION", sample: "VIEW SAMPLE INVITATION", loginPrompt: "Sign in with your Google account to create and manage wedding invitations.", google: "CONTINUE WITH GOOGLE", loggingIn: "CONNECTING...", loginError: "Google sign-in could not be started.",
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
    dashboard: "DASHBOARD UNDANGAN SAYA", create: "BUAT UNDANGAN", sample: "LIHAT CONTOH UNDANGAN", loginPrompt: "Masuk menggunakan akun Google untuk membuat dan mengelola undangan pernikahan.", google: "LANJUTKAN DENGAN GOOGLE", loggingIn: "MENGHUBUNGKAN...", loginError: "Login Google belum dapat dimulai.",
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
  const [signedIn, setSignedIn] = useState(false);\n  const [busy, setBusy] = useState(false);\n  const [loginError, setLoginError] = useState("");
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) setSignedIn(!!data.session?.user && !data.session.user.is_anonymous); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session?.user && !session.user.is_anonymous));
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  async function handleGoogleLogin() {\n    if (busy) return;\n    setBusy(true); setLoginError("");\n    const { error } = await supabase.auth.signInWithOAuth({\n      provider: "google",\n      options: { redirectTo: window.location.origin + "/df/wedding", queryParams: { prompt: "select_account" } }\n    });\n    if (error) { setLoginError(error.message || t.loginError); setBusy(false); }\n  }\n\n  return <div className="df-main">
    <main className="wedding-page wedding-platform">
      <header className="wedding-topbar">
        <Link href="/df" className="wedding-back">♛ <span>{t.back}</span></Link>
        <div className="wedding-tools">
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
          <Link className="wedding-primary" href={signedIn ? "/df/wedding/dashboard" : "/login?next=%2Fdf%2Fwedding%2Fdashboard"}>{signedIn ? t.dashboard : t.create}</Link>
          <Link className="wedding-platform-secondary" href="/df/wedding=anak-dajjal-malika">{t.sample}</Link>
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
