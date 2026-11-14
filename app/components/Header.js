
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/localePath";

import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "./LanguageProvider";
import ThemeToggle from "./ThemeToggle";
import AccountEntry from "./AccountEntry";

import audioEngine from "@/lib/audio/AudioEngine";
import {
  getAudioSettings,
  saveAudioSettings,
} from "@/lib/audio/audioSettings";

const translations = {
  en: {
    home: "Home",
    play: "Games",
    ranking: "Ranking",
    admin: "Admin",
    settings: "Settings",
    profile: "Profile",
  },
  id: {
    home: "Beranda",
    play: "Game",
    ranking: "Peringkat",
    admin: "Admin",
    settings: "Pengaturan",
    profile: "Profil",
  },
};

export default function Header() {
  const pathname = stripLocalePrefix(usePathname() || "/");
  const { language, setLanguage } = useLanguage();

  const [isAdmin, setIsAdmin] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const t = translations[language] || translations.en;


  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setIsCompact((current) => current ? y > 12 : y > 180);
        frame = 0;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // LOAD GLOBAL AUDIO PREFERENCES
  useEffect(() => {
    const settings = getAudioSettings();

    setMusicEnabled(settings.musicEnabled);

    audioEngine.setMuted(false);

    audioEngine.setMusicVolume(
      settings.musicEnabled ? settings.musicVolume : 0
    );

    audioEngine.setSfxVolume(
      settings.sfxEnabled ? settings.sfxVolume : 0
    );

    setAudioLoaded(true);
  }, []);

  // GLOBAL BGM QUICK TOGGLE
  function toggleMusic() {
    if (!audioLoaded) return;

    const current = getAudioSettings();
    const nextEnabled = !current.musicEnabled;

    const updated = {
      ...current,
      musicEnabled: nextEnabled,
    };

    saveAudioSettings(updated);

    setMusicEnabled(nextEnabled);

    audioEngine.setMuted(false);

    audioEngine.setMusicVolume(
      nextEnabled ? updated.musicVolume : 0
    );

    if (nextEnabled) {
      // User interaction allows the browser to attempt playback.
      audioEngine.startMusic();
    } else {
      audioEngine.stopMusic();
    }
  }

  // CHECK ADMIN SESSION
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
          setIsAdmin(
            response.ok && result.success === true
          );
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
    {
      name: t.profile,
      route: "/profile",
      href: withLocalePrefix("/profile", language),
      icon: "♙",
    },
    {
      name: t.home,
      route: "/",
      href: withLocalePrefix("/", language),
      icon: "⌂",
    },
    {
      name: t.play,
      route: "/games",
      href: withLocalePrefix("/games", language),
      icon: "✦",
    },
    {
      name: t.ranking,
      route: "/leaderboard",
      href: withLocalePrefix("/leaderboard", language),
      icon: "♛",
    },
  ];

  if (isAdmin) {
    navLinks.push({
      name: t.admin,
      route: "/admin",
      href: withLocalePrefix("/admin", language),
      icon: "⚙",
    });
  }

  function isActive(route) {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  }

  const iconButton =
    "w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95";

  // A running mini-game is a separate immersive experience, not a website page.
  if (pathname?.startsWith("/games/run-jump") || pathname === "/games/mamah-ngamuk") return null;

  return (
    <header className="sticky top-0 z-50 [overflow-anchor:none] border-b border-purple-500/20 bg-[#080711]/95 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4">

        {/* TOP HEADER */}
        <div className={`flex items-center justify-between gap-3 transition-all duration-300 ease-out ${isCompact ? "py-1" : "py-2"}`}>

          {/* BRAND */}
          <Link
            href={withLocalePrefix("/", language)}
            className="min-w-0 flex flex-col"
          >
            <span className={`font-black tracking-wide text-white leading-tight transition-all duration-300 ${isCompact ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}>
              DAJJAL FAMILY
            </span>

            <p className={`overflow-hidden tracking-[0.13em] text-gray-500 transition-all duration-300 ${isCompact ? "mt-0 max-h-0 text-[0px] opacity-0" : "mt-1 max-h-4 text-[8px] opacity-100 sm:text-[9px]"}`}>
              GAMING UNIVERSE
            </p>
          </Link>

          {/* GLOBAL CONTROLS */}
          <div className="flex items-center gap-2 shrink-0">

            {/* BGM */}
            <button
              type="button"
              onClick={toggleMusic}
              disabled={!audioLoaded}
              aria-label={
                musicEnabled
                  ? "Turn background music off"
                  : "Turn background music on"
              }
              aria-pressed={musicEnabled}
              title="Background Music"
              className={`${iconButton} ${
                musicEnabled
                  ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                  : "border-white/10 bg-white/5 text-gray-500"
              } disabled:opacity-50`}
            >
              <span className="text-lg">
                {musicEnabled ? "♫" : "♪"}
              </span>
            </button>

            <ThemeToggle />

            {/* SETTINGS */}
            <Link
              href={withLocalePrefix("/settings", language)}
              aria-label={t.settings}
              title={t.settings}
              className={`${iconButton} ${
                isActive("/settings")
                  ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-purple-300 hover:border-purple-500/30"
              }`}
            >
              <span className="text-lg">⚙</span>
            </Link>
            <AccountEntry />
          </div>
        </div>

        {/* LANGUAGE */}
        <div className={`flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 ease-out ${isCompact ? "max-h-0 pb-0 opacity-0" : "max-h-8 pb-2 opacity-100"}`}>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            aria-pressed={language === "en"}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${
              language === "en"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            🇬🇧 EN
          </button>

          <button
            type="button"
            onClick={() => setLanguage("id")}
            aria-pressed={language === "id"}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${
              language === "id"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            🇮🇩 ID
          </button>
        </div>

        {/* MAIN NAVIGATION */}
        <nav
          className={`grid border-t border-purple-500/10 ${
            isAdmin ? "grid-cols-5" : "grid-cols-4"
          }`}
        >
          {navLinks.map((link) => {
            const active = isActive(link.route);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 mx-1 rounded-t-xl transition-all duration-300 ease-out ${
                  isCompact ? "py-1" : "py-2"
                } ${
                  active
                    ? "text-purple-300 bg-purple-500/15"
                    : "text-gray-400 hover:text-purple-300 hover:bg-purple-500/10"
                }`}
              >
                <span
                  className={`transition-all duration-300 ${isCompact ? "text-sm" : "text-lg"} ${
                    active
                      ? "text-purple-300 scale-110 drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]"
                      : ""
                  }`}
                >
                  {link.icon}
                </span>

                <span
                  className={`text-center transition-all duration-300 ${isCompact ? "text-[9px] sm:text-[10px]" : "text-[11px] sm:text-xs"} ${
                    active
                      ? "font-bold text-white"
                      : "font-medium"
                  }`}
                >
                  {link.name}
                </span>

                {active && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-12 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-purple-300 to-transparent shadow-[0_0_7px_rgba(192,132,252,0.95),0_0_16px_rgba(168,85,247,0.55)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
