
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "./LanguageProvider";

const translations = {
  en: {
    home: "Home",
    play: "Play",
    ranking: "Ranking",
    profile: "Profile",
    admin: "Admin Dashboard",
  },
  id: {
    home: "Beranda",
    play: "Main",
    ranking: "Peringkat",
    profile: "Profil",
    admin: "Dashboard Admin",
  },
};

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => {
    let active = true;

    async function checkAdmin(session) {
      if (!session?.access_token) {
        if (active) setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch("/api/admin/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (active) {
          setIsAdmin(response.ok && result.success === true);
        }
      } catch (error) {
        console.error("Admin check failed:", error);

        if (active) setIsAdmin(false);
      }
    }

    async function initialize() {
      const {
        data: { session },
      } = await supabaseAdminClient.auth.getSession();

      await checkAdmin(session);
    }

    initialize();

    const {
      data: { subscription },
    } = supabaseAdminClient.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setIsAdmin(false);
          return;
        }

        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          checkAdmin(session);
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: t.home, href: "/", icon: "⌂" },
    { name: t.play, href: "/game", icon: "✦" },
    { name: t.ranking, href: "/leaderboard", icon: "♛" },
    { name: t.profile, href: "/profile", icon: "◉" },
  ];

  if (isAdmin) {
    navLinks.push({
      name: t.admin,
      href: "/admin",
      icon: "⚙",
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-[#080711]/95 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative flex flex-col items-center py-4">
          <Link href="/" className="flex flex-col items-center">
            <h1 className="text-lg font-black tracking-wider text-white">
              THE <span className="text-purple-400">DAILY RIDDLE</span>
            </h1>

            <p className="text-[9px] tracking-[0.2em] text-gray-500">
              ONE DAY. ONE RIDDLE. ONE CHAMPION.
            </p>
          </Link>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                language === "en"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              🇬🇧 EN
            </button>

            <button
              onClick={() => setLanguage("id")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                language === "id"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              🇮🇩 ID
            </button>
          </div>
        </div>

        <nav
          className={`grid border-t border-purple-500/10 ${
            isAdmin ? "grid-cols-5" : "grid-cols-4"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 py-3 transition ${
                link.href === "/admin"
                  ? "text-purple-300 hover:text-white hover:bg-purple-600/20"
                  : "text-gray-400 hover:text-purple-300 hover:bg-purple-500/10"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-[11px] sm:text-xs font-medium text-center">
                {link.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
