
"use client";

const STORAGE_KEY = "dajjal-audio-settings";

const DEFAULT_SETTINGS = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.55,
  sfxVolume: 0.65,
};

export function getAudioSettings() {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return { ...DEFAULT_SETTINGS };

    const parsed = JSON.parse(saved);

    return {
      musicEnabled:
        typeof parsed.musicEnabled === "boolean"
          ? parsed.musicEnabled
          : DEFAULT_SETTINGS.musicEnabled,

      sfxEnabled:
        typeof parsed.sfxEnabled === "boolean"
          ? parsed.sfxEnabled
          : DEFAULT_SETTINGS.sfxEnabled,

      musicVolume:
        typeof parsed.musicVolume === "number"
          ? Math.max(0, Math.min(1, parsed.musicVolume))
          : DEFAULT_SETTINGS.musicVolume,

      sfxVolume:
        typeof parsed.sfxVolume === "number"
          ? Math.max(0, Math.min(1, parsed.sfxVolume))
          : DEFAULT_SETTINGS.sfxVolume,
    };
  } catch (error) {
    console.error("Audio settings error:", error);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveAudioSettings(settings) {
  if (typeof window === "undefined") return false;

  try {
    const current = getAudioSettings();

    const updated = {
      ...current,
      ...settings,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    return true;
  } catch (error) {
    console.error("Unable to save audio settings:", error);
    return false;
  }
}

export function resetAudioSettings() {
  if (typeof window === "undefined") return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Unable to reset audio settings:", error);
    return false;
  }
}
