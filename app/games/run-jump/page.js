"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "../arcade-master.css";
import "./run-jump.css";

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 420;
const GROUND_Y = 326;
const BEST_SCORE_KEY = "dajjal-run-jump-best";
const WAVE_TITLES = [
  "SAWIT HIJAU",
  "BATAS RIMBA",
  "HUTAN KALIMANTAN",
  "MUSIM KERING",
  "ANCAMAN KARHUTLA",
  "KEBAKARAN HUTAN",
];
const WAVE_STARTS = [0, 1200, 2600, 4100, 5700, 7400];
const WAVE_TRANSITION_LEAD_SECONDS = 8;
const WAVE_TRANSITION_DURATION = 14000;
const WAVE_SPEED_MULTIPLIERS = [1, 1.32, 1.64, 1.96, 2.28, 2.6];
const getWaveSpeed = (wave) => 6 * WAVE_SPEED_MULTIPLIERS[Math.max(0, Math.min(5, wave - 1))];
const clamp01 = (value) => Math.max(0, Math.min(1, value));
const smoothStep = (value) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const mix = (from, to, amount) => from + (to - from) * amount;
const mixColor = (from, to, amount) =>
  `rgb(${Math.round(mix(from[0], to[0], amount))},${Math.round(mix(from[1], to[1], amount))},${Math.round(mix(from[2], to[2], amount))})`;

const WORLD_PALETTES = {
  skyTop: [[68,178,224],[74,159,174],[43,111,112],[174,151,91],[111,91,79],[63,37,34]],
  skyHorizon: [[190,226,206],[143,190,155],[95,139,111],[203,169,111],[160,112,83],[124,57,39]],
  mountain: [[86,139,91],[62,119,82],[42,91,67],[119,113,76],[91,70,57],[54,42,38]],
  forest: [[43,116,68],[35,99,65],[28,77,58],[91,91,57],[88,65,48],[53,42,37]],
  ground: [[133,91,55],[116,83,52],[94,76,53],[113,88,57],[82,62,49],[49,42,38]],
  grass: [[75,153,62],[66,130,57],[52,102,52],[139,119,57],[112,75,43],[58,48,39]],
};
const paletteColor = (palette, level) => {
  const position = Math.max(0, Math.min(palette.length - 1, level));
  const index = Math.min(palette.length - 2, Math.floor(position));
  return mixColor(palette[index], palette[index + 1], position - index);
};

