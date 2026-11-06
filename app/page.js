"use client";

import Link from "next/link";
import GameCharacter from "@/lib/GameCharacter";
import { useLanguage } from "./components/LanguageProvider";
import { useEffect, useState } from "react";

const translations = {
  en: {
    present: "WELCOME TO",
    title: "DAJJAL & VEYLORA",
    accent: "GAMING UNIVERSE",
    tagline: "One Account. One Profile. Multiple Games. One Universe.",
    description: "Enter a growing world of mini-games, daily challenges, puzzles, and adventures. One identity connects every experience.",
    explore: "EXPLORE GAMES",
    discover: "DISCOVER THE UNIVERSE",
    daily: "DAILY CHALLENGES",
    puzzles: "PUZZLE WORLDS",
    competition: "GLOBAL COMPETITION",
    account: "ONE PLAYER IDENTITY",
    footer: "YOUR NEXT ADVENTURE STARTS HERE",
  },
  id: {
    present: "SELAMAT DATANG DI",
    title: "DAJJAL & VEYLORA",
    accent: "GAMING UNIVERSE",
    tagline: "Satu Akun. Satu Profil. Banyak Game. Satu Universe.",
    description: "Masuki dunia mini-game, tantangan harian, puzzle, dan petualangan yang terus berkembang. Satu identitas menghubungkan setiap pengalaman bermainmu.",
    explore: "JELAJAHI GAME",
    discover: "TEMUKAN UNIVERSE",
    daily: "TANTANGAN HARIAN",
    puzzles: "DUNIA PUZZLE",
    competition: "KOMPETISI GLOBAL",
    account: "SATU IDENTITAS PEMAIN",
    footer: "PETUALANGAN BARUMU DIMULAI DI SINI",
  },
};

const features = [
  { icon: "✦", key: "daily" },
  { icon: "◇", key: "puzzles" },
  { icon: "♛", key: "competition" },
  { icon: "♙", key: "account" },
];

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [isWelcomeCompact, setIsWelcomeCompact] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setIsWelcomeCompact((current) => current ? window.scrollY > 30 : window.scrollY > 84);
        frame = 0;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <main className="relative flex min-h-[75vh] flex-col items-center justify-center overflow-x-clip bg-[#080711] px-5 py-16 text-white sm:min-h-[82vh]">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-600/10 blur-[100px]" />

      <div className="relative z-20 mx-auto w-full max-w-5xl">
        <section className="sticky z-30 mx-auto text-center" style={{ top: "var(--site-header-height, 180px)" }}>
          <div className={`relative mx-auto flex w-full max-w-3xl items-center justify-center rounded-2xl border border-purple-400/35 bg-[#100b20]/95 shadow-[0_0_28px_rgba(147,51,234,0.14)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isWelcomeCompact ? "min-h-[76px] px-16 py-2 sm:min-h-[88px] sm:px-24" : "mt-5 min-h-[190px] px-16 py-7 sm:min-h-[220px] sm:px-28 sm:py-9"}`}>
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
            <div className={`absolute left-0 z-10 transition-all duration-500 ease-out ${isWelcomeCompact ? "-top-2 -left-1 scale-[0.62] sm:scale-75" : "-top-7 -left-2 scale-100 sm:-top-9 sm:-left-4"}`}>
              <GameCharacter character="dajjal" expression="smug" animation="idle" size={76} className="drop-shadow-[0_4px_12px_rgba(239,68,68,0.28)]" />
            </div>
            <div className={`absolute right-0 z-10 transition-all duration-500 ease-out ${isWelcomeCompact ? "-top-2 -right-1 scale-[0.62] sm:scale-75" : "-top-7 -right-2 scale-100 sm:-top-9 sm:-right-4"}`}>
              <GameCharacter character="veylora" expression="happy" animation="idle" size={76} className="drop-shadow-[0_4px_12px_rgba(192,132,252,0.28)]" />
            </div>
            <div className="relative z-0 min-w-0">
              <p className={`font-black tracking-[0.28em] text-purple-300 transition-all duration-500 ${isWelcomeCompact ? "text-[8px] sm:text-[9px]" : "text-[10px] sm:text-xs"}`}>{t.present}</p>
              <h1 className={`mt-2 font-black leading-tight tracking-wide transition-all duration-500 ${isWelcomeCompact ? "text-sm sm:text-xl" : "text-2xl sm:text-5xl"}`}>
                <span className="block text-white">{t.title}</span>
                <span className="block text-purple-400 drop-shadow-[0_0_18px_rgba(168,85,247,0.4)]">{t.accent}</span>
              </h1>
            </div>
            <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          </div>
        </section>

        <div className="mx-auto mt-8 text-center sm:mt-10">
          <p className="mx-auto max-w-2xl text-sm font-semibold tracking-wide text-gray-300 sm:text-base">{t.tagline}</p>
          <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-gray-500 sm:text-sm">{t.description}</p>
          <div className="mx-auto mt-9 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href="/games" className="rounded-xl bg-purple-600 px-8 py-4 text-xs font-black tracking-widest shadow-lg shadow-purple-900/30 transition hover:bg-purple-500 active:scale-[0.98]">{t.explore}</Link>
            <Link href="/games" className="rounded-xl border border-purple-400/30 bg-purple-500/5 px-8 py-4 text-xs font-bold tracking-widest text-purple-200 transition hover:bg-purple-500/10 active:scale-[0.98]">{t.discover}</Link>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.key} className="rounded-2xl border border-purple-500/15 bg-white/[0.025] px-4 py-5">
                <span className="text-xl text-purple-300">{feature.icon}</span>
                <p className="mt-3 text-[9px] font-bold tracking-[0.13em] text-gray-400">{t[feature.key]}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-[9px] font-semibold tracking-[0.3em] text-purple-400/60">{t.footer}</p>
        </div>
      </div>
    </main>
  );
}
