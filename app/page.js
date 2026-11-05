
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "./components/LanguageProvider";

const translations = {
  en: {
    present: "DAJJAL & VEYLORA PRESENT",
    tagline: "One day. One riddle. One champion.",
    ready: "Are You Ready?",
    mystery: "A new mystery awaits you every day.",
    wait: "PLEASE WAIT...",
    play: "PLAY TODAY'S RIDDLE",
    global: "GLOBAL CHALLENGE • ALL SERVERS WELCOME",
    errorTitle: "SOMETHING WENT WRONG",
    error: "Unable to continue. Please try again.",
    close: "GOT IT",
    universe: "DAJJAL & VEYLORA GAMING UNIVERSE",
    explore: "ONE ACCOUNT. ONE PROFILE. MULTIPLE GAMES.",
  },
  id: {
    present: "DAJJAL & VEYLORA MEMPERSEMBAHKAN",
    tagline: "Satu hari. Satu teka-teki. Satu juara.",
    ready: "Apakah Kamu Siap?",
    mystery: "Misteri baru menantimu setiap hari.",
    wait: "MOHON TUNGGU...",
    play: "MAINKAN TEKA-TEKI HARI INI",
    global: "TANTANGAN GLOBAL • SEMUA SERVER DIPERSILAKAN",
    errorTitle: "TERJADI KESALAHAN",
    error: "Tidak dapat melanjutkan. Silakan coba lagi.",
    close: "MENGERTI",
    universe: "DAJJAL & VEYLORA GAMING UNIVERSE",
    explore: "SATU AKUN. SATU PROFIL. BERBAGAI PERMAINAN.",
  },
};

export default function Home() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  async function handlePlay() {
    if (loading) return;

    setLoading(true);

    try {
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const user = sessionData.session?.user;

      if (user) {
        const { data: player, error: playerError } =
          await supabase
            .from("players")
            .select("id")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (playerError) throw playerError;

        if (player) {
          router.push("/game");
        } else {
          router.push("/register");
        }
      } else {
        router.push("/register");
      }
    } catch (error) {
      console.error("Home play error:", error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080711] text-white flex flex-col items-center justify-center p-6">

      {/* Background Decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="absolute bottom-10 right-0 w-48 h-48 bg-indigo-600/10 blur-[90px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-xl w-full">

        {/* Brand */}
        <p className="text-purple-400 tracking-[0.35em] text-[10px] sm:text-xs mb-5 font-bold">
          {t.present}
        </p>

        <h1 className="text-4xl sm:text-6xl font-black tracking-wider leading-tight">
          THE DAILY
          <span className="block text-purple-500 drop-shadow-[0_0_18px_rgba(168,85,247,0.35)]">
            RIDDLE
          </span>
        </h1>

        <p className="text-gray-400 mt-5 text-sm">
          {t.tagline}
        </p>

        {/* Main Game Card */}
        <div className="relative mt-10 border border-purple-500/30 rounded-3xl p-7 sm:p-9 bg-gradient-to-b from-[#1c142b] to-[#100d19] shadow-[0_15px_60px_rgba(88,28,135,0.12)]">

          <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/70 to-transparent" />

          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl border border-purple-400/20 bg-purple-500/10 flex items-center justify-center shadow-[0_0_35px_rgba(168,85,247,0.12)]">
            <span className="text-5xl">🔮</span>
          </div>

          <p className="text-[10px] tracking-[0.3em] text-purple-400 font-bold mb-3">
            THE DAILY RIDDLE
          </p>

          <h2 className="text-xl sm:text-2xl font-black">
            {t.ready}
          </h2>

          <p className="text-gray-400 text-sm mt-3">
            {t.mystery}
          </p>

          <button
            onClick={handlePlay}
            disabled={loading}
            className="mt-8 w-full bg-purple-600 hover:bg-purple-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl py-4 font-bold tracking-wider shadow-lg shadow-purple-900/30"
          >
            {loading ? t.wait : t.play}
          </button>

          <p className="text-[9px] text-gray-500 tracking-widest mt-5">
            {t.global}
          </p>
        </div>

        {/* Universe Identity */}
        <div className="mt-10">
          <div className="w-16 h-px bg-purple-500/40 mx-auto mb-5" />

          <p className="text-purple-300/80 text-[10px] sm:text-xs font-bold tracking-[0.2em]">
            {t.universe}
          </p>

          <p className="text-gray-600 text-[9px] tracking-wider mt-2">
            {t.explore}
          </p>
        </div>
      </div>

      {/* Custom Error Popup */}
      {showError && (
        <div
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={() => setShowError(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="home-error-title"
            className="w-full max-w-sm rounded-2xl border border-purple-500/30 bg-[#151020] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
              <span className="text-2xl text-red-400">!</span>
            </div>

            <h2
              id="home-error-title"
              className="text-center font-black text-lg"
            >
              {t.errorTitle}
            </h2>

            <p className="text-center text-sm text-gray-400 mt-3 leading-relaxed">
              {t.error}
            </p>

            <button
              type="button"
              onClick={() => setShowError(false)}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] transition rounded-xl py-3 font-bold text-sm"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
