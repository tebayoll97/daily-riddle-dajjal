"use client";

import Link from "next/link";
import GameCharacter from "@/lib/GameCharacter";
import { useLanguage } from "./components/LanguageProvider";
import { useEffect, useState } from "react";

const translations = {
  en: {
    present: "WELCOME TO",
    title: "DAJJAL FAMILY",
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
    title: "DAJJAL FAMILY",
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
        setIsWelcomeCompact((current) => current ? window.scrollY > 12 : window.scrollY > 180);
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
    <main className="relative flex min-h-[75vh] flex-col items-center justify-center overflow-x-clip [overflow-anchor:none] bg-[#080711] px-5 py-16 text-white sm:min-h-[82vh]">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-600/10 blur-[100px]" />

      <div className="relative z-20 mx-auto w-full max-w-5xl">
        <section className="sticky z-30 mx-auto h-[220px] w-full text-center sm:h-[250px]" style={{ top: "120px" }}>
          <div className={`absolute left-1/2 top-0 mx-auto flex -translate-x-1/2 items-center justify-center rounded-2xl border border-purple-400/35 bg-[#100b20]/95 shadow-[0_0_28px_rgba(147,51,234,0.14)] backdrop-blur-xl transition-[width,height,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isWelcomeCompact ? "h-[66px] w-[calc(100vw-16px)] max-w-3xl rounded-xl px-3 sm:h-[72px]" : "h-[190px] w-[calc(100vw-36px)] max-w-3xl px-3 sm:h-[220px] sm:px-8"}`}>
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent sm:inset-x-8" />
            <div className={`absolute left-0 top-0 z-10 transition-all duration-500 ease-out ${isWelcomeCompact ? "left-1 top-1 scale-[0.46] opacity-100" : "-translate-x-1 -translate-y-5 scale-100 opacity-100 sm:-translate-x-3 sm:-translate-y-8"}`}>
              <GameCharacter character="dajjal" expression="smug" animation="idle" size={76} className="drop-shadow-[0_4px_12px_rgba(239,68,68,0.28)]" />
            </div>
            <div className={`absolute right-0 top-0 z-10 transition-all duration-500 ease-out ${isWelcomeCompact ? "right-1 top-1 scale-[0.46] opacity-100" : "translate-x-1 -translate-y-5 scale-100 opacity-100 sm:translate-x-3 sm:-translate-y-8"}`}>
              <GameCharacter character="veylora" expression="happy" animation="idle" size={76} className="drop-shadow-[0_4px_12px_rgba(192,132,252,0.28)]" />
            </div>
            <div className={`relative z-0 flex min-w-0 flex-col items-center justify-center text-center transition-all duration-500 ease-out ${isWelcomeCompact ? "w-full gap-0 px-12 sm:px-16" : "w-full gap-2"}`}>
              <p className={`font-black tracking-[0.24em] text-purple-300 transition-all duration-500 ${isWelcomeCompact ? "text-[7px] sm:text-[9px]" : "text-[8px] sm:text-xs"}`}>{t.present}</p>
              <h1 className={`welcome-title whitespace-nowrap font-black leading-tight tracking-tight transition-all duration-500 ${isWelcomeCompact ? "mt-0 text-[clamp(0.85rem,4.3vw,1.35rem)]" : "mt-1 text-[clamp(1.05rem,5.4vw,3rem)]"}`}>
                <span className="block text-white">DAJJAL FAMILY</span>
              </h1>
              <p className={`overflow-hidden whitespace-nowrap font-black text-purple-400 transition-all duration-300 ${isWelcomeCompact ? "max-h-0 scale-90 opacity-0" : "mt-1 max-h-12 scale-100 text-[clamp(1rem,5.1vw,2.75rem)] opacity-100"}`}>GAMING UNIVERSE</p>
            </div>
            <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent sm:inset-x-8" />
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
