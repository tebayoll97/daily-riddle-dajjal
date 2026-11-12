"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "../mini-game-master.css";
import "./run-jump.css";

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 420;
const GROUND_Y = 326;
const BEST_SCORE_KEY = "dajjal-run-jump-best";
const WAVE_TITLES = [
  "Awal Mula Era Dinosaurus",
  "Kebangkitan Para Raksasa",
  "Guncangan Zaman Purba",
  "Badai Kepunahan",
  "Amukan Langit dan Bumi",
  "ERA METEOR CHAOS",
];
const WAVE_STARTS = [0, 1200, 2600, 4100, 5700, 7400];
const WAVE_TRANSITION_LEAD_SECONDS = 6;
const WAVE_TRANSITION_DURATION = 12000;
const WORLD_TINTS = [
  { color: [72, 190, 150], alpha: 0.00 },
  { color: [105, 174, 119], alpha: 0.035 },
  { color: [115, 132, 105], alpha: 0.09 },
  { color: [103, 111, 117], alpha: 0.17 },
  { color: [191, 91, 55], alpha: 0.22 },
  { color: [112, 35, 37], alpha: 0.34 },
];
const clamp01 = (value) => Math.max(0, Math.min(1, value));
const smoothStep = (value) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const mix = (from, to, amount) => from + (to - from) * amount;
const mixColor = (from, to, amount) =>
  `rgb(${Math.round(mix(from[0], to[0], amount))},${Math.round(mix(from[1], to[1], amount))},${Math.round(mix(from[2], to[2], amount))})`;

