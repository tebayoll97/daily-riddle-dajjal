
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { useLanguage } from "../components/LanguageProvider";

import audioEngine from "@/lib/audio/AudioEngine";
import {
  getAudioSettings,
  saveAudioSettings,
} from "@/lib/audio/audioSettings";

import GoogleAccountLink from "../components/GoogleAccountLink";
import AccountLogout from "../components/AccountLogout";

const gameplayStorageKey = "dajjal-gameplay-settings";

const defaultGameplaySettings = {
  confirmBeforeExit: true,
  showInstructions: true,
};

const translations = {
  en: {
    title: "SETTINGS",
    subtitle: "Customize your Gaming Universe experience.",
    audio: "Audio",
    display: "Display",
    gameplay: "Gameplay",
    account: "Account",
    audioTitle: "Audio Settings",
    audioDescription: "Control background music and sound effects across the entire Gaming Universe.",
    music: "Background Music",
    musicDescription: "Ambient music throughout the website and games.",
    musicVolume: "Music Volume",
    sfx: "Sound Effects",
    sfxDescription: "Sounds for buttons, answers, and game interactions.",
    sfxVolume: "SFX Volume",
    on: "ON",
    off: "OFF",
    displayTitle: "Display Settings",
    displayDescription: "Choose how the Gaming Universe appears.",
    language: "Language",
    languageDescription: "Choose your preferred interface language.",
    english: "English",
    indonesian: "Indonesian",
    gameplayTitle: "Gameplay Settings",
    gameplayDescription: "Manage your general gameplay preferences.",
    confirmExit: "Confirm before leaving a game",
    confirmExitDescription: "Save this preference for future game integration.",
    instructions: "Show game instructions",
    instructionsDescription: "Save your preference for future game integration.",
    accountTitle: "Account & Security",
    accountDescription: "Manage your account and protect your game progress.",
    guest: "GUEST ACCOUNT",
    registered: "REGISTERED ACCOUNT",
    checking: "Checking account...",
    noSession: "No active account session.",
    register: "REGISTER / LOGIN",
    saved: "Settings saved",
    back: "BACK TO GAMES",
    volume: "Volume",
  },
  id: {
    title: "PENGATURAN",
    subtitle: "Sesuaikan pengalaman Gaming Universe-mu.",
    audio: "Audio",
    display: "Tampilan",
    gameplay: "Gameplay",
    account: "Akun",
    audioTitle: "Pengaturan Audio",
    audioDescription: "Atur musik latar dan efek suara di seluruh Gaming Universe.",
    music: "Musik Latar",
    musicDescription: "Musik ambient di seluruh website dan game.",
    musicVolume: "Volume Musik",
    sfx: "Efek Suara",
    sfxDescription: "Suara tombol, jawaban, dan interaksi permainan.",
    sfxVolume: "Volume Efek Suara",
    on: "AKTIF",
    off: "MATI",
    displayTitle: "Pengaturan Tampilan",
    displayDescription: "Atur tampilan Gaming Universe.",
    language: "Bahasa",
    languageDescription: "Pilih bahasa antarmuka yang kamu inginkan.",
    english: "Inggris",
    indonesian: "Indonesia",
    gameplayTitle: "Pengaturan Gameplay",
    gameplayDescription: "Atur preferensi umum permainan.",
    confirmExit: "Konfirmasi sebelum meninggalkan game",
    confirmExitDescription: "Preferensi ini disimpan untuk integrasi game berikutnya.",
    instructions: "Tampilkan instruksi permainan",
    instructionsDescription: "Preferensi ini disimpan untuk integrasi game berikutnya.",
    accountTitle: "Akun & Keamanan",
    accountDescription: "Kelola akun dan lindungi progres permainanmu.",
    guest: "AKUN TAMU",
    registered: "AKUN TERDAFTAR",
    checking: "Memeriksa akun...",
    noSession: "Tidak ada sesi akun yang aktif.",
    register: "DAFTAR / LOGIN",
    saved: "Pengaturan tersimpan",
    back: "KEMBALI KE GAME",
    volume: "Volume",
  },
};