export default function MiniGamePage() {
  const canvasRef = useRef(null);
  const characterSpriteRef = useRef(null);
  const arenaRef = useRef(null);
  const gameRef = useRef(null);
  const frameRef = useRef(0);
  const bestRef = useRef(0);
  const soundRef = useRef(true);
  const audioRef = useRef(null);

  const [status, setStatus] = useState("ready");
  const [, setScore] = useState(0);
  const [, setBest] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [confirmExit, setConfirmExit] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const playTone = useCallback((frequency, duration = 0.08) => {
    if (!soundRef.current || typeof window === "undefined") return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const context = audioRef.current || new AudioContextClass();
      audioRef.current = context;
      if (context.state === "suspended") context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      gain.gain.setValueAtTime(0.04, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    } catch {
      // Audio is optional; gameplay must work even when the browser blocks it.
    }
  }, []);

  const startGame = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;

    Object.assign(game, {
      running: true,
      paused: false,
      pauseStartedAt: 0,
      pausedDuration: 0,
      over: false,
      speed: getWaveSpeed(1),
      distance: 0,
      wave: 1,
      waveChangedAt: performance.now(),
      transitionStartedAt: null,
      transitionFrom: 0,
      transitionTo: 0,
      lastUiUpdate: 0,
      spawn: 90,
      lastTime: 0,
      lastScore: -1,
    });
    Object.assign(game.player, {
      y: GROUND_Y - 58,
      velocityY: 0,
      jumping: false,
    });
    game.obstacles = [];
    game.clouds = [
      { x: 180, y: 65 },
      { x: 520, y: 105 },
      { x: 790, y: 48 },
    ];

    setScore(0);
    setIsPaused(false);
    setStatus("playing");
    playTone(650);
  }, [playTone]);

  const togglePause = useCallback(() => {
    const game = gameRef.current;
    if (!game || (!game.running && !game.paused) || game.over) return;
    if (game.paused) {
      game.pausedDuration += performance.now() - game.pauseStartedAt;
      game.paused = false;
      game.pauseStartedAt = 0;
      game.lastTime = 0;
      setIsPaused(false);
      return;
    }
    game.paused = true;
    game.pauseStartedAt = performance.now();
    setIsPaused(true);
  }, []);

  const jump = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;

    if (!game.running) {
      if (!game.over) startGame();
      return;
    }

    if (!game.player.jumping) {
      game.player.velocityY = -13.5;
      game.player.jumping = true;
      playTone(500);
    }
  }, [playTone, startGame]);

  const handleCanvasPointer = useCallback((event) => {
    const canvas = canvasRef.current;
    const game = gameRef.current;
    if (!canvas || !game) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WORLD_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * WORLD_HEIGHT;
    if (game.paused) {
      if (x >= 350 && x <= 550 && y >= 210 && y <= 270) togglePause();
      return;
    }
    if (!game.running) {
      const button = { left: 350, right: 550, top: 238, bottom: 286 };
      if (x >= button.left && x <= button.right && y >= button.top && y <= button.bottom) {
        startGame();
      }
      return;
    }
    jump();
  }, [jump, startGame, togglePause]);

  const pauseForDisplayChange = useCallback(() => {
    const game = gameRef.current;
    if (!game || !game.running || game.paused || game.over) return;
    game.paused = true;
    game.pauseStartedAt = performance.now();
    game.lastTime = 0;
    setIsPaused(true);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const target = arenaRef.current;
    if (!target) return;
    try {
      if (!document.fullscreenElement) {
        await target.requestFullscreen?.();
        try {
          await screen.orientation?.lock?.("landscape");
        } catch {
          // Orientation lock is optional; fullscreen can still be used in landscape manually.
        }
      } else {
        await document.exitFullscreen?.();
        try { screen.orientation?.unlock?.(); } catch {}
      }
    } catch {
      // Some mobile browsers block fullscreen/orientation APIs; keep the normal game usable.
    }
  }, []);

  useEffect(() => {
    const sprite = new Image();
    sprite.src = "/mini-game/run-jump/char.png";
    sprite.onload = () => { characterSpriteRef.current = sprite; };
    sprite.onerror = () => { characterSpriteRef.current = null; };
    return () => { characterSpriteRef.current = null; };
  }, []);

  useEffect(() => {
    let previousFullscreen = Boolean(document.fullscreenElement);
    let previousOrientation = window.matchMedia("(orientation: landscape)").matches;
    const handleFullscreenChange = () => {
      const nextFullscreen = Boolean(document.fullscreenElement);
      if (nextFullscreen !== previousFullscreen) pauseForDisplayChange();
      previousFullscreen = nextFullscreen;
      setIsFullscreen(nextFullscreen);
    };
    const handleOrientationChange = () => {
      const nextOrientation = window.matchMedia("(orientation: landscape)").matches;
      if (nextOrientation !== previousOrientation) pauseForDisplayChange();
      previousOrientation = nextOrientation;
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("orientationchange", handleOrientationChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [pauseForDisplayChange]);

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    // Trap one browser-history step so Android/browser Back opens the in-game exit confirmation.
    const addGuard = () => window.history.pushState({ miniGameBackGuard: true }, "", window.location.href);
    addGuard();
    const handlePopState = () => {
      setConfirmExit(true);
      addGuard();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    try {
      const savedBest = Number(window.localStorage.getItem(BEST_SCORE_KEY) || 0);
      if (Number.isFinite(savedBest) && savedBest > 0) { bestRef.current = savedBest; setBest(savedBest); }
    } catch {
      // Private browsing or storage restrictions should not block the game.
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const game = {
      running: false,
      paused: false,
      pauseStartedAt: 0,
      pausedDuration: 0,
      over: false,
      speed: getWaveSpeed(1),
      distance: 0,
      wave: 1,
      waveChangedAt: 0,
      transitionStartedAt: null,
      transitionFrom: 0,
      transitionTo: 0,
      lastUiUpdate: 0,
      spawn: 72,
      lastTime: 0,
      lastScore: -1,
      player: { x: 68, y: GROUND_Y - 112, velocityY: 0, jumping: false },
      obstacles: [],
      clouds: [{ x: 180, y: 65 }, { x: 520, y: 105 }, { x: 790, y: 48 }],
    };
    gameRef.current = game;


    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      // Lower backing resolution reduces fill-rate pressure on mid-range phones.
      const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.2);
      const width = Math.max(1, Math.round(rect.width * pixelRatio));
      const fullscreen = Boolean(canvas.closest(".mg-fullscreen-arena")?.classList.contains("is-fullscreen"));
      const height = Math.max(1, Math.round((fullscreen ? rect.height : rect.width * WORLD_HEIGHT / WORLD_WIDTH) * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.setTransform(width / WORLD_WIDTH, 0, 0, height / WORLD_HEIGHT, 0, 0);
    };

    const draw = (time) => {
      // Reset the transform every frame so offsets can never accumulate.
      const logicalScaleX = canvas.width / WORLD_WIDTH;
      const logicalScaleY = canvas.height / WORLD_HEIGHT;
      context.setTransform(logicalScaleX, 0, 0, logicalScaleY, 0, 0);
      context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      context.save();
      context.translate(0, 100);

      // Living prehistoric world: all four parallax layers are drawn in one
      // canvas coordinate space so no image seams or black strip boundaries appear.
      const travel = game.distance;
      // Resolve the visual Wave continuously, including the pre-Wave lead-in.
      const activeTransition = game.transitionStartedAt !== null;
      const transitionRaw = activeTransition
        ? clamp01((time - game.transitionStartedAt) / WAVE_TRANSITION_DURATION)
        : 1;
      const transitionEase = smoothStep(transitionRaw);
      const worldWave = activeTransition
        ? mix(game.transitionFrom + 1, game.transitionTo + 1, transitionEase)
        : game.wave;
      const paletteLevel = Math.max(0, Math.min(5, worldWave - 1));
      const skyTopColor = paletteColor(WORLD_PALETTES.skyTop, paletteLevel);
      const skyHorizonColor = paletteColor(WORLD_PALETTES.skyHorizon, paletteLevel);
      const mountainColor = paletteColor(WORLD_PALETTES.mountain, paletteLevel);
      const forestColor = paletteColor(WORLD_PALETTES.forest, paletteLevel);
      const groundColor = paletteColor(WORLD_PALETTES.ground, paletteLevel);
      const grassColor = paletteColor(WORLD_PALETTES.grass, paletteLevel);
      const sky = context.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
      sky.addColorStop(0, skyTopColor);
      sky.addColorStop(0.62, skyHorizonColor);
      sky.addColorStop(1, paletteColor(WORLD_PALETTES.grass, Math.min(5, paletteLevel * 0.7)));
      context.fillStyle = sky;
      context.fillRect(0, -100, WORLD_WIDTH, WORLD_HEIGHT);

      // Warm sunlight and softly drifting clouds (slowest layer).
      context.fillStyle = "rgba(255,244,177,.72)";
      context.beginPath();
      context.arc(735, 48, 23, 0, Math.PI * 2);
      context.fill();
      const cloud = (x, y, scale = 1) => {
        context.fillStyle = "rgba(255,255,255,.86)";
        context.beginPath();
        context.ellipse(x, y, 31 * scale, 11 * scale, 0, 0, Math.PI * 2);
        context.ellipse(x - 17 * scale, y - 5 * scale, 17 * scale, 13 * scale, 0, 0, Math.PI * 2);
        context.ellipse(x + 5 * scale, y - 10 * scale, 21 * scale, 17 * scale, 0, 0, Math.PI * 2);
        context.ellipse(x + 23 * scale, y - 3 * scale, 17 * scale, 12 * scale, 0, 0, Math.PI * 2);
        context.fill();
      };
      const cloudShift = (travel * 0.08) % 1080;
      cloud(125 - cloudShift + (cloudShift > 900 ? 1080 : 0), 67, .85);
      cloud(440 - cloudShift + (cloudShift > 900 ? 1080 : 0), 42, .68);
      cloud(820 - cloudShift, 91, .78);

      // Distant layered Borneo canopy replaces prehistoric mountains.
      const mountainShift = (travel * 0.16) % 900;
      context.save();
      context.translate(-mountainShift, 0);
      for (let repeat = 0; repeat < 2; repeat += 1) {
        const ox = repeat * 900;
        for (let layer = 0; layer < 3; layer += 1) {
          context.fillStyle = layer === 0 ? mountainColor : layer === 1 ? "rgba(35,91,62,.72)" : "rgba(24,68,49,.55)";
          context.beginPath();
          context.moveTo(ox - 20, 180);
          for (let x = 0; x <= 940; x += 55) {
            const y = 137 + Math.sin((x + layer * 37) / 95) * (13 + layer * 4) + Math.sin(x / 31) * 5 + layer * 13;
            context.lineTo(ox + x, y);
          }
          context.lineTo(ox + 940, 210);
          context.lineTo(ox - 20, 210);
          context.closePath();
          context.fill();
        }
      }
      context.restore();

      const forestShift = (travel * 0.45) % 900;
      context.save();
      context.translate(-forestShift, 0);
      for (let repeat = 0; repeat < 2; repeat += 1) {
        const ox = repeat * 900;
        context.fillStyle = forestColor;
        context.fillRect(ox, 166, 900, 63);
        const palm = (x, base, scale = 1, tone = "#286d43") => {
          const trunkTop = base - 77 * scale;
          context.strokeStyle = "#76583b";
          context.lineWidth = 8 * scale;
          context.beginPath();
          context.moveTo(x, base);
          context.quadraticCurveTo(x + 3 * scale, base - 42 * scale, x, trunkTop);
          context.stroke();
          context.strokeStyle = "#a17a4d";
          context.lineWidth = 2 * scale;
          context.beginPath();
          context.moveTo(x + 2 * scale, base - 8 * scale);
          context.lineTo(x + 2 * scale, trunkTop + 8 * scale);
          context.stroke();
          for (let frond = 0; frond < 9; frond += 1) {
            const angle = -Math.PI + frond * (Math.PI / 8);
            const reach = (34 + (frond % 3) * 5) * scale;
            const endX = x + Math.cos(angle) * reach;
            const endY = trunkTop + Math.sin(angle) * reach * 0.48 - 3 * scale;
            context.strokeStyle = tone;
            context.lineWidth = (4.5 - (frond % 2)) * scale;
            context.beginPath();
            context.moveTo(x, trunkTop);
            context.quadraticCurveTo(x + Math.cos(angle) * reach * .45, trunkTop + Math.sin(angle) * reach * .22 - 7 * scale, endX, endY);
            context.stroke();
            for (let leaf = 1; leaf <= 4; leaf += 1) {
              const t = leaf / 5, lx = x + (endX - x) * t, ly = trunkTop + (endY - trunkTop) * t;
              context.beginPath();
              context.moveTo(lx, ly);
              context.lineTo(lx - Math.sin(angle) * 5 * scale, ly + 3 * scale);
              context.stroke();
            }
          }
          context.fillStyle = "#9a633c";
          context.beginPath();
          context.arc(x, trunkTop + 2 * scale, 5 * scale, 0, Math.PI * 2);
          context.fill();
        };
        const rainforestTree = (x, base, scale = 1) => {
          context.fillStyle = "#594a35";
          context.fillRect(x - 5 * scale, base - 72 * scale, 10 * scale, 76 * scale);
          context.fillStyle = "#235b3b";
          context.beginPath();
          context.arc(x, base - 82 * scale, 34 * scale, 0, Math.PI * 2);
          context.arc(x - 23 * scale, base - 65 * scale, 25 * scale, 0, Math.PI * 2);
          context.arc(x + 24 * scale, base - 65 * scale, 25 * scale, 0, Math.PI * 2);
          context.fill();
        };
        const rainforestAmount = smoothStep((worldWave - 1.8) / 1.8);
        context.globalAlpha = 1 - rainforestAmount * .62;
        palm(ox + 115, 226, .88, "#347b43");
        palm(ox + 350, 225, 1.08, "#2e7040");
        palm(ox + 625, 227, .92, "#347b43");
        palm(ox + 835, 225, .98, "#2e7040");
        context.globalAlpha = .35 + rainforestAmount * .65;
        rainforestTree(ox + 235, 225, .9);
        rainforestTree(ox + 495, 226, 1.12);
        rainforestTree(ox + 740, 224, .96);
        context.globalAlpha = 1;

        // Distant fire line for the final Wave; it stays above the play lane.
        const fireStrength = smoothStep((worldWave - 4.65) / 1.05);
        if (fireStrength > 0.01) {
          context.save();
          context.globalAlpha = fireStrength * .88;
          for (let flame = 0; flame < 13; flame += 1) {
            const fx = ox + 28 + flame * 72, pulse = Math.sin(time / 170 + flame * 1.8);
            const height = 13 + (flame % 4) * 7 + pulse * 4;
            context.fillStyle = flame % 2 ? "#d84c24" : "#f08a32";
            context.beginPath();
            context.moveTo(fx - 9, 177);
            context.quadraticCurveTo(fx - 13, 177 - height * .55, fx + pulse * 4, 177 - height);
            context.quadraticCurveTo(fx + 12, 177 - height * .45, fx + 10, 177);
            context.closePath();
            context.fill();
            context.fillStyle = "rgba(255,194,91,.72)";
            context.beginPath();
            context.moveTo(fx - 3, 177);
            context.quadraticCurveTo(fx - 5, 177 - height * .35, fx + 1, 177 - height * .62);
            context.quadraticCurveTo(fx + 7, 177 - height * .25, fx + 5, 177);
            context.closePath();
            context.fill();
          }
          context.restore();
        }
      }
      context.restore();

      // Decorative dinosaur silhouettes were removed; distant scenery stays uncluttered.

      // Close the world-space offset before drawing the ground, HUD and gameplay objects.
      context.restore();

      // Foreground grass and soil are part of the same canvas, aligned to collision.
      context.fillStyle = groundColor;
      context.fillRect(0, GROUND_Y, WORLD_WIDTH, WORLD_HEIGHT - GROUND_Y);
      context.fillStyle = "#6d452f";
      for (let x = -((travel * 1.0) % 90); x < WORLD_WIDTH + 90; x += 90) {
        context.beginPath();
        context.ellipse(x + 28, 376, 32, 15, 0, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#a96f43";
        context.beginPath();
        context.ellipse(x + 65, 400, 26, 11, 0, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#6d452f";
      }
      context.fillStyle = grassColor;
      context.fillRect(0, GROUND_Y, WORLD_WIDTH, 12);
      context.fillStyle = paletteColor(WORLD_PALETTES.grass, Math.min(5, paletteLevel + 0.35));
      context.fillRect(0, GROUND_Y, WORLD_WIDTH, 4);
      context.fillStyle = "#328c42";
      for (let x = -((travel * 1.0) % 28); x < WORLD_WIDTH + 28; x += 28) {
        context.beginPath();
        context.moveTo(x, GROUND_Y + 1);
        context.lineTo(x + 5, GROUND_Y - 5);
        context.lineTo(x + 8, GROUND_Y + 2);
        context.fill();
      }
      // Small foreground ferns create extra depth without obscuring the runner.
      const fernShift = (travel * 0.72) % 230;
      for (let x = -fernShift; x < WORLD_WIDTH + 230; x += 230) {
        context.strokeStyle = "#267c3b";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(x + 12, GROUND_Y + 3);
        context.quadraticCurveTo(x + 2, GROUND_Y - 18, x - 4, GROUND_Y - 22);
        context.moveTo(x + 12, GROUND_Y + 3);
        context.quadraticCurveTo(x + 22, GROUND_Y - 17, x + 32, GROUND_Y - 19);
        context.stroke();
      }

      // A restrained atmospheric veil supports the full palette changes above.
      const tintStops = [0,0.12,0.19,0.25,0.30,0.36];
      const tintIndex = Math.min(4, Math.floor(paletteLevel));
      const tintAlpha = mix(tintStops[tintIndex], tintStops[tintIndex + 1], paletteLevel - tintIndex);
      if (tintAlpha > 0.01) {
        const atmosphere = context.createLinearGradient(0, 0, 0, GROUND_Y + 20);
        atmosphere.addColorStop(0, `rgba(38,48,52,${tintAlpha * 0.42})`);
        atmosphere.addColorStop(1, `rgba(35,30,28,${tintAlpha * 0.24})`);
        context.fillStyle = atmosphere;
        context.fillRect(0, 0, WORLD_WIDTH, GROUND_Y + 20);
      }

      // Wave 3+: drifting forest haze and dry-season dust.
      const dryStrength = smoothStep((worldWave - 2.0) / 1.8);
      if (dryStrength > 0.01) {
        context.save();
        for (let i = 0; i < 7; i += 1) {
          const drift = (time * (0.025 + (i % 4) * 0.009) + i * 113) % (WORLD_WIDTH + 50);
          const x = WORLD_WIDTH - drift, y = 145 + ((i * 31) % 105) + Math.sin(time / 520 + i) * 5;
          context.globalAlpha = dryStrength * (0.08 + (i % 3) * 0.025);
          context.fillStyle = i % 2 ? "#c6a879" : "#7d7860";
          context.beginPath();
          context.ellipse(x, y, 13 + (i % 4) * 4, 3 + (i % 2) * 2, -.12, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      }

      // Wave 4+: layered smoke drifts across the distant sky, never obscuring the runner.
      const smokeStrength = smoothStep((worldWave - 3.0) / 1.8);
      if (smokeStrength > 0.01) {
        context.save();
        for (let i = 0; i < 5; i += 1) {
          const x = ((i * 151 + time * (0.012 + (i % 3) * 0.004)) % (WORLD_WIDTH + 180)) - 90;
          const y = 82 + (i % 4) * 27 + Math.sin(time / 1100 + i) * 5;
          const radius = 28 + (i % 3) * 12;
          context.globalAlpha = smokeStrength * (0.10 + (i % 3) * 0.025);
          context.fillStyle = i % 2 ? "#77716a" : "#8b7868";
          context.beginPath();
          context.ellipse(x, y, radius * 1.65, radius * .42, 0, 0, Math.PI * 2);
          context.ellipse(x + radius * .6, y - 5, radius, radius * .36, 0, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      }

      // Wave 5+: drifting ash and distant embers.
      const emberStrength = smoothStep((worldWave - 4.0) / 1.2);
      if (emberStrength > 0.01) {
        context.save();
        for (let i = 0; i < 12; i += 1) {
          const x = (i * 83 + time * (0.018 + (i % 4) * 0.008)) % WORLD_WIDTH;
          const y = 80 + ((time * (0.018 + (i % 5) * 0.006) + i * 31) % 205);
          const flicker = 0.4 + 0.6 * Math.abs(Math.sin(time / 190 + i * 1.7));
          context.globalAlpha = emberStrength * flicker * 0.58;
          context.fillStyle = i % 4 === 0 ? "#d6c3a2" : (i % 3 === 0 ? "#ffbd69" : "#e77a43");
          context.beginPath();
          context.arc(x, y, i % 4 === 0 ? 2 : 1.3, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      }

      // Wave 6: warm firelight glow replaces the old meteor effect.
      const fireWorldStrength = smoothStep((worldWave - 5.0) / 0.85);
      if (fireWorldStrength > 0.01) {
        context.save();
        const glow = context.createLinearGradient(0, 105, 0, GROUND_Y);
        glow.addColorStop(0, "rgba(89,43,32,0)");
        glow.addColorStop(.72, "rgba(181,72,34,.12)");
        glow.addColorStop(1, "rgba(235,91,31,.17)");
        context.globalAlpha = fireWorldStrength;
        context.fillStyle = glow;
        context.fillRect(0, 100, WORLD_WIDTH, GROUND_Y - 100);
        context.restore();
      }

      // Arcade-style score HUD is rendered inside the playfield canvas.
      context.save();
      context.textBaseline = "top";
      const displayedPoints = Math.floor(game.distance / 8);
      context.font = "900 16px system-ui, sans-serif";
      context.textAlign = "left";
      context.fillStyle = "rgba(20,55,36,.94)";
      context.fillText("DISTANCE / SCORE", 17, 13);
      context.font = "900 25px ui-monospace, monospace";
      context.fillStyle = "#fff6cf";
      context.shadowColor = "rgba(19,48,31,.8)";
      context.shadowBlur = 5;
      context.fillText(String(displayedPoints).padStart(5,"0"), 16, 31);
      context.textAlign = "right";
      context.shadowBlur = 0;
      context.font = "900 15px system-ui, sans-serif";
      context.fillStyle = "rgba(24,60,39,.96)";
      context.fillText("BEST DISTANCE", WORLD_WIDTH - 17, 12);
      context.font = "900 23px ui-monospace, monospace";
      context.fillStyle = "#fff6cf";
      context.shadowColor = "rgba(19,48,31,.8)";
      context.shadowBlur = 4;
      context.fillText(String(bestRef.current).padStart(5,"0"), WORLD_WIDTH - 17, 31);
      context.restore();

      // Cinematic Wave banner: readable panel, brief pulse, no speed indicator.
      context.save();
      const waveElapsed = Math.max(0, time - game.waveChangedAt);
      const waveBlink = waveElapsed < 1500 ? (Math.floor(waveElapsed / 300) % 2 === 0 ? 1 : 0.72) : 1;
      context.globalAlpha = waveBlink;
      const bannerX = 205;
      const bannerY = 48;
      const bannerW = 490;
      const bannerH = 54;
      const banner = context.createLinearGradient(0, bannerY, 0, bannerY + bannerH);
      const bannerPalettes = [
        [[20,66,38],[19,49,34],[183,223,145]],
        [[21,71,48],[15,48,37],[155,207,145]],
        [[17,55,39],[12,36,31],[138,184,154]],
        [[91,73,39],[55,49,34],[213,189,121]],
        [[75,59,48],[43,38,35],[198,155,120]],
        [[83,37,27],[38,25,24],[255,154,88]],
      ];
      const bannerIndex = Math.min(4, Math.floor(paletteLevel));
      const bannerProgress = paletteLevel - bannerIndex;
      const bannerFrom = bannerPalettes[bannerIndex];
      const bannerTo = bannerPalettes[bannerIndex + 1];
      const bannerFillTop = mixColor(bannerFrom[0], bannerTo[0], bannerProgress);
      const bannerFillBottom = mixColor(bannerFrom[1], bannerTo[1], bannerProgress);
      const bannerStroke = mixColor(bannerFrom[2], bannerTo[2], bannerProgress);
      banner.addColorStop(0, bannerFillTop);
      banner.addColorStop(.5, bannerFillBottom);
      banner.addColorStop(1, bannerFillBottom);
      context.shadowColor = paletteLevel >= 4 ? "rgba(255,116,55,.48)" : "rgba(170,211,132,.35)";
      context.shadowBlur = 13;
      context.fillStyle = banner;
      context.strokeStyle = bannerStroke;
      context.lineWidth = 2;
      context.beginPath();
      context.roundRect(bannerX, bannerY, bannerW, bannerH, 15);
      context.fill();
      context.stroke();
      context.shadowBlur = 0;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#ffe9a6";
      context.font = "900 11px system-ui, sans-serif";
      context.fillText("✦  A NEW ERA BEGINS  ✦", WORLD_WIDTH / 2, bannerY + 13);
      context.fillStyle = "#fff8df";
      context.shadowColor = "rgba(0,0,0,.72)";
      context.shadowBlur = 4;
      context.font = "900 18px system-ui, sans-serif";
      context.fillText("WAVE " + game.wave + "  ·  " + WAVE_TITLES[game.wave - 1], WORLD_WIDTH / 2, bannerY + 36);
      context.restore();

      const player = game.player;
      const running = game.running && !player.jumping;
      const stride = running ? Math.sin(time / 72) : 0;
      const bob = running ? Math.abs(Math.sin(time / 72)) * 1.8 : 0;
      const jumpTilt = player.jumping ? Math.max(-0.08, Math.min(0.08, player.velocityY * 0.004)) : 0;
      const sprite = characterSpriteRef.current;
      const jumpHeight = Math.max(0, (GROUND_Y - 58) - player.y);
      const shadowScale = Math.max(0.42, 1 - jumpHeight / 190);
      const shadowAlpha = Math.max(0.16, 0.34 - jumpHeight / 520);
      // Soft contact shadow stays on the grass; it tightens and fades while airborne.
      context.save();
      context.globalAlpha = shadowAlpha;
      context.fillStyle = "#183b27";
      context.beginPath();
      context.ellipse(player.x + 61, GROUND_Y + 8, 24.5 * shadowScale, 4.9 * shadowScale, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
      if (sprite?.complete && sprite.naturalWidth > 0) {
        const cellW = sprite.naturalWidth / 3;
        const cellH = sprite.naturalHeight / 3;
        const frame = running ? Math.floor(time / 105) % 9 : player.jumping ? 7 : 0;
        const sx = (frame % 3) * cellW;
        const sy = Math.floor(frame / 3) * cellH;
        // Compact runner scale, anchored precisely to the top edge of the grass.
        const drawW = 100;
        const drawH = 89;
        const groundAnchorX = player.x + 61;
        const groundAnchorY = player.y + 58 + bob;
        context.save();
        context.translate(groundAnchorX, groundAnchorY);
        context.rotate(jumpTilt);
        context.drawImage(sprite, sx, sy, cellW, cellH, -drawW / 2, -drawH, drawW, drawH);
        context.restore();
      }
      game.obstacles.forEach((obstacle) => {
        const cx = obstacle.x + obstacle.width / 2;
        const flying = obstacle.type === "ptero" || obstacle.type === "archaeo";
        // Render every obstacle at 80% size, centered on its original position.
        context.save();
        context.translate(cx, flying ? obstacle.y : GROUND_Y);
        context.scale(0.8, 0.8);
        context.translate(-cx, flying ? -obstacle.y : -GROUND_Y);
        context.lineWidth = 3;
        context.lineJoin = "round";
        if (obstacle.type === "rock") {
          context.fillStyle = "#89969a"; context.strokeStyle = "#344b50";
          context.beginPath(); context.moveTo(obstacle.x,GROUND_Y); context.lineTo(obstacle.x+5,GROUND_Y-20); context.lineTo(cx,GROUND_Y-35); context.lineTo(obstacle.x+obstacle.width-3,GROUND_Y-18); context.lineTo(obstacle.x+obstacle.width,GROUND_Y); context.closePath(); context.fill(); context.stroke();
          context.fillStyle = "#e4ece5"; context.fillRect(obstacle.x+8,GROUND_Y-20,7,4);
        } else if (obstacle.type === "egg") {
          const colors = ["#f5d46b","#eaa49b","#b8d8ef"];
          for (let n=0;n<3;n++) { const ex=cx+(n-1)*14; context.fillStyle=colors[n]; context.strokeStyle="#67432f"; context.beginPath(); context.ellipse(ex,GROUND_Y-13,9,14,0,0,Math.PI*2); context.fill(); context.stroke(); context.fillStyle="#fff4d4"; context.fillRect(ex-4,GROUND_Y-21,3,5); }
        } else if (obstacle.type === "log") {
          context.fillStyle="#a86632"; context.strokeStyle="#55331f"; context.beginPath(); context.roundRect(obstacle.x,GROUND_Y-22,obstacle.width,22,8); context.fill(); context.stroke();
          context.fillStyle="#e9b66f"; context.beginPath(); context.ellipse(obstacle.x+obstacle.width-5,GROUND_Y-11,7,10,0,0,Math.PI*2); context.fill(); context.stroke();
          context.strokeStyle="#f3ca82"; context.lineWidth=2; context.beginPath(); context.moveTo(obstacle.x+8,GROUND_Y-17); context.lineTo(obstacle.x+obstacle.width-12,GROUND_Y-17); context.stroke();
        } else {
          const flap = Math.sin(time / 85 + obstacle.phase) * 9;
          context.translate(cx, obstacle.y);
          context.fillStyle = obstacle.type === "ptero" ? "#e65d3f" : "#356ec1";
          context.strokeStyle = obstacle.type === "ptero" ? "#762b24" : "#193a75";
          context.beginPath(); context.moveTo(-8,0); context.quadraticCurveTo(-23,-23-flap,-43,-25-flap); context.quadraticCurveTo(-33,-4,-8,7); context.lineTo(0,2); context.lineTo(8,7); context.quadraticCurveTo(33,-4,43,-25-flap); context.quadraticCurveTo(23,-23-flap,8,0); context.closePath(); context.fill(); context.stroke();
          context.beginPath(); context.ellipse(0,0,17,8,0,0,Math.PI*2); context.fill(); context.stroke();
          context.fillStyle="#fff"; context.beginPath(); context.arc(10,-2,2.5,0,Math.PI*2); context.fill();
        }
        context.restore();
      });

      if (game.paused) {
        context.save();
        context.fillStyle = "rgba(5,12,15,.58)";
        context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        const blink = 0.82 + Math.sin(time / 240) * 0.18;
        context.globalAlpha = blink;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.shadowColor = "rgba(0,0,0,.7)";
        context.shadowBlur = 12;
        context.fillStyle = "#ffe79a";
        context.font = "900 38px system-ui, sans-serif";
        context.fillText("PAUSED", WORLD_WIDTH / 2, 165);
        context.globalAlpha = 1;
        const resumeGradient = context.createLinearGradient(0, 210, 0, 266);
        resumeGradient.addColorStop(0, "#62bd61");
        resumeGradient.addColorStop(1, "#23623b");
        context.shadowBlur = 9;
        context.fillStyle = resumeGradient;
        context.strokeStyle = "#ffe18a";
        context.lineWidth = 3;
        context.beginPath();
        context.roundRect(350, 210, 200, 56, 14);
        context.fill();
        context.stroke();
        context.shadowBlur = 0;
        context.fillStyle = "#fff7d8";
        context.font = "900 17px system-ui, sans-serif";
        context.fillText("▶  LANJUTKAN", WORLD_WIDTH / 2, 238);
        context.restore();
      }

      if (!game.running && !game.paused) {
        context.fillStyle = game.over ? "rgba(5,12,15,.48)" : "rgba(5,15,19,.22)";
        context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        context.save();
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.shadowColor = "rgba(0,0,0,.65)";
        context.shadowBlur = 8;
        context.fillStyle = "#fff5cf";
        context.font = "900 34px system-ui, sans-serif";
        context.fillText(game.over ? "GAME OVER" : "READY TO RUN?", WORLD_WIDTH / 2, game.over ? 151 : 157);
        context.shadowBlur = 3;
        context.fillStyle = "#ffffff";
        context.font = "700 17px system-ui, sans-serif";
        context.fillText(game.over ? `DISTANCE  ${Math.floor(game.distance / 8)}` : "LARI SEJAUH MUNGKIN · HINDARI RINTANGAN", WORLD_WIDTH / 2, 190);
        if (game.over) {
          context.fillStyle = "#fff0a5";
          context.font = "800 15px system-ui, sans-serif";
          context.fillText(`BEST DISTANCE  ${bestRef.current}`, WORLD_WIDTH / 2, 214);
        }
        const buttonTop = 238;
        const buttonHeight = 48;
        const buttonGradient = context.createLinearGradient(0, buttonTop, 0, buttonTop + buttonHeight);
        buttonGradient.addColorStop(0, "#ffe18a");
        buttonGradient.addColorStop(1, "#d98a35");
        context.shadowColor = "rgba(0,0,0,.35)";
        context.shadowBlur = 8;
        context.fillStyle = buttonGradient;
        context.strokeStyle = "#fff0b6";
        context.lineWidth = 2;
        context.beginPath();
        context.roundRect(350, buttonTop, 200, buttonHeight, 14);
        context.fill();
        context.stroke();
        context.shadowBlur = 0;
        context.fillStyle = "#382515";
        context.font = "900 17px system-ui, sans-serif";
        context.fillText(game.over ? "TRY AGAIN" : "PLAY GAME", WORLD_WIDTH / 2, buttonTop + buttonHeight / 2 + 1);
        context.restore();
      }
    };

    const update = (time) => {
      if (!game.running || game.paused) return;

      const delta = game.lastTime ? Math.min((time - game.lastTime) / 16.67, 1.75) : 1;
      game.lastTime = time;
      game.distance += game.speed * delta;
      const points = Math.floor(game.distance / 8);
      const nextWave = WAVE_STARTS.reduce((wave, start, index) => points >= start ? index + 1 : wave, 1);
      const nextBoundary = WAVE_STARTS[game.wave] ?? Infinity;
      const leadPoints = (game.speed * 60 / 8) * WAVE_TRANSITION_LEAD_SECONDS;

      // Start blending before the next Wave, then finish several seconds after its title changes.
      if (game.transitionStartedAt === null && game.wave < 6 && points >= nextBoundary - leadPoints) {
        game.transitionStartedAt = time;
        game.transitionFrom = game.wave - 1;
        game.transitionTo = game.wave;
      }
      if (nextWave !== game.wave) {
        game.wave = nextWave;
        game.waveChangedAt = time;
        playTone(760, 0.12);
      }
      if (game.transitionStartedAt !== null && time - game.transitionStartedAt >= WAVE_TRANSITION_DURATION) {
        game.transitionStartedAt = null;
        game.transitionFrom = game.wave - 1;
        game.transitionTo = game.wave - 1;
      }
      game.speed = getWaveSpeed(game.wave);

      const player = game.player;
      player.velocityY += 0.72 * delta;
      player.y += player.velocityY * delta;
      if (player.y >= GROUND_Y - 58) {
        player.y = GROUND_Y - 58;
        player.velocityY = 0;
        player.jumping = false;
      }

      game.spawn -= delta;
      if (game.spawn <= 0) {
        const roll = Math.random();
        const type = roll < 0.25 ? "rock" : roll < 0.5 ? "egg" : roll < 0.72 ? "log" : roll < 0.86 ? "ptero" : "archaeo";
        const flying = type === "ptero" || type === "archaeo";
        game.obstacles.push({ x: WORLD_WIDTH + 18, width: type === "log" ? 56 : type === "egg" ? 48 : flying ? 72 : 40, type, y: flying ? (type === "ptero" ? 175 : 198) : GROUND_Y, phase: Math.random()*6.28 });
        const obstacleGap = 492 + Math.random() * 288;
        game.spawn = obstacleGap / game.speed;
      }

      game.obstacles.forEach((obstacle) => { obstacle.x -= game.speed * delta; });
      game.obstacles = game.obstacles.filter((obstacle) => obstacle.x > -60);
      game.clouds.forEach((cloud) => {
        cloud.x -= game.speed * 0.16 * delta;
        if (cloud.x < -70) cloud.x = WORLD_WIDTH + 40;
      });

      // Gameplay hitbox is intentionally compact and independent of sprite artwork size.
      const playerBox = {
        left: player.x + 30.9,
        right: player.x + 91.1,
        top: player.y + 27,
        bottom: player.y + 51,
      };
      const collided = game.obstacles.some((obstacle) => {
        const flying = obstacle.type === "ptero" || obstacle.type === "archaeo";
        const originalTop = flying ? obstacle.y - 27 : obstacle.type === "rock" ? GROUND_Y - 35 : GROUND_Y - 28;
        const originalBottom = flying ? obstacle.y + 9 : GROUND_Y;
        const centerY = (originalTop + originalBottom) / 2;
        const halfHeight = (originalBottom - originalTop) * 0.4;
        const hitLeft = obstacle.x + obstacle.width * 0.1;
        const hitRight = obstacle.x + obstacle.width * 0.9;
        const hitTop = centerY - halfHeight;
        const hitBottom = centerY + halfHeight;
        return playerBox.right > hitLeft && playerBox.left < hitRight && playerBox.bottom > hitTop && playerBox.top < hitBottom;
      });

      if (points !== game.lastScore) {
        game.lastScore = points;
        if (time - game.lastUiUpdate >= 100) {
          game.lastUiUpdate = time;
          setScore(points);
        }
      }

      if (collided) {
        game.running = false;
        game.over = true;
        setScore(points);
        setBest((previousBest) => {
          const nextBest = Math.max(previousBest, points);
          bestRef.current = nextBest;
          try {
            window.localStorage.setItem(BEST_SCORE_KEY, String(nextBest));
          } catch {
            // The current session still keeps the score if storage is unavailable.
          }
          return nextBest;
        });
        setStatus("over");
        playTone(140, 0.24);
      }
    };

    const frame = (time) => {
      update(time);
      const visualTime = game.paused
        ? game.pauseStartedAt - game.pausedDuration
        : time - game.pausedDuration;
      draw(visualTime);
      frameRef.current = window.requestAnimationFrame(frame);
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    frameRef.current = window.requestAnimationFrame(frame);

    const handleKeyDown = (event) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      gameRef.current = null;
    };
  }, [jump, playTone]);

  useEffect(() => () => {
    if (audioRef.current && audioRef.current.state !== "closed") {
      audioRef.current.close().catch(() => {});
    }
  }, []);

  const toggleSound = () => {
    setSoundOn((enabled) => !enabled);
  };

  return (
    <main className="mini-game-screen mg-page relative z-[60] min-h-[100svh] w-full overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[#080711] px-3 pb-[max(18px,env(safe-area-inset-bottom))] pt-[max(10px,env(safe-area-inset-top))] text-white sm:px-5">
      <div className="mg-game-layout mx-auto flex min-h-[calc(100svh-24px)] w-full max-w-[720px] flex-col gap-3 overflow-visible">
        <div className={`mg-game-topbar flex items-center justify-between gap-3 ${isFullscreen ? "is-hidden" : ""}`}>
          <button type="button" onClick={() => setConfirmExit(true)} className="mg-toolbar-exit ui-interactive rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[10px] font-black tracking-wider text-purple-200">← KELUAR GAME</button>
          <button type="button" onClick={toggleFullscreen} className="mg-toolbar-landscape ui-interactive rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-2.5 text-[10px] font-black text-emerald-100">⛶ LANDSCAPE</button>
          <div className="mg-toolbar-icons">
            <button type="button" onClick={toggleSound} aria-label={soundOn ? "Matikan suara" : "Nyalakan suara"} aria-pressed={soundOn} className="mg-icon-control" title={soundOn ? "Sound ON" : "Sound OFF"}>{soundOn ? "♫" : "♪"}</button>
            <button type="button" onClick={togglePause} aria-label={isPaused ? "Lanjutkan permainan" : "Pause permainan"} className="mg-icon-control" title={isPaused ? "Lanjutkan" : "Pause"}>{isPaused ? "▶" : "Ⅱ"}</button>
          </div>
        </div>

        <header className={`mg-game-header shrink-0 space-y-1 text-center ${isFullscreen ? "is-hidden" : ""}`}>
          <p className="mg-eyebrow">DAJJAL FAMILY · ARCADE</p>
          <h1 className="mg-game-title ui-title mx-auto w-full max-w-full px-2 py-2 text-center">
            DAJJAL FAMILY <span className="text-purple-300">JUMP</span>
          </h1>
          <p className="mg-copy mx-auto max-w-[38rem] px-3 text-center">
            Lari sejauh mungkin. Hindari rintangan. Pecahkan rekor jarakmu!
          </p>
        </header>

        <section ref={arenaRef} className={`mg-arena mg-game-arena mg-fullscreen-arena flex w-full flex-none flex-col justify-start overflow-hidden p-2.5 sm:p-4 ${isFullscreen ? "is-fullscreen" : ""}`}>
          <div className="mg-game-world-frame mg-jungle-world w-full overflow-hidden rounded-2xl border border-purple-300/15">
            <div className="mg-game-canvas-frame relative w-full overflow-hidden">
              {isFullscreen && <div className="mg-fullscreen-tools">
                <div className="mg-fullscreen-icon-stack">
                  <button type="button" onClick={toggleSound} aria-label={soundOn ? "Matikan suara" : "Nyalakan suara"} className="mg-icon-control">{soundOn ? "♫" : "♪"}</button>
                  <button type="button" onClick={togglePause} aria-label={isPaused ? "Lanjutkan permainan" : "Pause permainan"} className="mg-icon-control">{isPaused ? "▶" : "Ⅱ"}</button>
                  <button type="button" onClick={toggleFullscreen} className="mg-icon-control mg-fullscreen-exit" aria-label="Keluar mode landscape" title="Keluar landscape">↙</button>
                </div>
              </div>}
              <canvas
                ref={canvasRef}
                className="mg-game-canvas block w-full touch-none"
                aria-label="Permainan lari dan melompat. Ketuk area permainan atau tekan Space untuk melompat."
                onPointerDown={handleCanvasPointer}
              />
            </div>

          </div>

          <div className={`mg-game-controls mt-2 flex shrink-0 flex-col items-center gap-2 sm:mt-3 ${isFullscreen ? "is-hidden" : ""}`}>
            <p className="text-center text-[10px] leading-relaxed text-gray-500 sm:text-[11px]">
              TAP layar untuk melompat · SPACE / ↑ di desktop
            </p>
            <button
              type="button"
              onClick={jump}
              disabled={status === "over"}
              className="mg-dino-jump ui-interactive min-h-11 w-full rounded-xl px-6 py-2.5 text-xs font-black sm:text-sm"
            >
              JUMP ↑
            </button>
          </div>
        </section>

      </div>
      {confirmExit && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-5 backdrop-blur-md" onClick={() => setConfirmExit(false)}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="exit-game-title" className="ui-popup w-full max-w-sm rounded-3xl border border-purple-300/25 bg-[#151020] p-6 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 text-4xl">🚪</div>
            <p className="ui-eyebrow">LEAVE THIS GAME?</p>
            <h2 id="exit-game-title" className="text-xl font-black text-white">KELUAR DARI GAME?</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">Permainan akan ditinggalkan dan sesi yang sedang berjalan akan berakhir. Yakin ingin keluar?</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setConfirmExit(false)} className="ui-interactive rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-gray-300">LANJUT MAIN</button>
              <button type="button" onClick={() => { window.location.href = "/games"; }} className="ui-interactive rounded-xl bg-purple-600 px-4 py-3 text-xs font-black text-white">YA, KELUAR</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
