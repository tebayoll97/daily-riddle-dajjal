"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import GameCharacter from "@/lib/GameCharacter";
import { useLanguage } from "../components/LanguageProvider";

function isGoogleUser(user) {
  return user?.app_metadata?.provider === "google" ||
    (user?.app_metadata?.providers || []).includes("google") ||
    (user?.identities || []).some((identity) => identity.provider === "google");
}

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isID = language === "id";
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function getNextPath() {
    const value = new URLSearchParams(window.location.search).get("next") || "/games";
    return value.startsWith("/") && !value.startsWith("//") ? value : "/games";
  }

  useEffect(() => {
    let active = true;

    async function finishLogin() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) {
          if (active) setLoading(false);
          return;
        }

        if (!isGoogleUser(session.user) || session.user.is_anonymous) {
          if (active) {
            setError(isID
              ? "Silakan gunakan akun Google untuk melanjutkan."
              : "Please use a Google account to continue.");
            setLoading(false);
          }
          return;
        }

        const response = await fetch("/api/player/ensure", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to prepare player profile.");

        if (active) router.replace(getNextPath());
      } catch (err) {
        console.error("Login completion error:", err);
        if (active) {
          setError(err.message || (isID ? "Login gagal." : "Login failed."));
          setLoading(false);
        }
      }
    }

    finishLogin();
    return () => { active = false; };
  }, [router, isID]);

  async function handleGoogleLogin() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const options = {
        redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(getNextPath())}`,
        queryParams: { prompt: "select_account" },
      };

      if (session?.user?.is_anonymous) {
        const { error: linkError } = await supabase.auth.linkIdentity({
          provider: "google",
          options,
        });
        if (linkError) throw linkError;
        return;
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options,
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message || "Google login failed.");
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-[65vh] flex flex-col items-center justify-center gap-3 bg-[#080711] text-purple-200">
        <GameCharacter character="veylora" expression="thinking" animation="float" size={76} />
        <p className="text-xs tracking-[.2em] animate-pulse">{isID ? "MEMERIKSA AKUN..." : "CHECKING ACCOUNT..."}</p>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-[#080711] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-3xl border border-purple-500/30 bg-[#151020] p-7 text-center shadow-2xl ui-card">
        <p className="text-[10px] font-bold tracking-[.3em] text-purple-300">DAJJAL FAMILY · GAMING UNIVERSE</p>
        <h1 className="mt-4 text-3xl font-black ui-title">{isID ? "MASUK KE UNIVERSE" : "ENTER THE UNIVERSE"}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          {isID
            ? "Satu akun Google untuk semua game utama. Akun pemain baru akan dibuat otomatis."
            : "One Google account for all main games. New player accounts are created automatically."}
        </p>
        <button type="button" onClick={handleGoogleLogin} disabled={busy}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 font-bold text-gray-900 transition hover:bg-gray-100 disabled:opacity-50">
          <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.06 13.22l7.98 6.19C11.93 13.72 17.45 9.5 24 9.5z" transform="translate(0 4)"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 37.95 46.98 31.75 46.98 24.55z"/>
            <path fill="#FBBC05" d="M10.04 28.59A14.4 14.4 0 0 1 9.27 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78l7.48-6.19z" transform="translate(0 4)"/>
            <path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.93-5.8l-7.73-6c-2.14 1.45-4.87 2.3-8.2 2.3-6.55 0-12.07-4.22-14.04-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48z" transform="translate(0 -4)"/>
          </svg>
          {busy ? (isID ? "MENGHUBUNGKAN..." : "CONNECTING...") : (isID ? "LANJUTKAN DENGAN GOOGLE" : "CONTINUE WITH GOOGLE")}
        </button>
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        <Link href="/" className="mt-6 inline-block text-xs text-gray-500 hover:text-purple-300">{isID ? "KEMBALI KE BERANDA" : "BACK TO HOME"}</Link>
      </section>
    </main>
  );
}