const tabs = [
  { id: "audio", icon: "♫" },
  { id: "display", icon: "◐" },
  { id: "gameplay", icon: "✦" },
  { id: "account", icon: "♙" },
];

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language] || translations.en;

  const [activeTab, setActiveTab] = useState("audio");

  const [audioSettings, setAudioSettings] = useState({
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.22,
    sfxVolume: 0.65,
  });

  const [gameplaySettings, setGameplaySettings] = useState(
    defaultGameplaySettings
  );

  const [accountStatus, setAccountStatus] = useState("checking");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // LOAD SETTINGS AND ACCOUNT
  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const currentAudio = getAudioSettings();

        let currentGameplay = defaultGameplaySettings;

        try {
          const stored = localStorage.getItem(gameplayStorageKey);

          if (stored) {
            currentGameplay = {
              ...defaultGameplaySettings,
              ...JSON.parse(stored),
            };
          }
        } catch (error) {
          console.error("Gameplay settings error:", error);
        }

        if (active) {
          setAudioSettings(currentAudio);
          setGameplaySettings(currentGameplay);
        }

        audioEngine.setMuted(false);
        audioEngine.setMusicVolume(
          currentAudio.musicEnabled ? currentAudio.musicVolume : 0
        );
        audioEngine.setSfxVolume(
          currentAudio.sfxEnabled ? currentAudio.sfxVolume : 0
        );

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (active) {
          if (!user) {
            setAccountStatus("none");
          } else if (user.is_anonymous) {
            setAccountStatus("guest");
          } else {
            setAccountStatus("registered");
          }
        }
      } catch (error) {
        console.error("Settings initialization error:", error);

        if (active) {
          setAccountStatus("none");
        }
      } finally {
        if (active) setLoaded(true);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "SIGNED_OUT") {
        setAccountStatus("none");
      } else if (
        event === "SIGNED_IN" ||
        event === "USER_UPDATED" ||
        event === "TOKEN_REFRESHED"
      ) {
        if (session?.user) {
          setAccountStatus(
            session.user.is_anonymous ? "guest" : "registered"
          );
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // UPDATE AUDIO
  function updateAudio(changes) {
    setAudioSettings((previous) => {
      const updated = { ...previous, ...changes };

      saveAudioSettings(updated);

      audioEngine.setMuted(false);

      audioEngine.setMusicVolume(
        updated.musicEnabled ? updated.musicVolume : 0
      );

      audioEngine.setSfxVolume(
        updated.sfxEnabled ? updated.sfxVolume : 0
      );

      if (
        changes.musicEnabled === true &&
        updated.musicEnabled
      ) {
        audioEngine.startMusic();
      }

      if (changes.musicEnabled === false) {
        audioEngine.stopMusic();
      }

      return updated;
    });

    showSaved();
  }

  // UPDATE GAMEPLAY
  function updateGameplay(changes) {
    setGameplaySettings((previous) => {
      const updated = { ...previous, ...changes };

      try {
        localStorage.setItem(
          gameplayStorageKey,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error("Unable to save gameplay settings:", error);
      }

      return updated;
    });

    showSaved();
  }

  function showSaved() {
    setSaved(true);

    window.clearTimeout(showSaved.timeout);

    showSaved.timeout = window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  }

  function toggleButton(enabled, onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={enabled}
        className={`relative w-14 h-7 rounded-full transition-colors ${
          enabled ? "bg-purple-600" : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-8" : "translate-x-1"
          }`}
        />
      </button>
    );
  }

  function settingCard(title, description, enabled, onClick) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-purple-500/20 bg-white/5 p-4">
        <div className="min-w-0">
          <h3 className="font-bold text-white">{title}</h3>
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>

        {toggleButton(enabled, onClick)}
      </div>
    );
  }

  function volumeControl(title, value, onChange, disabled) {
    return (
      <div className={disabled ? "opacity-40" : ""}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-gray-300">{title}</label>
          <span className="text-sm font-bold text-purple-300 tabular-nums">
            {Math.round(value * 100)}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(Number(event.target.value))
          }
          className="w-full accent-purple-500 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-purple-300">
        {t.checking}
      </div>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#080711] text-white px-4 py-8 sm:py-10">
      <div className="max-w-2xl mx-auto">

        {/* PAGE HEADER */}
        <div className="mb-7">
          <p className="text-purple-400 text-xs tracking-[0.3em]">
            DAJJAL & VEYLORA GAMING UNIVERSE
          </p>

          <h1 className="text-3xl font-black mt-3">
            {t.title}
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            {t.subtitle}
          </p>
        </div>

        {/* TABS */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border py-3 transition ${
                  active
                    ? "border-purple-400/50 bg-purple-600/20 text-purple-200"
                    : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-[11px] font-bold">
                  {t[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* AUDIO TAB */}
        {activeTab === "audio" && (
          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-bold">
                {t.audioTitle}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {t.audioDescription}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-[#151020] p-5 space-y-5">
              {settingCard(
                t.music,
                t.musicDescription,
                audioSettings.musicEnabled,
                () =>
                  updateAudio({
                    musicEnabled: !audioSettings.musicEnabled,
                  })
              )}

              {volumeControl(
                t.musicVolume,
                audioSettings.musicVolume,
                (value) => updateAudio({ musicVolume: value }),
                !audioSettings.musicEnabled
              )}

              <div className="border-t border-purple-500/20" />

              {settingCard(
                t.sfx,
                t.sfxDescription,
                audioSettings.sfxEnabled,
                () =>
                  updateAudio({
                    sfxEnabled: !audioSettings.sfxEnabled,
                  })
              )}

              {volumeControl(
                t.sfxVolume,
                audioSettings.sfxVolume,
                (value) => updateAudio({ sfxVolume: value }),
                !audioSettings.sfxEnabled
              )}
            </div>
          </section>
        )}

        {/* DISPLAY TAB */}
        {activeTab === "display" && (
          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-bold">
                {t.displayTitle}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {t.displayDescription}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-[#151020] p-5">
              <h3 className="font-bold">{t.language}</h3>
              <p className="text-xs text-gray-400 mt-1 mb-5">
                {t.languageDescription}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage("en");
                    showSaved();
                  }}
                  className={`rounded-xl border p-4 font-bold transition ${
                    language === "en"
                      ? "border-purple-400 bg-purple-600/20 text-purple-200"
                      : "border-white/10 bg-white/5 text-gray-400"
                  }`}
                >
                  🇬🇧 {t.english}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLanguage("id");
                    showSaved();
                  }}
                  className={`rounded-xl border p-4 font-bold transition ${
                    language === "id"
                      ? "border-purple-400 bg-purple-600/20 text-purple-200"
                      : "border-white/10 bg-white/5 text-gray-400"
                  }`}
                >
                  🇮🇩 {t.indonesian}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* GAMEPLAY TAB */}
        {activeTab === "gameplay" && (
          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-bold">
                {t.gameplayTitle}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {t.gameplayDescription}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-[#151020] p-5 space-y-4">
              {settingCard(
                t.confirmExit,
                t.confirmExitDescription,
                gameplaySettings.confirmBeforeExit,
                () =>
                  updateGameplay({
                    confirmBeforeExit:
                      !gameplaySettings.confirmBeforeExit,
                  })
              )}

              {settingCard(
                t.instructions,
                t.instructionsDescription,
                gameplaySettings.showInstructions,
                () =>
                  updateGameplay({
                    showInstructions:
                      !gameplaySettings.showInstructions,
                  })
              )}
            </div>
          </section>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === "account" && (
          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-bold">
                {t.accountTitle}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {t.accountDescription}
              </p>
            </div>

            <div className="rounded-xl border border-purple-500/20 bg-[#151020] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-400">
                  {t.account}
                </span>

                {accountStatus === "guest" && (
                  <span className="text-xs font-bold text-amber-300">
                    {t.guest}
                  </span>
                )}

                {accountStatus === "registered" && (
                  <span className="text-xs font-bold text-green-400">
                    {t.registered}
                  </span>
                )}

                {accountStatus === "checking" && (
                  <span className="text-xs text-gray-400">
                    {t.checking}
                  </span>
                )}

                {accountStatus === "none" && (
                  <span className="text-xs text-gray-400">
                    {t.noSession}
                  </span>
                )}
              </div>
            </div>

            {accountStatus === "none" ? (
              <Link
                href="/register"
                className="block text-center rounded-xl bg-purple-600 hover:bg-purple-500 py-3 font-bold transition"
              >
                {t.register}
              </Link>
            ) : (
              <>
                <GoogleAccountLink />
                <AccountLogout />
              </>
            )}
          </section>
        )}

        {/* SAVED STATUS */}
        <div className="h-7 flex items-center justify-center mt-5">
          {saved && (
            <p className="text-xs text-green-400 animate-pulse">
              ✓ {t.saved}
            </p>
          )}
        </div>

        {/* BACK */}
        <Link
          href="/game"
          className="block text-center mt-3 w-full rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 py-4 text-purple-200 font-bold tracking-wider transition"
        >
          ← {t.back}
        </Link>
      </div>
    </main>
  );
}
