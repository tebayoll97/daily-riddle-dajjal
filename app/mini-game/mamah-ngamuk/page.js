"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./mamah-ngamuk.css";

const W = 900;
const H = 1600;
const BEST_KEY = "mamah-ngamuk-best-v1";
const LANES = [-1, 0, 1];

export default function MamahNgamukPage() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const rafRef = useRef(0);
  const sheetRef = useRef(null);
  const obstacleSheetRef = useRef(null);
  const childSheetRef = useRef(null);
  const veyloraSheetRef = useRef(null);
  const soundRef = useRef(true);
  const audioRef = useRef(null);
  const musicRef = useRef({ timer: null, oscillators: [] });
  const touchRef = useRef(null);
  const catchTimerRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [distanceResult, setDistanceResult] = useState(0);
  const [best, setBest] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [confirmExit, setConfirmExit] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tone = useCallback((frequency = 520, duration = 0.08) => {
    if (!soundRef.current || typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = audioRef.current || new AudioContextClass();
      audioRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, []);

  const stopMusic = useCallback(() => {
    const music = musicRef.current;
    if (music.timer) window.clearInterval(music.timer);
    music.timer = null;
    music.oscillators.forEach((osc) => { try { osc.stop(); } catch {} });
    music.oscillators = [];
  }, []);

  const startMusic = useCallback(() => {
    if (!soundRef.current || musicRef.current.timer) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = audioRef.current || new AudioContextClass();
      audioRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();
      const notes = [392, 440, 523.25, 440, 349.23, 392, 466.16, 392, 329.63, 392, 440, 523.25, 466.16, 440, 392, 349.23];
      let step = 0;
      const playNote = () => {
        if (!soundRef.current || ctx.state !== "running") return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(notes[step % notes.length], now);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1500, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.012, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.27);
        osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.29);
        musicRef.current.oscillators.push(osc);
        musicRef.current.oscillators = musicRef.current.oscillators.filter((item) => item !== osc);
        step += 1;
      };
      playNote();
      musicRef.current.timer = window.setInterval(playNote, 310);
    } catch {}
  }, []);

  const start = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    Object.assign(g, { running: true, paused: false, over: false, caught: false, distance: 0, speed: 0.29, spawn: 4.8, chase: 0, scoreTick: -1, coinCount: 0 });
    Object.assign(g.player, { lane: 0, targetLane: 0, jump: 0, slide: 0 });
    g.items = [];
    setScore(0);
    setCoins(0);
    setDistanceResult(0);
    setStatus("playing");
    tone(660);
    startMusic();
  }, [tone, startMusic]);

  const move = useCallback((direction) => {
    const g = gameRef.current;
    if (!g) return;
    if (!g.running || g.paused) {
      if (!g.over && !g.paused) start();
      return;
    }
    if (direction === "left") g.player.targetLane = Math.max(-1, g.player.targetLane - 1);
    if (direction === "right") g.player.targetLane = Math.min(1, g.player.targetLane + 1);
    
  }, [start, tone]);

  useEffect(() => {
    soundRef.current = soundOn;
    if (!soundOn) stopMusic();
    else if (gameRef.current?.running && !gameRef.current?.paused) startMusic();
  }, [soundOn, startMusic, stopMusic]);

  useEffect(() => {
    try { setBest(Number(localStorage.getItem(BEST_KEY)) || 0); } catch {}
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const g = {
      running: false, paused: false, over: false, distance: 0, speed: 0.29, spawn: 4.8, chase: 0, scoreTick: -1, coinCount: 0,
      player: { lane: 0, targetLane: 0, jump: 0, slide: 0 },
      items: [],
    };
    gameRef.current = g;

    const sheet = new Image();
    const childSheet = new Image();
    childSheet.onload = () => { childSheetRef.current = childSheet; };
    childSheet.onerror = () => { childSheetRef.current = null; };
    childSheet.src = "/mini-game/mamah-ngamuk/sprite/anak_dajjal_back.png";
    const veyloraSheet = new Image();
    veyloraSheet.onload = () => { veyloraSheetRef.current = veyloraSheet; };
    veyloraSheet.onerror = () => { veyloraSheetRef.current = null; };
    veyloraSheet.src = "/mini-game/mamah-ngamuk/sprite/veylora_back.png";
    let bootFallback;
    const finishBoot = () => {
      window.clearTimeout(bootFallback);
      setStatus("ready");
    };
    bootFallback = window.setTimeout(finishBoot, 1400);
    sheet.onload = () => { sheetRef.current = sheet; finishBoot(); };
    sheet.onerror = () => { sheetRef.current = null; finishBoot(); };
    sheet.src = "/universe-characters.png";

    // Dedicated 6-column × 4-row obstacle atlas (1536 × 1024, 256px cells).
    const obstacleSheet = new Image();
    obstacleSheet.onload = () => { obstacleSheetRef.current = obstacleSheet; };
    obstacleSheet.onerror = () => { obstacleSheetRef.current = null; };
    obstacleSheet.src = "/mini-game/mamah-ngamuk/sprite/obstacles.png";

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const scale = Math.max(canvas.width / W, canvas.height / H);
      const offsetX = (canvas.width - W * scale) / 2;
      const offsetY = (canvas.height - H * scale) / 2;
      ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    };

    const laneX = (lane, z) => W / 2 + lane * (38 + z * 148);
    const drawSprite = (row, x, y, width, height, frame = 0) => {
      const s = sheetRef.current;
      if (s?.complete && s.naturalWidth > 0) {
        const cw = s.naturalWidth / 4;
        const ch = s.naturalHeight / 6;
        ctx.drawImage(s, (frame % 4) * cw, row * ch, cw, ch, x - width / 2, y - height, width, height);
        return true;
      }
      return false;
    };

    const drawChildSprite = (row, x, y, width, height, frame = 0) => {
      const sprite = childSheetRef.current;
      if (sprite?.complete && sprite.naturalWidth > 0 && sprite.naturalHeight > 0) {
        // Use the authored 8 × 6 atlas grid without requiring one exact export resolution.
        const cellW = sprite.naturalWidth / 8;
        const cellH = sprite.naturalHeight / 6;
        const col = Math.max(0, Math.min(7, frame));
        ctx.drawImage(sprite, col * cellW, row * cellH, cellW, cellH, x - width / 2, y - height, width, height);
        return true;
      }
      return false;
    };

    const drawVeyloraSprite = (row, x, y, width, height, frame = 0) => {
      const sprite = veyloraSheetRef.current;
      if (sprite?.complete && sprite.naturalWidth > 0 && sprite.naturalHeight > 0) {
        const cellW = sprite.naturalWidth / 8;
        const cellH = sprite.naturalHeight / 6;
        const col = Math.max(0, Math.min(7, frame));
        ctx.drawImage(sprite, col * cellW, row * cellH, cellW, cellH, x - width / 2, y - height, width, height);
        return true;
      }
      return false;
    };

    const draw = (time) => {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#17132d");
      sky.addColorStop(0.58, "#46556a");
      sky.addColorStop(1, "#202735");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Urban roadside skyline, streetlights and shopfront silhouettes.
      for (let i = 0; i < 13; i++) {
        const x = i * 78 - (g.distance * 22 % 78);
        const height = 65 + (i * 31 % 95);
        ctx.fillStyle = i % 2 ? "#211d38" : "#29213f";
        ctx.fillRect(x, 480 - height, 48, height);
        ctx.fillStyle = "rgba(197,166,255,.22)";
        for (let wy = 495 - height; wy < 474; wy += 17) ctx.fillRect(x + 10, wy, 4, 5);
      }

      // Residential streetscape: repeating houses on both sides, scaled by perspective.
      for (let i = 0; i < 6; i++) {
        const z = ((i / 6) + (g.distance * 0.000035 % 1)) % 1;
        const y = 500 + z * z * 930;
        const leftRoadEdge = 365 - z * 355;
        const rightRoadEdge = 535 + z * 355;
        const houseW = 48 + z * 62;
        const houseH = 54 + z * 82;
        const sideOffset = 36 + z * 58;
        [-1, 1].forEach((side) => {
          const centerX = side < 0 ? leftRoadEdge - sideOffset - houseW / 2 : rightRoadEdge + sideOffset + houseW / 2;
          ctx.save();
          ctx.translate(centerX, y);
          ctx.fillStyle = "rgba(8,10,20,.34)";
          ctx.fillRect(-houseW * .56, -houseH * .08, houseW * 1.12, houseH * .16);
          ctx.fillStyle = i % 2 ? "#353248" : "#40374a";
          ctx.fillRect(-houseW / 2, -houseH, houseW, houseH);
          ctx.fillStyle = i % 2 ? "#584354" : "#5b4651";
          ctx.beginPath();
          ctx.moveTo(-houseW * .62, -houseH);
          ctx.lineTo(0, -houseH * 1.42);
          ctx.lineTo(houseW * .62, -houseH);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "rgba(255,211,139,.62)";
          ctx.fillRect(-houseW * .28, -houseH * .72, houseW * .18, houseH * .2);
          ctx.fillRect(houseW * .1, -houseH * .72, houseW * .18, houseH * .2);
          ctx.fillStyle = "#292638";
          ctx.fillRect(-houseW * .1, -houseH * .38, houseW * .22, houseH * .38);
          ctx.restore();
        });
      }

      // Streetlights along both sidewalks; warm lamps become larger toward the camera.
      for (let i = 0; i < 4; i++) {
        const z = ((i / 4) + (g.distance * 0.00005 % 1)) % 1;
        const y = 500 + z * z * 930;
        const spread = 30 + z * 410;
        const poleH = 36 + z * 118;
        [-1, 1].forEach((side) => {
          const x = W / 2 + side * spread;
          ctx.save();
          ctx.strokeStyle = "#34313b";
          ctx.lineWidth = 2 + z * 4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y - poleH);
          ctx.lineTo(x - side * (9 + z * 12), y - poleH - 4);
          ctx.stroke();
          ctx.fillStyle = "rgba(255,218,145,.16)";
          ctx.beginPath();
          ctx.arc(x - side * (9 + z * 12), y - poleH - 4, 5 + z * 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffe2a1";
          ctx.beginPath();
          ctx.arc(x - side * (9 + z * 12), y - poleH - 4, 2 + z * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // Asphalt highway with shoulder lanes and road markings.
      ctx.fillStyle = "#353b45";
      ctx.beginPath();
      ctx.moveTo(365, 480); ctx.lineTo(535, 480); ctx.lineTo(890, H); ctx.lineTo(10, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#252b34";
      ctx.beginPath();
      ctx.moveTo(390, 480); ctx.lineTo(510, 480); ctx.lineTo(820, H); ctx.lineTo(80, H); ctx.closePath(); ctx.fill();
      // Raised road shoulders add depth while the art assets are still procedural.
      ctx.fillStyle = "rgba(112,75,155,.22)";
      ctx.beginPath(); ctx.moveTo(365,480); ctx.lineTo(390,480); ctx.lineTo(80,H); ctx.lineTo(10,H); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(510,480); ctx.lineTo(535,480); ctx.lineTo(890,H); ctx.lineTo(820,H); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(235,225,190,.55)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(365, 480); ctx.lineTo(10, H); ctx.moveTo(535, 480); ctx.lineTo(890, H); ctx.stroke();

      // Lane dashes moving toward the player.
      for (let laneLine = 0; laneLine < 2; laneLine++) {
        for (let i = 0; i < 8; i++) {
          const z = ((i / 8) + (g.distance * 0.18 % 1)) % 1;
          const y = 480 + z * z * 1010;
          const x = W / 2 + (laneLine ? 1 : -1) * (13 + z * 160);
          ctx.strokeStyle = "rgba(240,235,215,.42)";
          ctx.lineWidth = 1 + z * 3;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 12 + z * 34); ctx.stroke();
        }
      }

      // Coins and obstacles: smaller at horizon, larger near player.
      // Reliable 2.5D obstacle fallback remains visible while WebGL assets are being tuned.
      [...g.items].filter((item) => item.kind !== "coin").sort((a,b) => a.z-b.z).forEach((item) => {
        const z = Math.max(0, item.z);
        const x = laneX(item.lane, z);
        const y = 480 + z * z * 1010;
        const scale = 0.25 + z * 0.95;
        const w = 62 * scale;
        const h = 48 * scale;
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = "rgba(0,0,0,.35)";
        ctx.beginPath(); ctx.ellipse(0, 3*scale, w*.72, h*.18, 0, 0, Math.PI*2); ctx.fill();
        const obstacleAtlas = obstacleSheetRef.current;
        const atlasCells = {
          taxi: [0, 0],
          sedan: [1, 0],
          van: [3, 0],
          bus: [4, 0],
          truck: [0, 1],
          roadblock: [2, 2],
        };
        const atlasCell = atlasCells[item.kind];
        const atlasReady = obstacleAtlas?.complete && obstacleAtlas.naturalWidth >= 1536 && obstacleAtlas.naturalHeight >= 1024;
        if (atlasReady && atlasCell) {
          const cellW = obstacleAtlas.naturalWidth / 6;
          const cellH = obstacleAtlas.naturalHeight / 4;
          const [col, row] = atlasCell;
          const spriteSize = (item.kind === "roadblock" ? 176 : 190) * scale;
          ctx.drawImage(
            obstacleAtlas,
            col * cellW, row * cellH, cellW, cellH,
            -spriteSize / 2, -spriteSize * 0.92, spriteSize, spriteSize
          );
        } else if (item.kind === "sedan" || item.kind === "taxi" || item.kind === "van" || item.kind === "truck" || item.kind === "bus") {
          const truck = item.kind === "truck" || item.kind === "bus";
          const van = item.kind === "van";
          const cw = w * (truck ? 1.72 : van ? 1.55 : 1.42);
          const ch = h * (truck ? 2.05 : van ? 1.9 : 1.72);
          const body = item.kind === "taxi" ? "#e8bb42" : item.kind === "van" ? "#547f9e" : item.kind === "truck" ? "#477d72" : item.kind === "bus" ? "#d36e55" : "#c85d61";
          ctx.fillStyle="#11151c"; ctx.beginPath(); ctx.ellipse(0,3*scale,cw*.62,ch*.12,0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle="#171c25"; ctx.fillRect(-cw*.46,-ch*.16,cw*.18,ch*.46); ctx.fillRect(cw*.28,-ch*.16,cw*.18,ch*.46);
          ctx.fillStyle=body; ctx.fillRect(-cw*.5,-ch*.72,cw,ch*.62);
          ctx.fillStyle=truck ? "#6b7e88" : "#27384b";
          ctx.beginPath(); ctx.moveTo(-cw*.37,-ch*.7); ctx.lineTo(-cw*.23,-ch*.98); ctx.lineTo(cw*.28,-ch*.98); ctx.lineTo(cw*.43,-ch*.7); ctx.closePath(); ctx.fill();
          ctx.fillStyle="#a9d1df"; ctx.fillRect(-cw*.29,-ch*.91,cw*.24,ch*.17); ctx.fillRect(cw*.05,-ch*.91,cw*.24,ch*.17);
          ctx.fillStyle="#f9e8b1"; ctx.fillRect(-cw*.43,-ch*.28,cw*.12,ch*.08); ctx.fillRect(cw*.31,-ch*.28,cw*.12,ch*.08);
          ctx.fillStyle="#a93e49"; ctx.fillRect(-cw*.42,-ch*.08,cw*.13,ch*.08); ctx.fillRect(cw*.29,-ch*.08,cw*.13,ch*.08);
          ctx.fillStyle="rgba(255,255,255,.2)"; ctx.fillRect(-cw*.46,-ch*.7,cw*.92,ch*.06);
          if(item.kind==="taxi"){ctx.fillStyle="#fff0a8";ctx.fillRect(-cw*.12,-ch*1.04,cw*.24,ch*.08);}
          if(truck){ctx.fillStyle="#c3cbd0";ctx.fillRect(-cw*.42,-ch*.7,cw*.84,ch*.44);ctx.strokeStyle="#72828b";ctx.lineWidth=2;ctx.strokeRect(-cw*.42,-ch*.7,cw*.84,ch*.44);}
        } else if (item.kind === "log") {
          ctx.fillStyle="#75472f"; ctx.fillRect(-w*.7,-h*.62,w*1.4,h*.55);
          ctx.fillStyle="#b77a49"; ctx.beginPath(); ctx.ellipse(-w*.7,-h*.35,h*.27,h*.27,0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle="#d4a16b"; ctx.beginPath(); ctx.ellipse(w*.7,-h*.35,h*.27,h*.27,0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle="#e3b77f"; ctx.fillRect(-w*.48,-h*.58,w*.96,h*.08);
        } else if (item.kind === "arch") {
          ctx.fillStyle="#7663a7"; ctx.fillRect(-w*.65,-h*1.65,w*.2,h*1.65); ctx.fillRect(w*.45,-h*1.65,w*.2,h*1.65); ctx.fillRect(-w*.65,-h*1.65,w*1.3,h*.25);
          ctx.fillStyle="rgba(255,255,255,.22)"; ctx.fillRect(-w*.6,-h*1.58,w*1.2,h*.06);
        } else if (item.kind === "barrier") {
          ctx.fillStyle="#713c58"; ctx.fillRect(-w*.68,-h*.12,w*1.36,h*.2);
          ctx.fillStyle="#d66c6a"; ctx.fillRect(-w*.68,-h*.82,w*1.36,h*.7);
          ctx.fillStyle="#f3b49e"; ctx.fillRect(-w*.68,-h*.82,w*1.36,h*.13);
          ctx.fillStyle="#493044"; ctx.fillRect(-w*.53,-h*.12,w*.14,h*.42); ctx.fillRect(w*.39,-h*.12,w*.14,h*.42);
        } else if (item.kind === "roadblock") {
          ctx.fillStyle="#f0a64b"; ctx.beginPath(); ctx.moveTo(0,-h*1.2); ctx.lineTo(w*.28,0); ctx.lineTo(-w*.28,0); ctx.closePath(); ctx.fill();
          ctx.fillStyle="#f6e7c9"; ctx.fillRect(-w*.19,-h*.48,w*.38,h*.12);
          ctx.fillStyle="#29303a"; ctx.fillRect(-w*.36,-h*.05,w*.72,h*.12);
        } else {
          ctx.fillStyle="#8d4d61"; ctx.fillRect(-w*.65,-h*.78,w*1.3,h*.78);
          ctx.fillStyle="#bd766e"; ctx.fillRect(-w*.65,-h*.78,w*1.3,h*.66);
          ctx.fillStyle="#e3aa8b"; ctx.beginPath(); ctx.moveTo(-w*.65,-h*.78); ctx.lineTo(-w*.45,-h); ctx.lineTo(w*.78,-h*.78); ctx.closePath(); ctx.fill();
          ctx.fillStyle="rgba(255,255,255,.25)"; ctx.strokeRect(-w*.52,-h*.68,w*1.04,h*.48);
        }
        ctx.restore();
      });
      [...g.items].filter((item) => item.kind === "coin" && !item.resolved).sort((a, b) => a.z - b.z).forEach((item) => {
        const x = laneX(item.lane, item.z);
        const y = 480 + item.z * item.z * 1010;
        const scale = 0.25 + item.z * 0.95;
        ctx.save();
        ctx.translate(x, y - 14 * scale);
        ctx.scale(scale, scale);
        ctx.fillStyle = "#ffd76a";
        ctx.strokeStyle = "#fff0ae";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#9b641a"; ctx.font = "bold 17px system-ui"; ctx.textAlign = "center"; ctx.fillText("$", 0, 6);
        ctx.restore();
      });

            const player = g.player;
      const px = laneX(player.lane, 1); // Lane 0 is the exact road center at game start.
      const bounce = g.running && player.jump <= 0 && player.slide <= 0 ? Math.sin(time / 65) * 4 : 0;
      // Mama Veylora stays behind the child; her broom swings while she runs.
      // Mama follows the player's lane and stays visibly behind the child on screen.
      const mamaX = laneX(player.lane, 1);
      const mamaY = (g.caught ? 1435 : 1460) + Math.sin(time / 150) * 3;
      const mamaRow = g.caught ? 5 : 1;
      const mamaFrame = Math.floor(time / (g.caught ? 175 : 115)) % 8;
      const mamaDrawn = drawVeyloraSprite(mamaRow, mamaX, mamaY, 230, 285, mamaFrame);
      if (!mamaDrawn) {
        const legacyMamaDrawn = drawSprite(2, mamaX, mamaY, 150, 190, Math.floor(time / 170) % 4);
        if (!legacyMamaDrawn) {
          ctx.font = "58px system-ui"; ctx.textAlign = "center"; ctx.fillText("👩🏻", mamaX, mamaY - 8);
        }
      }
      ctx.save();
      ctx.translate(mamaX + 40, mamaY - 55);
      ctx.rotate(g.caught ? (-1.35 + Math.sin(time / 70) * 1.2) : Math.sin(time / 105) * .32 - .45);
      ctx.strokeStyle = "#9b6a43"; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, 25); ctx.lineTo(40, -28); ctx.stroke();
      ctx.fillStyle = "#d9b77d";
      ctx.beginPath(); ctx.moveTo(40, -28); ctx.lineTo(55, -19); ctx.lineTo(48, -4); ctx.lineTo(34, -12); ctx.closePath(); ctx.fill();
      ctx.restore();

      // The Veylora CAUGHT row already contains both characters in one authored capture composition.
      // Draw the child separately only during normal gameplay to avoid duplicating him in the catch scene.
      if (!g.caught) {
        const childY = 1300;
        const childHeight = 230;
        const childWidth = 184;
        let childRow = 1; // RUN
        let childFrame = Math.floor(time / 95) % 8;
        if (g.caught) {
          // The atlas CAUGHT row is a two-character composition, not a single-child cell.
          // Keep the child on the full-body SCARED row until a dedicated capture pose is authored.
          childRow = 5; // CAUGHT — child restrained after Mama catches him
          childFrame = Math.min(7, Math.floor((time - (g.caughtAt || time)) / 350));
        }
        if (g.scaredUntil && time < g.scaredUntil && !g.caught) {
          childRow = 4; // SCARED
          childFrame = Math.floor(time / 105) % 8;
        }
        const childDrawn = drawChildSprite(childRow, px, childY + bounce, childWidth, childHeight, childFrame);
        if (!childDrawn) {
          const legacyDrawn = drawSprite(4, px, childY + bounce, childWidth * .9, childHeight * .9, Math.floor(time / 130) % 4);
          if (!legacyDrawn) { ctx.font = "62px system-ui"; ctx.textAlign = "center"; ctx.fillText("🧒", px, childY + bounce); }
        }
  
      }
      if (g.caught) {
        ctx.save();
        ctx.font = "bold 58px system-ui";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(255,196,96,.8)";
        ctx.shadowBlur = 18;
        ctx.fillText("✦", px - 68, 1330);
        ctx.fillText("✦", px + 72, 1360);
        ctx.restore();
      }

      // Chase pressure glow at the lower edge.
      const pressure = Math.min(1, g.chase);
      if (pressure > 0.02) {
        ctx.fillStyle = "rgba(235,83,122," + (pressure * .12) + ")";
        ctx.fillRect(0, H - 32, W, 32);
      }
      if (!g.running || g.paused) {
        ctx.fillStyle = "rgba(5,4,12,.25)";
        ctx.fillRect(0, 0, W, H);
      }
    };

    const finish = () => {
      if (g.over) return;
      g.running = false;
      g.over = true;
      g.caught = true;
      g.caughtAt = performance.now();
      const finalDistance = Math.floor(g.distance);
      const finalScore = finalDistance * 12 + g.coinCount * 25;
      setDistanceResult(finalDistance);
      setScore(finalScore);
      setCoins(g.coinCount);
      setBest((old) => {
        const next = Math.max(old, finalScore);
        try { localStorage.setItem(BEST_KEY, String(next)); } catch {}
        return next;
      });
      setStatus("caught");
      stopMusic();
      tone(150, .24);
      window.clearTimeout(catchTimerRef.current);
      catchTimerRef.current = window.setTimeout(() => {
        tone(330, .12);
        window.setTimeout(() => tone(220, .18), 130);
        window.setTimeout(() => tone(110, .42), 330);
        setStatus("over");
      }, 3000);
    };

    const update = (dt) => {
      if (!g.running || g.paused) return;
      const p = g.player;
      g.distance += g.speed * dt;
      g.speed = Math.min(.39, g.speed + .000002 * dt);
      p.lane += (p.targetLane - p.lane) * Math.min(1, dt * 0.24);
      const wasAirborne = p.jump > 0;
      p.jump = Math.max(0, p.jump - dt * .00135);
      if (wasAirborne && p.jump === 0) { g.wasJumping = true; g.landedAt = performance.now(); }
      p.slide = 0;
      g.spawn -= dt * 0.001;
      if (g.spawn <= 0) {
        // Traffic patterns: cars occupy lanes, always leaving a clear route.
        const patterns = [
          [{ lane:-1, kind:"sedan", z:0 },{ lane:0, kind:"taxi", z:-.04 }],
          [{ lane:0, kind:"van", z:0 },{ lane:1, kind:"sedan", z:-.05 }],
          [{ lane:-1, kind:"truck", z:0 },{ lane:1, kind:"taxi", z:-.06 }],
          [{ lane:1, kind:"bus", z:0 },{ lane:0, kind:"sedan", z:-.05 }],
          [{ lane:-1, kind:"taxi", z:0 },{ lane:0, kind:"van", z:-.05 }],
          [{ lane:0, kind:"truck", z:0 }],
          [{ lane:-1, kind:"sedan", z:0 },{ lane:1, kind:"van", z:-.04 }],
          [{ lane:0, kind:"roadblock", z:0 }],
          [{ lane:-1, kind:"van", z:0 },{ lane:1, kind:"roadblock", z:-.04 }],
        ];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        pattern.forEach((item) => g.items.push({ ...item, resolved:false }));
        const openLane = LANES.find((lane) => !pattern.some((item) => item.lane === lane));
        if (openLane !== undefined && Math.random() < .8) {
          for (let i=0;i<4;i++) g.items.push({ lane:openLane, z:-.12-i*.09, kind:"coin", resolved:false });
        }
        // Leave enough distance for the complete pattern to pass before the next one.
        g.spawn = 4.8 + Math.random() * 1.0;
      }
      g.items.forEach((item) => { item.prevZ = item.z; item.z += g.speed * dt * .001; });
      g.items = g.items.filter((item) => item.z < 1.12);
      const coinHits = g.items.filter((item) => item.kind === "coin" && !item.resolved && item.z > .91 && item.z < 1.04 && Math.abs(item.lane - p.lane) < .42);
      if (coinHits.length) {
        g.coinCount += coinHits.length;
        coinHits.forEach((item) => { item.resolved = true; });
        setCoins(g.coinCount);
        tone(880, .045);
      }
      // Swept collision: test the obstacle's full depth crossing the player's actual ground plane.
      // This avoids misses between frames and avoids late hits after the vehicle has passed.
      const PLAYER_Z = .90;
      const PLAYER_LANE_RADIUS = .52;
      const obstacleHit = g.items.find((item) => {
        if (item.kind === "coin" || item.resolved) return false;
        const halfDepth = item.kind === "truck" || item.kind === "bus" ? .105 : .078;
        const previousZ = Number.isFinite(item.prevZ) ? item.prevZ : item.z;
        const nearestZ = Math.min(previousZ, item.z) - halfDepth;
        const farthestZ = Math.max(previousZ, item.z) + halfDepth;
        const depthOverlap = nearestZ <= PLAYER_Z && farthestZ >= PLAYER_Z;
        const laneOverlap = Math.abs(item.lane - p.lane) <= PLAYER_LANE_RADIUS;
        if (!depthOverlap || !laneOverlap) return false;
        // Cars are solid lane blockers. Only low road debris can be cleared by jumping.
        return true;
      });
      if (obstacleHit) {
        obstacleHit.resolved = true;
        g.scaredUntil = performance.now() + 420;
        // One collision ends the run: Mama catches Anak Dajjal immediately.
        finish();
        return;
      }
      const points = Math.floor(g.distance * 12) + g.coinCount * 25;
      const scoreBucket = Math.floor(g.distance * 12 / 10);
      if (scoreBucket !== g.scoreTick) {
        g.scoreTick = scoreBucket;
        setScore(points);
      }
    };

    const frame = (time) => {
      const dt = g.lastTime ? Math.min(time - g.lastTime, 34) : 16.67;
      g.lastTime = time;
      update(dt);
      draw(time);
      rafRef.current = requestAnimationFrame(frame);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    rafRef.current = requestAnimationFrame(frame);

    const key = (event) => {
      if (["ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
      if (event.code === "ArrowLeft" || event.code === "KeyA") move("left");
      if (event.code === "ArrowRight" || event.code === "KeyD") move("right");
    };
    window.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(bootFallback);
      window.clearTimeout(catchTimerRef.current);
      observer.disconnect();
      window.removeEventListener("keydown", key);
      gameRef.current = null;
      sheetRef.current = null;
    };
  }, [move, tone, stopMusic]);

  useEffect(() => () => {
    if (musicRef.current.timer) window.clearInterval(musicRef.current.timer);
    musicRef.current.oscillators.forEach((osc) => { try { osc.stop(); } catch {} });
    if (audioRef.current && audioRef.current.state !== "closed") audioRef.current.close().catch(() => {});
  }, []);

  const pause = () => {
    const g = gameRef.current;
    if (!g || !g.running) return;
    g.paused = true;
    stopMusic();
    setStatus("paused");
  };
  const resume = () => {
    const g = gameRef.current;
    if (!g || !g.paused) return;
    g.paused = false;
    startMusic();
    setStatus("playing");
  };

  const pointerDown = (event) => { touchRef.current = { x: event.clientX, y: event.clientY }; };
  const pointerUp = (event) => {
    if (!touchRef.current) return;
    const dx = event.clientX - touchRef.current.x;
    const dy = event.clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? "left" : "right");

  };

  return (
    <main className="mamah-game mini-game-screen" aria-label="Mamah Ngamuk game" onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => { touchRef.current = null; }}>
      <canvas ref={canvasRef} className="mamah-game__world" aria-label="Dunia permainan Mamah Ngamuk" />
      <div className="mamah-game__vignette" aria-hidden="true" />
      {status === "loading" && <section className="mamah-screen mamah-screen--loading"><div className="mamah-loader"><span>DF</span></div><p className="mamah-brand__eyebrow">DAJJAL FAMILY · GAMING UNIVERSE</p><h1 className="mamah-logo">MAMAH <span>NGAMUK!</span></h1><p className="mamah-loading-label">MENYIAPKAN DUNIA GAME...</p></section>}
      {status === "ready" && <section className="mamah-screen mamah-screen--menu">
        <div className="mamah-brand"><span className="mamah-brand__eyebrow">DAJJAL FAMILY · GAMING UNIVERSE</span><h1 className="mamah-logo">MAMAH <span>NGAMUK!</span></h1><p className="mamah-tagline">ANAK DAJJAL KABUR. MAMAH VEYLORA MENGEJAR!</p></div>
        <div className="mamah-menu-card"><div className="mamah-menu-card__coin">🪙 <strong>{coins}</strong></div><button type="button" className="mamah-button mamah-button--primary" onClick={start}>▶ MULAI MAIN</button><button type="button" className="mamah-button" onClick={() => setSettingsOpen(true)}>⚙ PENGATURAN</button><button type="button" className="mamah-button mamah-button--quiet" onClick={() => setConfirmExit(true)}>↩ KELUAR KE GAME LIBRARY</button></div>
        <p className="mamah-menu-hint">SWIPE UNTUK BERGERAK · HINDARI RINTANGAN · KUMPULKAN KOIN</p>
      </section>}
      {status === "playing" && <>
        <div className="mamah-hud mamah-hud--minimal"><div className="mamah-hud__stats"><div><small>DISTANCE</small><strong>{Math.floor(score / 12)} m</strong></div><div><small>COINS</small><strong className="is-gold">🪙 {coins}</strong></div><div><small>BEST</small><strong>{String(best).padStart(6,"0")}</strong></div></div></div>
      </>}
      {status === "paused" && <section className="mamah-overlay"><div className="mamah-dialog"><span className="mamah-dialog__emoji">Ⅱ</span><p className="mamah-dialog__eyebrow">PERMAINAN DIJEDA</p><h2>ISTIRAHAT DULU?</h2><button className="mamah-button mamah-button--primary" onClick={resume}>▶ LANJUTKAN</button><button className="mamah-button" onClick={start}>↻ MAIN LAGI</button><button className="mamah-button mamah-button--quiet" onClick={() => setConfirmExit(true)}>↩ KELUAR GAME</button></div></section>}
      {status === "caught" && <section className="mamah-catch-caption" aria-live="assertive"><strong>PULANG! MANDI!</strong></section>}\n      {status === "over" && <section className="mamah-overlay mamah-overlay--gameover"><div className="mamah-dialog mamah-dialog--result"><span className="mamah-dialog__emoji">🧹</span><p className="mamah-dialog__eyebrow">MAMA BERHASIL MENANGKAP!</p><h2>KETANGKAP MAMAH!</h2><div className="mamah-result mamah-result--primary"><span>JARAK TEMPUH <strong>{distanceResult} m</strong></span><span>TOTAL KOIN <strong>🪙 {coins}</strong></span></div><div className="mamah-result"><span>SKOR AKHIR <strong>{String(score).padStart(6,"0")}</strong></span><span>BEST <strong>{String(best).padStart(6,"0")}</strong></span></div><button className="mamah-button mamah-button--primary" onClick={start}>↻ MAIN LAGI</button><button className="mamah-button mamah-button--quiet" onClick={() => setStatus("ready")}>⌂ MENU UTAMA</button></div></section>}
      {settingsOpen && <section className="mamah-overlay" onClick={() => setSettingsOpen(false)}><div className="mamah-dialog" onClick={e => e.stopPropagation()}><button className="mamah-dialog__close" onClick={() => setSettingsOpen(false)} aria-label="Tutup">×</button><p className="mamah-dialog__eyebrow">PENGATURAN</p><h2>SUARA GAME</h2><button className="mamah-button" onClick={() => setSoundOn(v => !v)}>{soundOn ? "♫ SUARA: ON" : "♪ SUARA: OFF"}</button><p className="mamah-dialog__note">Atur volume melalui tombol volume perangkat.</p></div></section>}
      {confirmExit && <section className="mamah-overlay" onClick={() => setConfirmExit(false)}><div className="mamah-dialog" role="alertdialog" aria-modal="true" aria-labelledby="mamah-exit-title" onClick={e => e.stopPropagation()}><span className="mamah-dialog__emoji">🚪</span><p className="mamah-dialog__eyebrow">KONFIRMASI</p><h2 id="mamah-exit-title">KELUAR DARI GAME?</h2><p className="mamah-dialog__note">Sesi permainan ini akan diakhiri dan kamu kembali ke Game Library.</p><button className="mamah-button" onClick={() => setConfirmExit(false)}>TETAP MAIN</button><button className="mamah-button mamah-button--danger" onClick={() => { window.location.href = "/mini-game"; }}>YA, KELUAR</button></div></section>}
    </main>
  );
}
