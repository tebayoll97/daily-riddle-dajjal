"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "../components/LanguageProvider";

const translations = {
  en: {
    eyebrow: "THE GAME LIBRARY",
    title: "CHOOSE YOUR",
    accent: "ADVENTURE",
    description: "Discover different worlds, challenge your mind, and build your journey in one gaming universe.",
    available: "AVAILABLE NOW",
    daily: "THE DAILY RIDDLE",
    dailyDesc: "A fresh mystery. Test your knowledge, solve the clues, and compete for points.",
    play: "PLAY NOW",
    soon: "COMING SOON",
    rune: "RUNE PUZZLE",
    runeDesc: "Decode ancient symbols and uncover the secrets hidden in the runes.",
    memory: "MEMORY CHALLENGE",
    memoryDesc: "Train your memory, sharpen your focus, and beat your best time.",
    logic: "LOGIC BATTLE",
    logicDesc: "Face clever challenges and prove your strategic thinking.",
    wait: "PLEASE WAIT...",
    errorTitle: "SOMETHING WENT WRONG",
    error: "Unable to continue. Please try again.",
    close: "GOT IT",
  },
  id: {
    eyebrow: "PERPUSTAKAAN PERMAINAN",
    title: "PILIH",
    accent: "PETUALANGANMU",
    description: "Jelajahi dunia yang berbeda, tantang pikiranmu, dan bangun perjalananmu dalam satu universe gaming.",
    available: "SUDAH TERSEDIA",
    daily: "THE DAILY RIDDLE",
    dailyDesc: "Misteri baru setiap hari. Uji pengetahuan, pecahkan petunjuk, dan kumpulkan poin.",
    play: "MAIN SEKARANG",
    soon: "SEGERA HADIR",
    rune: "RUNE PUZZLE",
    runeDesc: "Pecahkan simbol kuno dan temukan rahasia yang tersembunyi di dalam rune.",
    memory: "MEMORY CHALLENGE",
    memoryDesc: "Latih ingatan, tingkatkan fokus, dan pecahkan rekor waktumu.",
    logic: "LOGIC BATTLE",
    logicDesc: "Hadapi tantangan cerdas dan buktikan kemampuan strategimu.",
    wait: "MOHON TUNGGU...",
    errorTitle: "TERJADI KESALAHAN",
    error: "Tidak dapat melanjutkan. Silakan coba lagi.",
    close: "MENGERTI",
  },
};

export default function GamesPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  async function handlePlayDailyRiddle() {
    if (loading) return;
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const user = sessionData.session?.user;
      if (user) {
        const { data: player, error: playerError } = await supabase
          .from("players")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();
        if (playerError) throw playerError;
        router.push(player ? "/game" : "/register");
      } else {
        router.push("/register");
      }
    } catch (error) {
      console.error("Daily Riddle launch error:", error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }

  const games = [
    { key: "rune", icon: "ᚱ", name: t.rune, description: t.runeDesc },
    { key: "memory", icon: "◈", name: t.memory, description: t.memoryDesc },
    { key: "logic", icon: "✧", name: t.logic, description: t.logicDesc },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080711] text-white px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[100px]" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-9 text-center">
          <p className="mb-3 text-[10px] font-bold tracking-[0.35em] text-purple-400">{t.eyebrow}</p>
          <h1 className="text-3xl font-black tracking-wide sm:text-5xl">
            {t.title} <span className="text-purple-400">{t.accent}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-400">{t.description}</p>
        </div>

        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <h2 className="text-[10px] font-bold tracking-[0.25em] text-emerald-300">{t.available}</h2>
          </div>
          <article className="relative overflow-hidden rounded-3xl border border-purple-400/30 bg-gradient-to-br from-[#241638] via-[#171024] to-[#100d19] p-6 shadow-[0_15px_60px_rgba(88,28,135,0.13)] sm:p-9">
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-purple-500/15 blur-3xl" />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-purple-300">01 · {t.available}</p>
                <h2 className="text-2xl font-black sm:text-3xl">{t.daily}</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">{t.dailyDesc}</p>
              </div>
              <button onClick={handlePlayDailyRiddle} disabled={loading} className="w-full shrink-0 rounded-xl bg-purple-600 px-7 py-4 text-sm font-black tracking-wider shadow-lg shadow-purple-900/30 transition hover:bg-purple-500 active:scale-[0.98] disabled:opacity-50 sm:w-auto">
                {loading ? t.wait : t.play}
              </button>
            </div>
          </article>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gray-500" />
            <h2 className="text-[10px] font-bold tracking-[0.25em] text-gray-400">{t.soon}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {games.map((game, index) => (
              <article key={game.key} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-2xl text-purple-300">{game.icon}</div>
                <p className="mb-2 text-[9px] font-bold tracking-[0.2em] text-gray-500">0{index + 2} · {t.soon}</p>
                <h3 className="text-base font-black">{game.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">{game.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {showError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm" onClick={() => setShowError(false)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="games-error-title" className="w-full max-w-sm rounded-2xl border border-purple-500/30 bg-[#151020] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.6)]" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-2xl text-red-400">!</div>
            <h2 id="games-error-title" className="text-center text-lg font-black">{t.errorTitle}</h2>
            <p className="mt-3 text-center text-sm text-gray-400">{t.error}</p>
            <button onClick={() => setShowError(false)} className="mt-6 w-full rounded-xl bg-purple-600 py-3 text-sm font-bold transition hover:bg-purple-500">{t.close}</button>
          </div>
        </div>
      )}
    </main>
  );
}
