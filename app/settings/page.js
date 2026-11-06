"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import audioEngine from "@/lib/audio/AudioEngine";
import {
  getAudioSettings,
  saveAudioSettings,
} from "@/lib/audio/audioSettings";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.22,
    sfxVolume: 0.65,
  });

  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getAudioSettings();

    setSettings(current);

    audioEngine.setMuted(false);
    audioEngine.setMusicVolume(
      current.musicEnabled ? current.musicVolume : 0
    );
    audioEngine.setSfxVolume(
      current.sfxEnabled ? current.sfxVolume : 0
    );

    setLoaded(true);
  }, []);

  function updateSettings(changes) {
    setSettings((previous) => {
      const updated = {
        ...previous,
        ...changes,
      };

      saveAudioSettings(updated);

      audioEngine.setMuted(false);

      audioEngine.setMusicVolume(
        updated.musicEnabled ? updated.musicVolume : 0
      );

      audioEngine.setSfxVolume(
        updated.sfxEnabled ? updated.sfxVolume : 0
      );

      if (updated.musicEnabled) {
        audioEngine.startMusic();
      } else {
        audioEngine.stopMusic();
      }

      setSaved(true);

      return updated;
    });
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#080711] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
        <p className="text-purple-300 text-sm animate-pulse">
          Loading settings...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080711] text-white px-4 py-8 sm:px-6">
      <div className="max-w-xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/game"
            className="w-11 h-11 shrink-0 rounded-xl border border-purple-500/20 bg-purple-500/10 flex items-center justify-center text-xl hover:bg-purple-500/20 transition"
          >
            ←
          </Link>

          <div>
            <p className="text-purple-400 text-[10px] tracking-[0.3em] font-bold">
              DAJJAL & VEYLORA
            </p>

            <h1 className="text-2xl font-black mt-1">
              SETTINGS
            </h1>
          </div>
        </div>

        {/* AUDIO SETTINGS */}
        <section className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#1c142b] to-[#100d19] p-6 sm:p-7">

          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
              🎧
            </div>

            <div>
              <h2 className="font-black text-lg">
                AUDIO
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                Music and sound effects
              </p>
            </div>
          </div>

          {/* BACKGROUND MUSIC */}
          <div className="border-t border-white/10 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-sm">
                  Background Music
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Ambient music during gameplay
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateSettings({
                    musicEnabled: !settings.musicEnabled,
                  })
                }
                className={`relative w-14 h-7 rounded-full transition ${
                  settings.musicEnabled
                    ? "bg-purple-600"
                    : "bg-gray-700"
                }`}
                aria-label="Toggle background music"
                aria-pressed={settings.musicEnabled}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                    settings.musicEnabled
                      ? "left-8"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs mb-3">
                <label className="text-gray-400">
                  Music Volume
                </label>
                <span className="text-purple-300 font-bold">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.musicVolume}
                disabled={!settings.musicEnabled}
                onChange={(event) =>
                  updateSettings({
                    musicVolume: Number(event.target.value),
                  })
                }
                className="w-full accent-purple-500 disabled:opacity-30"
              />
            </div>
          </div>

          {/* SOUND EFFECTS */}
          <div className="border-t border-white/10 mt-7 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-sm">
                  Sound Effects
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Correct, wrong and game notifications
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateSettings({
                    sfxEnabled: !settings.sfxEnabled,
                  })
                }
                className={`relative w-14 h-7 rounded-full transition ${
                  settings.sfxEnabled
                    ? "bg-purple-600"
                    : "bg-gray-700"
                }`}
                aria-label="Toggle sound effects"
                aria-pressed={settings.sfxEnabled}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                    settings.sfxEnabled
                      ? "left-8"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs mb-3">
                <label className="text-gray-400">
                  Effects Volume
                </label>
                <span className="text-purple-300 font-bold">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.sfxVolume}
                disabled={!settings.sfxEnabled}
                onChange={(event) =>
                  updateSettings({
                    sfxVolume: Number(event.target.value),
                  })
                }
                className="w-full accent-purple-500 disabled:opacity-30"
              />
            </div>
          </div>

          <div className="mt-7 rounded-xl border border-purple-500/10 bg-[#080711]/60 p-4">
            <p className="text-gray-400 text-xs leading-relaxed">
              Your audio preferences are saved automatically
              on this device and will be used across supported
              games.
            </p>

            {saved && (
              <p className="text-green-400 text-xs font-bold mt-2">
                ✓ Settings saved
              </p>
            )}
          </div>
        </section>

        {/* FUTURE SETTINGS */}
        <section className="mt-5 rounded-3xl border border-white/10 bg-[#151020] p-6">
          <h2 className="font-black text-sm tracking-wider">
            MORE SETTINGS
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold">
                  Display
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Themes and visual effects
                </p>
              </div>
              <span className="text-[10px] text-purple-300 border border-purple-500/20 rounded-full px-3 py-1">
                COMING SOON
              </span>
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold">
                  Gameplay
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Language and game preferences
                </p>
              </div>
              <span className="text-[10px] text-purple-300 border border-purple-500/20 rounded-full px-3 py-1">
                COMING SOON
              </span>
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold">
                  Account
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Profile and security
                </p>
              </div>
              <span className="text-[10px] text-purple-300 border border-purple-500/20 rounded-full px-3 py-1">
                COMING SOON
              </span>
            </div>
          </div>
        </section>

        <p className="text-center text-gray-600 text-[10px] tracking-wider mt-8">
          DAJJAL & VEYLORA GAMING UNIVERSE
        </p>
      </div>
    </main>
  );
}