export default function MiniGamePage() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const frameRef = useRef(0);
  const spriteRef = useRef(null);
  const bestRef = useRef(0);
  const soundRef = useRef(true);
  const audioRef = useRef(null);

  const [status, setStatus] = useState("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [confirmExit, setConfirmExit] = useState(false);

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
      over: false,
      speed: 6,
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
    setStatus("playing");
    playTone(650);
  }, [playTone]);

  const jump = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;

    if (!game.running) {
      if (!game.over) startGame();
      return;
    }

    if (!game.player.jumping) {
      game.player.velocityY = -13.8;
      game.player.jumping = true;
      playTone(500);
    }
  }, [playTone, startGame]);

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
      over: false,
      speed: 6,
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
      player: { x: 105, y: GROUND_Y - 58, velocityY: 0, jumping: false },
      obstacles: [],
      clouds: [{ x: 180, y: 65 }, { x: 520, y: 105 }, { x: 790, y: 48 }],
    };
    gameRef.current = game;

    const sprite = new Image();
    sprite.onload = () => { spriteRef.current = sprite; };
    sprite.onerror = () => { spriteRef.current = null; };
    sprite.src = "/universe-characters.png";

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.35 : 1.5);
      const width = Math.max(1, Math.round(rect.width * pixelRatio));
      const height = Math.max(1, Math.round((rect.width * WORLD_HEIGHT / WORLD_WIDTH) * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.setTransform(width / WORLD_WIDTH, 0, 0, width / WORLD_WIDTH, 0, 0);
    };

    const draw = (time) => {
      context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      context.save();
      context.translate(0, 100);

      // Living prehistoric world: all four parallax layers are drawn in one
      // canvas coordinate space so no image seams or black strip boundaries appear.
      const travel = game.distance;
      const sky = context.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
      sky.addColorStop(0, "#38bdf0");
      sky.addColorStop(0.62, "#8be0f1");
      sky.addColorStop(1, "#c7edb0");
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

      // Far mountains and a small volcano; their movement is deliberately subtle.
      const mountainShift = (travel * 0.18) % 900;
      context.save();
      context.translate(-mountainShift, 0);
      for (let repeat = 0; repeat < 2; repeat += 1) {
        const ox = repeat * 900;
        context.fillStyle = "#80c9a0";
        context.beginPath();
        context.moveTo(ox - 40, 177);
        context.lineTo(ox + 105, 86);
        context.lineTo(ox + 205, 177);
        context.lineTo(ox + 315, 105);
        context.lineTo(ox + 435, 177);
        context.lineTo(ox + 560, 94);
        context.lineTo(ox + 705, 177);
        context.lineTo(ox + 815, 112);
        context.lineTo(ox + 930, 177);
        context.closePath();
        context.fill();
        context.fillStyle = "#b5e4c0";
        context.beginPath();
        context.moveTo(ox + 78, 105); context.lineTo(ox + 105, 86); context.lineTo(ox + 132, 110);
        context.lineTo(ox + 105, 101); context.closePath(); context.fill();
        context.beginPath();
        context.moveTo(ox + 535, 111); context.lineTo(ox + 560, 94); context.lineTo(ox + 586, 113);
        context.lineTo(ox + 560, 105); context.closePath(); context.fill();
        // Volcano silhouette with a quiet orange crater accent.
        context.fillStyle = "#668f79";
        context.beginPath();
        context.moveTo(ox + 625, 178); context.lineTo(ox + 700, 73);
        context.lineTo(ox + 725, 88); context.lineTo(ox + 790, 178);
        context.closePath(); context.fill();
        context.fillStyle = "#e88b54";
        context.beginPath();
        context.moveTo(ox + 689, 89); context.lineTo(ox + 700, 73); context.lineTo(ox + 711, 90);
        context.closePath(); context.fill();
      }
      context.restore();

      // Mid-distance jungle silhouettes, ruins and tiny waterfall.
      const forestShift = (travel * 0.45) % 900;
      context.save();
      context.translate(-forestShift, 0);
      for (let repeat = 0; repeat < 2; repeat += 1) {
        const ox = repeat * 900;
        context.fillStyle = "#438f65";
        context.fillRect(ox, 166, 900, 63);
        const tree = (x, base, scale = 1) => {
          context.fillStyle = "#76583b";
          context.fillRect(x - 5 * scale, base - 54 * scale, 10 * scale, 58 * scale);
          context.fillStyle = "#277c50";
          context.beginPath();
          context.arc(x, base - 61 * scale, 34 * scale, 0, Math.PI * 2);
          context.arc(x - 22 * scale, base - 48 * scale, 23 * scale, 0, Math.PI * 2);
          context.arc(x + 24 * scale, base - 48 * scale, 24 * scale, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "rgba(139,207,105,.55)";
          context.beginPath();
          context.arc(x - 8 * scale, base - 75 * scale, 14 * scale, 0, Math.PI * 2);
          context.fill();
        };
        tree(ox + 120, 224, .8);
        tree(ox + 340, 222, 1.12);
        tree(ox + 610, 225, .9);
        tree(ox + 830, 222, 1.05);
        // Ancient stone arch/ruin.
        context.fillStyle = "#9b9875";
        context.fillRect(ox + 690, 137, 15, 48);
        context.fillRect(ox + 748, 137, 15, 48);
        context.fillRect(ox + 684, 130, 85, 13);
        context.fillStyle = "#587c5e";
        context.fillRect(ox + 703, 149, 38, 36);
        // Waterfall ribbon on the distant cliff.
        context.fillStyle = "rgba(190,239,242,.75)";
        context.fillRect(ox + 485, 142, 13, 37);
        context.fillStyle = "rgba(255,255,255,.55)";
        context.fillRect(ox + 488 + Math.sin(time / 230) * 2, 145, 3, 29);
      }
      context.restore();

      // Decorative dinosaur silhouettes were removed; distant scenery stays uncluttered.

      // Foreground grass and soil are part of the same canvas, aligned to collision.
      context.fillStyle = "#8b5a37";
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
      context.fillStyle = "#55b94f";
      context.fillRect(0, GROUND_Y, WORLD_WIDTH, 12);
      context.fillStyle = "#8be06a";
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

      // Progressive world atmosphere: palette and effects blend continuously across Wave boundaries.
      const activeTransition = game.transitionStartedAt !== null;
      const transitionRaw = activeTransition
        ? clamp01((time - game.transitionStartedAt) / WAVE_TRANSITION_DURATION)
        : 1;
      const transitionEase = smoothStep(transitionRaw);
      const tintFrom = WORLD_TINTS[game.transitionFrom] || WORLD_TINTS[0];
      const tintTo = WORLD_TINTS[game.transitionTo] || tintFrom;
      const tintAlpha = mix(tintFrom.alpha, tintTo.alpha, transitionEase);
      const tintColor = mixColor(tintFrom.color, tintTo.color, transitionEase);

      if (tintAlpha > 0.001) {
        const atmosphere = context.createLinearGradient(0, 0, 0, GROUND_Y + 20);
        atmosphere.addColorStop(0, `rgba(${tintColor.match(/\\d+/g).join(",")},${tintAlpha})`);
        atmosphere.addColorStop(1, `rgba(35,30,28,${tintAlpha * 0.42})`);
        context.fillStyle = atmosphere;
        context.fillRect(0, 0, WORLD_WIDTH, GROUND_Y + 20);
      }

      const worldWave = activeTransition
        ? mix(game.transitionFrom + 1, game.transitionTo + 1, transitionEase)
        : game.wave;

      // Wave 3+: subtle earthquake dust and occasional falling stones.
      const quakeStrength = smoothStep((worldWave - 2.25) / 0.8);
      if (quakeStrength > 0.01) {
        context.save();
        context.globalAlpha = quakeStrength * 0.28;
        for (let i = 0; i < 9; i += 1) {
          const drift = (time * (0.035 + i * 0.004) + i * 137) % (WORLD_WIDTH + 30);
          const x = WORLD_WIDTH - drift;
          const y = 185 + ((i * 29) % 105) + Math.sin(time / 420 + i) * 4;
          context.fillStyle = i % 2 ? "#b5a28b" : "#796b5d";
          context.beginPath();
          context.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      }

      // Wave 4+: distant lightning flashes, kept faint so the runner remains readable.
      const stormStrength = smoothStep((worldWave - 3.15) / 0.85);
      const lightningPulse = Math.pow(Math.max(0, Math.sin(time / 1750 + 0.8)), 18);
      if (stormStrength > 0.01 && lightningPulse > 0.12) {
        context.save();
        context.globalAlpha = stormStrength * lightningPulse * 0.24;
        context.fillStyle = "#dcecff";
        context.fillRect(0, 0, WORLD_WIDTH, GROUND_Y);
        context.globalAlpha *= 1.8;
        context.strokeStyle = "#e9f5ff";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(690, 18);
        context.lineTo(678, 42);
        context.lineTo(690, 42);
        context.lineTo(674, 70);
        context.stroke();
        context.restore();
      }

      // Wave 5+: ember and ash particles; deterministic motion avoids per-frame random allocations.
      const emberStrength = smoothStep((worldWave - 4.05) / 0.8);
      if (emberStrength > 0.01) {
        context.save();
        for (let i = 0; i < 22; i += 1) {
          const x = (i * 83 + time * (0.018 + (i % 4) * 0.008)) % WORLD_WIDTH;
          const y = GROUND_Y - ((time * (0.018 + (i % 5) * 0.006) + i * 31) % 245);
          const flicker = 0.45 + 0.55 * Math.abs(Math.sin(time / 190 + i * 1.7));
          context.globalAlpha = emberStrength * flicker * 0.72;
          context.fillStyle = i % 3 === 0 ? "#ffd27a" : "#ff7848";
          context.beginPath();
          context.arc(x, y, i % 4 === 0 ? 2.2 : 1.35, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      }

      // Wave 6: one distant meteor crosses the horizon; it never enters the play lane.
      const meteorStrength = smoothStep((worldWave - 5.05) / 0.85);
      if (meteorStrength > 0.01) {
        const meteorCycle = (time % 11500) / 11500;
        const meteorX = 850 - meteorCycle * 330;
        const meteorY = 78 + meteorCycle * 76;
        context.save();
        context.globalAlpha = meteorStrength * (meteorCycle < 0.82 ? 1 : 0);
        context.strokeStyle = "rgba(255,151,83,.25)";
        context.lineWidth = 13;
        context.beginPath();
        context.moveTo(meteorX + 72, meteorY - 34);
        context.lineTo(meteorX, meteorY);
        context.stroke();
        context.strokeStyle = "rgba(255,207,126,.78)";
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(meteorX + 55, meteorY - 26);
        context.lineTo(meteorX, meteorY);
        context.stroke();
        const meteorGlow = context.createRadialGradient(meteorX, meteorY, 1, meteorX, meteorY, 25);
        meteorGlow.addColorStop(0, "rgba(255,246,197,.95)");
        meteorGlow.addColorStop(0.35, "rgba(255,135,72,.8)");
        meteorGlow.addColorStop(1, "rgba(255,85,45,0)");
        context.fillStyle = meteorGlow;
        context.beginPath();
        context.arc(meteorX, meteorY, 25, 0, Math.PI * 2);
        context.fill();
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

      // Permanent, background-free wave title. Blink three times after each transition.
      context.save();
      const waveElapsed = Math.max(0, time - game.waveChangedAt);
      const waveBlink = waveElapsed < 1500 ? (Math.floor(waveElapsed / 250) % 2 === 0 ? 1 : 0.28) : 1;
      context.globalAlpha = waveBlink;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.shadowColor = "rgba(22,62,35,.72)";
      context.shadowBlur = 5;
      context.fillStyle = "#fff2a8";
      context.font = "900 22px system-ui, sans-serif";
      context.fillText("WAVE " + game.wave + "  ·  " + WAVE_TITLES[game.wave - 1], WORLD_WIDTH / 2, 76);
      context.fillStyle = "#ffffff";
      context.font = "800 13px system-ui, sans-serif";
      context.fillText("SPEED  " + (1 + (game.wave - 1) * 0.4).toFixed(1) + "×", WORLD_WIDTH / 2, 99);
      context.restore();

      const player = game.player;
      const runningBob = game.running && !player.jumping ? Math.sin(time / 75) * 2 : 0;
      if (spriteRef.current?.complete && spriteRef.current.naturalWidth > 0) {
        const spriteWidth = spriteRef.current.naturalWidth / 4;
        const spriteHeight = spriteRef.current.naturalHeight / 6;
        // Top-left cell is Dajjal's neutral character from the universe sprite sheet.
        context.drawImage(
          spriteRef.current,
          0, 0, spriteWidth, spriteHeight,
          player.x - 7, player.y + runningBob - 5, 62, 62
        );
      } else {
        context.font = "54px system-ui";
        context.textAlign = "center";
        context.fillText("🦖", player.x + 24, player.y + 50 + runningBob);
      }

      game.obstacles.forEach((obstacle) => {
        const cx = obstacle.x + obstacle.width / 2;
        context.save();
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

      if (!game.running) {
        context.fillStyle = game.over ? "rgba(5,4,12,.58)" : "rgba(6,5,15,.22)";
        context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      }
    };

    const update = (time) => {
      if (!game.running) return;

      const delta = game.lastTime ? Math.min((time - game.lastTime) / 16.67, 2) : 1;
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
      game.speed = 6 * (1 + (game.wave - 1) * 0.4);

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
        game.obstacles.push({ x: WORLD_WIDTH + 18, width: type === "log" ? 56 : type === "egg" ? 48 : flying ? 72 : 40, type, y: flying ? (type === "ptero" ? 245 : 212) : GROUND_Y, phase: Math.random()*6.28 });
        const obstacleGap = 492 + Math.random() * 288;
        game.spawn = obstacleGap / game.speed;
      }

      game.obstacles.forEach((obstacle) => { obstacle.x -= game.speed * delta; });
      game.obstacles = game.obstacles.filter((obstacle) => obstacle.x > -60);
      game.clouds.forEach((cloud) => {
        cloud.x -= game.speed * 0.16 * delta;
        if (cloud.x < -70) cloud.x = WORLD_WIDTH + 40;
      });

      const playerBox = {
        left: player.x + 9,
        right: player.x + 40,
        top: player.y + 12,
        bottom: player.y + 54,
      };
      const collided = game.obstacles.some((obstacle) => {
        const flying = obstacle.type === "ptero" || obstacle.type === "archaeo";
        const top = flying ? obstacle.y - 27 : obstacle.type === "rock" ? GROUND_Y - 35 : GROUND_Y - 28;
        const bottom = flying ? obstacle.y + 9 : GROUND_Y;
        return playerBox.right > obstacle.x + 5 && playerBox.left < obstacle.x + obstacle.width - 4 && playerBox.bottom > top && playerBox.top < bottom;
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
      draw(time);
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
      spriteRef.current = null;
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
        <div className="mg-game-topbar flex items-center justify-between gap-3">
          <button type="button" onClick={() => setConfirmExit(true)} className="ui-interactive rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[10px] font-black tracking-wider text-purple-200">← KELUAR GAME</button>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            className="ui-interactive rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2.5 text-xs font-bold text-purple-100"
          >
            {soundOn ? "♫ SOUND ON" : "♪ SOUND OFF"}
          </button>
        </div>

        <header className="mg-game-header shrink-0 space-y-1 text-center">
          <p className="mg-eyebrow">DAJJAL FAMILY · ARCADE</p>
          <h1 className="mg-game-title ui-title mx-auto w-full max-w-full px-2 py-2 text-center">
            DAJJAL FAMILY <span className="text-purple-300">JUMP</span>
          </h1>
          <p className="mg-copy mx-auto max-w-[38rem] px-3 text-center">
            Lari sejauh mungkin. Hindari rintangan. Pecahkan rekor jarakmu!
          </p>
        </header>

        <section className="mg-arena mg-game-arena flex w-full flex-none flex-col justify-start overflow-hidden p-2.5 sm:p-4">
          <div className="mg-game-world-frame mg-jungle-world w-full overflow-hidden rounded-2xl border border-purple-300/15">
            <div className="mg-game-canvas-frame relative w-full overflow-hidden">
              <canvas
                ref={canvasRef}
                className="mg-game-canvas block w-full touch-none"
                aria-label="Permainan lari dan melompat. Ketuk area permainan atau tekan Space untuk melompat."
                onPointerDown={jump}
              />
            </div>
            {status !== "playing" && (
              <div className="mg-game-state-overlay">
                <div className="mg-game-state-card">
                  <div className="mg-dino-badge" aria-hidden="true">{status === "over" ? "🦖💫" : "🦕"}</div>
                  <p className="text-lg font-black tracking-wide sm:text-xl">
                    {status === "over" ? "GAME OVER" : "READY TO RUN?"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-200 sm:text-sm">
                    {status === "over"
                      ? `Jarak kamu: ${score} poin`
                      : "Tekan tombol untuk memulai permainan"}
                  </p>
                  <button
                    type="button"
                    onClick={startGame}
                    className="mg-dino-action ui-interactive mt-2 min-h-10 w-full max-w-[210px] rounded-xl px-5 py-2 text-xs font-black tracking-wider sm:mt-3 sm:text-sm"
                  >
                    {status === "over" ? "PLAY AGAIN" : "START GAME"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mg-game-controls mt-2 flex shrink-0 flex-col items-center gap-2 sm:mt-3">
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
              <button type="button" onClick={() => { window.location.href = "/mini-game"; }} className="ui-interactive rounded-xl bg-purple-600 px-4 py-3 text-xs font-black text-white">YA, KELUAR</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
