
"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

const translations = {
  en: {
    tagline: "One day. One riddle. One champion.",
    home: "Home",
    play: "Play",
    ranking: "Ranking",
    profile: "Profile",
    copyright: "All rights reserved.",
  },
  id: {
    tagline: "Satu hari. Satu teka-teki. Satu juara.",
    home: "Beranda",
    play: "Main",
    ranking: "Peringkat",
    profile: "Profil",
    copyright: "Hak cipta dilindungi.",
  },
};

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <footer className="border-t border-purple-500/20 bg-[#080711] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex flex-col items-center text-center gap-4">

          {/* Website Logo */}
          <Link href="/" className="text-lg font-black tracking-wider">
            THE <span className="text-purple-400">DAILY RIDDLE</span>
          </Link>

          {/* Tagline */}
          <p className="text-gray-500 text-xs">
            {t.tagline}
          </p>

          {/* Character Profile Links */}
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link
              href="/characters/dajjal"
              className="text-purple-300 hover:text-purple-400 transition"
            >
              †Ðαjjαし•†
            </Link>

            <span className="text-gray-600">×</span>

            <Link
              href="/characters/veylora"
              className="text-purple-300 hover:text-purple-400 transition"
            >
              †Veyしorα•†
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <Link href="/" className="hover:text-purple-400 transition">
              {t.home}
            </Link>

            <Link href="/game" className="hover:text-purple-400 transition">
              {t.play}
            </Link>

            <Link href="/leaderboard" className="hover:text-purple-400 transition">
              {t.ranking}
            </Link>

            <Link href="/profile" className="hover:text-purple-400 transition">
              {t.profile}
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-[10px] text-gray-600 mt-2">
            © 2026 THE DAILY RIDDLE. {t.copyright}
          </p>

        </div>

      </div>
    </footer>
  );
}
