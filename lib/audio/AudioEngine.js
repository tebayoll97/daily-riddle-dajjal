
"use client";

/**
 * DAJJAL & VEYLORA GAMING UNIVERSE
 * AUDIO ENGINE 1.0
 * Style: Mystery Ambient
 * Intensity: Balanced
 *
 * Procedural audio. No external MP3 required.
 */

class AudioEngine {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.musicTimer = null;
    this.isInitialized = false;
    this.isMusicPlaying = false;
    this.isMuted = false;

    this.musicVolume = 0.22;
    this.sfxVolume = 0.65;

    this.activeNodes = [];
    this.nextNote = 0;
  }

  async initialize() {
    if (typeof window === "undefined") return false;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return false;

      if (!this.context) {
        this.context = new AudioContextClass();

        this.masterGain = this.context.createGain();
        this.musicGain = this.context.createGain();
        this.sfxGain = this.context.createGain();

        this.musicGain.gain.value = this.musicVolume;
        this.sfxGain.gain.value = this.sfxVolume;

        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.context.destination);

        this.isInitialized = true;
      }

      if (this.context.state === "suspended") {
        await this.context.resume();
      }

      return true;
    } catch (error) {
      console.error("Audio initialization error:", error);
      return false;
    }
  }

  async resume() {
    return this.initialize();
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);

    if (!this.masterGain || !this.context) return;

    const now = this.context.currentTime;

    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(
      this.isMuted ? 0 : 1,
      now,
      0.04
    );
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(
      0,
      Math.min(1, Number(volume) || 0)
    );

    if (this.musicGain && this.context) {
      this.musicGain.gain.setTargetAtTime(
        this.musicVolume,
        this.context.currentTime,
        0.05
      );
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(
      0,
      Math.min(1, Number(volume) || 0)
    );

    if (this.sfxGain && this.context) {
      this.sfxGain.gain.setTargetAtTime(
        this.sfxVolume,
        this.context.currentTime,
        0.05
      );
    }
  }

  createOscillator({
    frequency,
    type = "sine",
    duration = 2,
    volume = 0.1,
    destination = "music",
    attack = 0.5,
    release = 1,
  }) {
    if (!this.context || this.isMuted) return;

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();

    const output =
      destination === "sfx"
        ? this.sfxGain
        : this.musicGain;

    const now = this.context.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(
      volume,
      now + attack
    );

    gain.gain.setValueAtTime(
      volume,
      now + Math.max(attack, duration - release)
    );

    gain.gain.linearRampToValueAtTime(
      0,
      now + duration
    );

    oscillator.connect(gain);
    gain.connect(output);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);

    this.activeNodes.push(oscillator);

    oscillator.onended = () => {
      this.activeNodes = this.activeNodes.filter(
        (node) => node !== oscillator
      );

      oscillator.disconnect();
      gain.disconnect();
    };
  }

  playAmbientLayer() {
    if (!this.context || this.isMuted) return;

    // D minor atmospheric tones
    const notes = [73.42, 110, 146.83, 220, 293.66];

    const note = notes[this.nextNote % notes.length];

    this.createOscillator({
      frequency: note,
      type: "sine",
      duration: 5.5,
      volume: 0.045,
      attack: 1.8,
      release: 2.5,
    });

    this.createOscillator({
      frequency: note * 2,
      type: "triangle",
      duration: 4,
      volume: 0.012,
      attack: 1.5,
      release: 2,
    });

    this.nextNote += 1;
  }

  async startMusic() {
    const ready = await this.initialize();

    if (!ready || this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    this.playAmbientLayer();

    this.musicTimer = window.setInterval(() => {
      if (this.isMusicPlaying) {
        this.playAmbientLayer();
      }
    }, 4200);
  }

  stopMusic() {
    this.isMusicPlaying = false;

    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }

    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch {}
    });

    this.activeNodes = [];
  }

  async playCorrect() {
    const ready = await this.initialize();
    if (!ready) return;

    [523.25, 659.25, 783.99].forEach(
      (frequency, index) => {
        window.setTimeout(() => {
          this.createOscillator({
            frequency,
            type: "sine",
            duration: 0.7,
            volume: 0.12,
            destination: "sfx",
            attack: 0.02,
            release: 0.5,
          });
        }, index * 100);
      }
    );
  }

  async playWrong() {
    const ready = await this.initialize();
    if (!ready) return;

    this.createOscillator({
      frequency: 180,
      type: "triangle",
      duration: 0.45,
      volume: 0.12,
      destination: "sfx",
      attack: 0.02,
      release: 0.3,
    });
  }

  async playStart() {
    const ready = await this.initialize();
    if (!ready) return;

    [220, 293.66, 440].forEach((frequency, index) => {
      window.setTimeout(() => {
        this.createOscillator({
          frequency,
          type: "sine",
          duration: 1.4,
          volume: 0.09,
          destination: "sfx",
          attack: 0.3,
          release: 0.8,
        });
      }, index * 180);
    });
  }

  async playComplete() {
    const ready = await this.initialize();
    if (!ready) return;

    [293.66, 369.99, 440, 587.33].forEach(
      (frequency, index) => {
        window.setTimeout(() => {
          this.createOscillator({
            frequency,
            type: "sine",
            duration: 1.8,
            volume: 0.1,
            destination: "sfx",
            attack: 0.2,
            release: 1.2,
          });
        }, index * 160);
      }
    );
  }

  destroy() {
    this.stopMusic();

    if (this.context) {
      this.context.close();
      this.context = null;
    }

    this.isInitialized = false;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
  }
}

const audioEngine = new AudioEngine();

export default audioEngine;
