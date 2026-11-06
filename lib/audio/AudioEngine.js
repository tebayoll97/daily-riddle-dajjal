
"use client";

/**
 * DAJJAL & VEYLORA GAMING UNIVERSE
 * GLOBAL AUDIO ENGINE 2.0
 *
 * Features:
 * - Procedural background music
 * - Global BGM and SFX volume
 * - Automatic pause when app/tab is in background
 * - Automatic resume when user returns
 * - Mobile browser AudioContext handling
 * - Preserves existing Daily Riddle SFX methods
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
    this.isBackgrounded = false;

    this.musicVolume = 0.55;
    this.sfxVolume = 0.65;

    this.musicNodes = [];
    this.sfxNodes = [];

    this.nextNote = 0;

    this.lifecycleListenersInstalled = false;
    this.isResuming = false;

    this.handleVisibilityChange =
      this.handleVisibilityChange.bind(this);

    this.handlePageHide =
      this.handlePageHide.bind(this);

    this.handlePageShow =
      this.handlePageShow.bind(this);
  }

  // --------------------------------------------------
  // BROWSER LIFECYCLE
  // --------------------------------------------------

  installLifecycleListeners() {
    if (
      typeof window === "undefined" ||
      this.lifecycleListenersInstalled
    ) {
      return;
    }

    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    window.addEventListener(
      "pagehide",
      this.handlePageHide
    );

    window.addEventListener(
      "pageshow",
      this.handlePageShow
    );

    this.lifecycleListenersInstalled = true;

    this.isBackgrounded = document.hidden;
  }

  removeLifecycleListeners() {
    if (
      typeof window === "undefined" ||
      !this.lifecycleListenersInstalled
    ) {
      return;
    }

    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    window.removeEventListener(
      "pagehide",
      this.handlePageHide
    );

    window.removeEventListener(
      "pageshow",
      this.handlePageShow
    );

    this.lifecycleListenersInstalled = false;
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.pauseForBackground();
    } else {
      this.resumeFromBackground();
    }
  }

  handlePageHide() {
    this.pauseForBackground();
  }

  handlePageShow() {
    if (!document.hidden) {
      this.resumeFromBackground();
    }
  }

  pauseForBackground() {
    this.isBackgrounded = true;

    this.clearMusicTimer();

    if (
      this.context &&
      this.context.state === "running"
    ) {
      this.context.suspend().catch((error) => {
        console.warn("Audio suspend error:", error);
      });
    }
  }

  async resumeFromBackground() {
    this.isBackgrounded = false;

    if (
      typeof document !== "undefined" &&
      document.hidden
    ) {
      return false;
    }

    if (!this.context || this.context.state === "closed") {
      return false;
    }

    if (this.isResuming) return false;

    this.isResuming = true;

    try {
      if (this.context.state === "suspended") {
        await this.context.resume();
      }

      if (
        this.context.state === "running" &&
        this.isMusicPlaying &&
        !this.isMuted
      ) {
        this.startMusicTimer();
      }

      return this.context.state === "running";
    } catch (error) {
      console.warn(
        "Audio resume requires user interaction:",
        error
      );

      return false;
    } finally {
      this.isResuming = false;
    }
  }

  // --------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------

  async initialize() {
    if (typeof window === "undefined") return false;

    try {
      this.installLifecycleListeners();

      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContextClass) return false;

      if (
        !this.context ||
        this.context.state === "closed"
      ) {
        this.context = new AudioContextClass();

        this.masterGain =
          this.context.createGain();

        this.musicGain =
          this.context.createGain();

        this.sfxGain =
          this.context.createGain();

        this.masterGain.gain.value =
          this.isMuted ? 0 : 1;

        this.musicGain.gain.value = Math.min(
          1,
          this.musicVolume * 1.8
        );

        this.sfxGain.gain.value =
          this.sfxVolume;

        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);

        this.masterGain.connect(
          this.context.destination
        );

        this.isInitialized = true;
      }

      // Never resume audio while the website is hidden.
      if (
        !document.hidden &&
        this.context.state === "suspended"
      ) {
        await this.context.resume();
      }

      return true;
    } catch (error) {
      console.error(
        "Audio initialization error:",
        error
      );

      return false;
    }
  }

  async resume() {
    return this.resumeFromBackground();
  }

  // --------------------------------------------------
  // GLOBAL VOLUME
  // --------------------------------------------------

  setMuted(muted) {
    this.isMuted = Boolean(muted);

    if (!this.masterGain || !this.context) return;

    const now = this.context.currentTime;

    this.masterGain.gain.cancelScheduledValues(now);

    this.masterGain.gain.setTargetAtTime(
      this.isMuted ? 0 : 1,
      now,
      0.08
    );

    if (this.isMuted) {
      this.clearMusicTimer();
    } else if (
      this.isMusicPlaying &&
      !this.isBackgrounded
    ) {
      this.startMusicTimer();
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(
      0,
      Math.min(1, Number(volume) || 0)
    );

    if (this.musicGain && this.context) {
      const amplifiedVolume = Math.min(
        1,
        this.musicVolume * 1.8
      );

      this.musicGain.gain.setTargetAtTime(
        amplifiedVolume,
        this.context.currentTime,
        0.08
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

  // --------------------------------------------------
  // OSCILLATOR
  // --------------------------------------------------

  createOscillator({
    frequency,
    type = "sine",
    duration = 2,
    volume = 0.1,
    destination = "music",
    attack = 0.5,
    release = 1,
  }) {
    if (
      !this.context ||
      this.context.state !== "running" ||
      this.isMuted ||
      this.isBackgrounded
    ) {
      return;
    }

    const oscillator =
      this.context.createOscillator();

    const envelope =
      this.context.createGain();

    const isSfx = destination === "sfx";

    const output = isSfx
      ? this.sfxGain
      : this.musicGain;

    const nodeList = isSfx
      ? this.sfxNodes
      : this.musicNodes;

    if (!output) return;

    const now = this.context.currentTime;

    const safeDuration = Math.max(0.1, duration);

    const safeAttack = Math.min(
      attack,
      safeDuration * 0.4
    );

    const safeRelease = Math.min(
      release,
      safeDuration * 0.6
    );

    const releaseStart = Math.max(
      safeAttack,
      safeDuration - safeRelease
    );

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
      frequency,
      now
    );

    envelope.gain.setValueAtTime(0, now);

    envelope.gain.linearRampToValueAtTime(
      volume,
      now + safeAttack
    );

    envelope.gain.setValueAtTime(
      volume,
      now + releaseStart
    );

    envelope.gain.linearRampToValueAtTime(
      0,
      now + safeDuration
    );

    oscillator.connect(envelope);
    envelope.connect(output);

    oscillator.start(now);

    oscillator.stop(
      now + safeDuration + 0.05
    );

    nodeList.push(oscillator);

    oscillator.onended = () => {
      const index = nodeList.indexOf(oscillator);

      if (index !== -1) {
        nodeList.splice(index, 1);
      }

      oscillator.disconnect();
      envelope.disconnect();
    };
  }

  // --------------------------------------------------
  // BACKGROUND MUSIC
  // --------------------------------------------------

  playAmbientLayer() {
    if (
      !this.context ||
      this.context.state !== "running" ||
      this.isMuted ||
      this.isBackgrounded
    ) {
      return;
    }

    const notes = [
      73.42,
      110,
      146.83,
      220,
      293.66,
    ];

    const note =
      notes[this.nextNote % notes.length];

    // Main atmospheric layer
    this.createOscillator({
      frequency: note,
      type: "sine",
      duration: 5.5,
      volume: 0.12,
      attack: 1.8,
      release: 2.5,
      destination: "music",
    });

    // Higher mysterious layer
    this.createOscillator({
      frequency: note * 2,
      type: "triangle",
      duration: 4,
      volume: 0.045,
      attack: 1.5,
      release: 2,
      destination: "music",
    });

    this.nextNote += 1;
  }

  startMusicTimer() {
    if (
      this.musicTimer !== null ||
      !this.isMusicPlaying ||
      this.isMuted ||
      this.isBackgrounded
    ) {
      return;
    }

    if (
      !this.context ||
      this.context.state !== "running"
    ) {
      return;
    }

    this.playAmbientLayer();

    this.musicTimer = window.setInterval(() => {
      if (
        this.isMusicPlaying &&
        !this.isMuted &&
        !this.isBackgrounded &&
        this.context?.state === "running"
      ) {
        this.playAmbientLayer();
      }
    }, 4200);
  }

  clearMusicTimer() {
    if (
      typeof window !== "undefined" &&
      this.musicTimer !== null
    ) {
      window.clearInterval(this.musicTimer);
    }

    this.musicTimer = null;
  }

  async startMusic() {
    this.isMusicPlaying = true;

    const ready = await this.initialize();

    if (!ready) return false;

    if (
      this.isBackgrounded ||
      document.hidden ||
      this.isMuted
    ) {
      return false;
    }

    if (this.context.state !== "running") {
      return false;
    }

    this.startMusicTimer();

    return true;
  }

  stopMusic() {
    this.isMusicPlaying = false;

    this.clearMusicTimer();

    this.musicNodes.forEach((node) => {
      try {
        node.stop();
      } catch {}
    });

    this.musicNodes = [];
  }

  // --------------------------------------------------
  // SOUND EFFECTS
  // --------------------------------------------------

  async canPlaySfx() {
    if (
      this.isMuted ||
      this.isBackgrounded ||
      (typeof document !== "undefined" &&
        document.hidden)
    ) {
      return false;
    }

    const ready = await this.initialize();

    return (
      ready &&
      !this.isMuted &&
      !this.isBackgrounded &&
      this.context?.state === "running"
    );
  }

  async playCorrect() {
    if (!(await this.canPlaySfx())) return;

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
    if (!(await this.canPlaySfx())) return;

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
    if (!(await this.canPlaySfx())) return;

    [220, 293.66, 440].forEach(
      (frequency, index) => {
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
      }
    );
  }

  async playComplete() {
    if (!(await this.canPlaySfx())) return;

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

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  destroy() {
    this.stopMusic();

    this.sfxNodes.forEach((node) => {
      try {
        node.stop();
      } catch {}
    });

    this.sfxNodes = [];

    this.removeLifecycleListeners();

    if (
      this.context &&
      this.context.state !== "closed"
    ) {
      this.context.close();
    }

    this.context = null;
    this.isInitialized = false;

    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.isBackgrounded = false;
    this.isResuming = false;
  }
}

const audioEngine = new AudioEngine();

export default audioEngine;
