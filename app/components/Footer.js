
"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { usePathname } from "next/navigation";

const translations = {
  en: {
    tagline: "One Account. One Profile. Multiple Games. One Universe.",
    home: "Home",
    play: "Games",
    ranking: "Ranking",
    profile: "Profile",
    copyright: "All rights reserved.",
    universe: "A WORLD OF GAMES. ONE UNIVERSE.",
  },
  id: {
    tagline: "Satu Akun. Satu Profil. Banyak Game. Satu Universe.",
    home: "Beranda",
    play: "Game",
    ranking: "Peringkat",
    profile: "Profil",
    copyright: "Hak cipta dilindungi.",
    universe: "DUNIA PERMAINAN. SATU SEMESTA.",
  },
};

export default function Footer() {
  const pathname = usePathname();
  const { language } = useLanguage();
  if (pathname?.startsWith("/mini-game")) return null;
  const t = translations[language] || translations.en;

  const navLinks = [
    { label: t.home, href: "/" },
    { label: t.play, href: "/games" },
    { label: t.ranking, href: "/leaderboard" },
    { label: t.profile, href: "/profile" },
  ];

  return (
    <footer className="relative border-t border-purple-500/20 bg-[#080711] mt-auto overflow-hidden">

      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-purple-600/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 py-10">

        <div className="flex flex-col items-center text-center gap-5">

          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-black tracking-[0.12em] text-white hover:opacity-80 transition"
          >
            DAJJAL <span className="text-purple-400">& VEYLORA</span>
          </Link>

          {/* Tagline */}
          <p className="text-gray-500 text-xs tracking-wide">
            {t.tagline}
          </p>

          {/* Character Links */}
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-purple-500/20 bg-purple-500/5">
            <Link
              href="/characters/dajjal"
              className="text-purple-300 hover:text-white transition font-bold text-sm"
            >
              †Ðαjjαし•†
            </Link>

            <span className="text-purple-500/50 text-xs">×</span>

            <Link
              href="/characters/veylora"
              className="text-purple-300 hover:text-white transition font-bold text-sm"
            >
              †Veyしorα•†
            </Link>
          </div>

          {/* Divider */}
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

          {/* Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-gray-400 hover:text-purple-300 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Universe Label */}
          <p className="text-[9px] tracking-[0.25em] text-purple-400/50 font-semibold mt-1">
            {t.universe}
          </p>

          {/* Copyright */}
          <p className="text-[10px] text-gray-600 mt-1">
            © 2026 DAJJAL FAMILY · GAMING UNIVERSE. {t.copyright}
          </p>

        </div>
      </div>
    </footer>
  );
}
