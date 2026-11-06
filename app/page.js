"use client";

import Link from "next/link";
import GameCharacter from "./lib/GameCharacter";
import { useLanguage } from "./components/LanguageProvider";

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

  return (
    <main className="relative flex min-h-[75vh] flex-col items-center justify-center overflow-hidden bg-[#080711] px-5 py-16 text-white sm:min-h-[82vh]">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-600/10 blur-[100px]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        <p className="mb-5 text-[10px] font-bold tracking-[0.4em] text-purple-300 sm:text-xs">{t.present}</p>
        <div className="flex items-center justify-center gap-1 sm:gap-5">
          <div className="flex shrink-0 items-end justify-center">
            <GameCharacter character="dajjal" expression="smug" animation="idle" size={112} className="sm:!w-[176px] sm:!h-[176px]" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black leading-tight tracking-wide sm:text-6xl">
              {t.title}
              <span className="mt-2 block text-purple-400 drop-shadow-[0_0_22px_rgba(168,85,247,0.35)]">{t.accent}</span>
            </h1>
          </div>
          <div className="flex shrink-0 items-end justify-center">
            <GameCharacter character="veylora" expression="happy" animation="idle" size={112} className="sm:!w-[176px] sm:!h-[176px]" />
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-sm font-semibold tracking-wide text-gray-300 sm:text-base">{t.tagline}</p>
        <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-gray-500 sm:text-sm">{t.description}</p>

        <div className="mx-auto mt-9 flex max-w-sm flex-col gap-3 sm:flex-row sm:max-w-none sm:justify-center">
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
    </main>
  );
}
