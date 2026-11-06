"use client";

import { useEffect } from "react";

import audioEngine from "@/lib/audio/AudioEngine";
import { getAudioSettings } from "@/lib/audio/audioSettings";

export default function GlobalAudioController() {
  useEffect(() => {
    const initialSettings = getAudioSettings();

    audioEngine.setMuted(false);
    audioEngine.setMusicVolume(
      initialSettings.musicEnabled ? initialSettings.musicVolume : 0
    );
    audioEngine.setSfxVolume(
      initialSettings.sfxEnabled ? initialSettings.sfxVolume : 0
    );

    function handleAudioSettingsChange(event) {
      const settings = event.detail?.settings;
      const changes = event.detail?.changes;

      if (!settings) return;

      audioEngine.setMuted(false);
      audioEngine.setMusicVolume(
        settings.musicEnabled ? settings.musicVolume : 0
      );
      audioEngine.setSfxVolume(
        settings.sfxEnabled ? settings.sfxVolume : 0
      );

      if (changes?.musicEnabled === true) {
        audioEngine.startMusic();
      } else if (changes?.musicEnabled === false) {
        audioEngine.stopMusic();
      }
    }

    window.addEventListener(
      "dajjal-audio-settings-change",
      handleAudioSettingsChange
    );

    return () => {
      window.removeEventListener(
        "dajjal-audio-settings-change",
        handleAudioSettingsChange
      );
      // Music intentionally continues across route changes.
    };
  }, []);

  return null;
}
