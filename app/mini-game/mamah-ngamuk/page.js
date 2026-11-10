"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./mamah-ngamuk.css";
import { supabase } from "@/lib/supabase";

const W = 900;
const H = 1600;
const PENDING_RESULT_KEY = "mamah-ngamuk-pending-result-v1";
const LANES = [-1, 0, 1];
const WAVE_STAGES = [
  { at: 0, alert: "WAVE 1  ·  AWAL PELARIAN" },
  { at: 10000, alert: "WAVE 2  ·  MULAI PANIK!" },
  { at: 25000, alert: "WAVE 3  ·  JAM MACET!" },
  { at: 50000, alert: "WAVE 4  ·  KEJARAN MAMAH!" },
  { at: 100000, alert: "WAVE 5  ·  CHAOS MODE!" },
];

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
  const bgmRef = useRef(null);
  const bgmSessionRef = useRef(false);
  const touchRef = useRef(null);
  const catchTimerRef = useRef(null);
  const waveNoticeTimerRef = useRef(null);
  const confirmResumeRef = useRef(false);
  const splashActiveRef = useRef(false);
  const [splashProgress, setSplashProgress] = useState(0);
  const [status, setStatus] = useState("loading");
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [wallet, setWallet] = useState(0);
  const [player, setPlayer] = useState(null);
  const [gameStats, setGameStats] = useState({ gamesPlayed: 0, totalPoints: 0, bestScore: 0 });
  const [accountLoading, setAccountLoading] = useState(true);
  const [walletSyncError, setWalletSyncError] = useState("");
  const [accountType, setAccountType] = useState("signed_out");
  const [googleLinkLoading, setGoogleLinkLoading] = useState(false);
  const [pendingGuestResult, setPendingGuestResult] = useState(false);
  const [resultSaveStatus, setResultSaveStatus] = useState("");
  const [confirmAction, setConfirmAction] = useState("");
  const [distanceResult, setDistanceResult] = useState(0);
  const [best, setBest] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [confirmExit, setConfirmExit] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [waveNotice, setWaveNotice] = useState("");
  const [menuPanel, setMenuPanel] = useState("");

  const connectGoogleFromGame = async () => {
    setGoogleLinkLoading(true);
    setWalletSyncError("");
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data?.session?.user) throw new Error("Silakan login terlebih dahulu.");
      if (!data.session.user.is_anonymous) { setAccountType("google"); setWalletSyncError("Akun ini sudah terdaftar, bukan akun tamu."); setGoogleLinkLoading(false); return; }
      const { error: linkError } = await supabase.auth.linkIdentity({ provider: "google", options: { redirectTo: window.location.origin + window.location.pathname, queryParams: { access_type: "offline", prompt: "consent" } } });
      if (linkError) throw linkError;
    } catch (error) { console.error("Google link from Mamah Ngamuk failed:", error); setWalletSyncError(error.message || "Gagal menghubungkan Google."); setGoogleLinkLoading(false); }
  };
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

  const stopMusic = useCallback((reset = false) => {
    const bgm = bgmRef.current;
    if (!bgm) return;
    bgm.pause();
    if (reset) {
      try { bgm.currentTime = 0; } catch {}
    }
  }, []);

  const startMusic = useCallback(() => {
    if (!soundRef.current || typeof window === "undefined") return;
    try {
      if (!bgmRef.current) {
        const bgm = new Audio("/mini-game/mamah-ngamuk/bgm-mamah.mp3");
        bgm.loop = true;
        bgm.preload = "auto";
        bgm.volume = 0.48;
        bgmRef.current = bgm;
      }
      const bgm = bgmRef.current;
      bgm.loop = true;
      // Idempotent: never restart a track that is already playing.
      if (!bgm.paused && !bgm.ended) return;
      const playAttempt = bgm.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {
          // Mobile browsers may block autoplay until a user gesture.
          // The watchdog and next user interaction retry without resetting position.
        });
      }
    } catch {}
  }, []);

  const enterGameFullscreen = useCallback(() => {
    const root = document.querySelector(".mamah-game");
    if (root && !document.fullscreenElement && root.requestFullscreen) {
      root.requestFullscreen().catch(() => {});
    }
  }, []);

  const start = useCallback(() => {
    enterGameFullscreen();
    const g = gameRef.current;
    if (!g) return;
    Object.assign(g, { running: true, paused: false, pauseStartedAt: 0, over: false, caught: false, distance: 0, environmentDistance: 0, elapsed: 0, carSpeed: 0.30, spawn: 3.8, chase: 0, scoreTick: -1, coinCount: 0, waveIndex: 0, sessionId: window.crypto.randomUUID() });
    window.clearTimeout(waveNoticeTimerRef.current);
    setWaveNotice(WAVE_STAGES[0].alert);
    waveNoticeTimerRef.current = window.setTimeout(() => setWaveNotice(""), 4000);
    Object.assign(g.player, { lane: 0, targetLane: 0, jump: 0, slide: 0 });
    g.items = [];
    setScore(0);
    setDistance(0);
    setCoins(0);
    setDistanceResult(0);
    setStatus("playing");
    bgmSessionRef.current = true;
    tone(660);
    startMusic();
  }, [tone, startMusic, enterGameFullscreen]);

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
    else if (bgmSessionRef.current) startMusic();
  }, [soundOn, startMusic, stopMusic]);

  // Keep the soundtrack alive across Home, gameplay, pause, dialogs and Game Over.
  // This only resumes a paused/ended element; it never seeks or duplicates playback.
  useEffect(() => {
    bgmSessionRef.current = true;
    const ensureMusic = () => {
      if (!bgmSessionRef.current || !soundRef.current) return;
      if (document.visibilityState === "hidden") {
        stopMusic();
        return;
      }
      startMusic();
    };
    const timer = window.setInterval(ensureMusic, 1500);
    document.addEventListener("visibilitychange", ensureMusic);
    window.addEventListener("pageshow", ensureMusic);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", ensureMusic);
      window.removeEventListener("pageshow", ensureMusic);
    };
  }, [startMusic, stopMusic]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("splash") !== "1") return;
    splashActiveRef.current = true;
    window.history.replaceState({}, "", window.location.pathname);
    const splashImage = new Image();
    let frame = 0;
    let timer = 0;
    let cancelled = false;
    const beginSplash = () => {
      if (cancelled) return;
      setSplashProgress(0);
      bgmSessionRef.current = true;
      setStatus("splash");
      startMusic();
      const startedAt = performance.now();
      const tick = (now) => {
        const progress = Math.min(100, ((now - startedAt) / 5000) * 100);
        setSplashProgress(Math.floor(progress));
        if (progress < 100) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      timer = window.setTimeout(() => {
        splashActiveRef.current = false;
        setSplashProgress(100);
        setStatus("ready");
      }, 5000);
    };
    splashImage.onload = beginSplash;
    splashImage.onerror = beginSplash;
    splashImage.src = "/mini-game/mamah-ngamuk/splash.png";
    if (splashImage.complete) beginSplash();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      splashActiveRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const trapBack = () => {
      window.history.pushState({ mamahGame: true }, "", window.location.href);
      setConfirmExit(true);
    };
    window.history.pushState({ mamahGame: true }, "", window.location.href);
    window.addEventListener("popstate", trapBack);
    return () => window.removeEventListener("popstate", trapBack);
  }, []);

  // The server wallet is the only source of truth; never hydrate it from localStorage.
  useEffect(() => {
    let active = true;
    const loadAccount = async () => {
      setAccountLoading(true);
      setWalletSyncError("");
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const token = data?.session?.access_token;
        if (!token) {
          if (active) { setPlayer(null); setWallet(0); setAccountType("signed_out"); setGameStats({ gamesPlayed: 0, totalPoints: 0, bestScore: 0 }); }
          return;
        }
        const response = await fetch("/api/mamah-ngamuk/result", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Gagal memuat akun.");
        if (active) {
          setPlayer(result.player || null);
          setAccountType(result.accountType || "registered");
          setWallet(Number(result.balance || 0));
          setGameStats(result.stats || { gamesPlayed: 0, totalPoints: 0, bestScore: 0 });
          setBest(Number(result.stats?.bestDistance || 0));
          if (result.accountType === "google") {
            const pendingRaw = sessionStorage.getItem(PENDING_RESULT_KEY);
            if (pendingRaw) {
              const pending = JSON.parse(pendingRaw);
              const saveResponse = await fetch("/api/mamah-ngamuk/result", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
                body: JSON.stringify(pending),
              });
              const saved = await saveResponse.json();
              if (!saveResponse.ok) throw new Error(saved.error || "Hasil sesi belum berhasil disimpan.");
              sessionStorage.removeItem(PENDING_RESULT_KEY);
              setPendingGuestResult(false);
              setWallet(Number(saved.balance || 0));
              setBest(Number(saved.bestDistance || 0));
              setGameStats((old) => ({ ...old, gamesPlayed: old.gamesPlayed + (saved.duplicate ? 0 : 1), totalPoints: old.totalPoints + (saved.duplicate ? 0 : Number(pending.score || 0)), bestScore: Math.max(old.bestScore || 0, Number(pending.score || 0)) }));
              setResultSaveStatus("HASIL SESI GUEST BERHASIL DISIMPAN");
            }
          } else {
            setWallet(0);
            setGameStats({ gamesPlayed: 0, totalPoints: 0, bestScore: 0 });
            setBest(0);
          }
        }
      } catch (error) {
        console.error("Mamah Ngamuk account load failed:", error);
        if (active) setWalletSyncError("AKUN / SALDO BELUM TERSINKRON");
      } finally { if (active) setAccountLoading(false); }
    };
    loadAccount();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const g = {
      running: false, paused: false, over: false, distance: 0, environmentDistance: 0, elapsed: 0, carSpeed: 0.30, spawn: 3.8, chase: 0, scoreTick: -1, coinCount: 0, waveIndex: 0,
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
      if (!splashActiveRef.current) setStatus("ready");
    };
    bootFallback = window.setTimeout(finishBoot, 1400);
    sheet.onload = () => { sheetRef.current = sheet; finishBoot(); };
    sheet.onerror = () => { sheetRef.current = null; finishBoot(); };
    sheet.src = "/universe-characters.png";

    // OBSTACLE-V2 atlas: 3 columns × 2 rows, 512px cells with 32px gutters (1600 × 1056).
    const obstacleSheet = new Image();
    obstacleSheet.onload = () => { obstacleSheetRef.current = obstacleSheet; };
    obstacleSheet.onerror = () => { obstacleSheetRef.current = null; };
    obstacleSheet.src = "/mini-game/mamah-ngamuk/sprite/obstacle-v2.png";

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
      if (g.paused) time = g.pauseStartedAt || time;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#17132d");
      sky.addColorStop(0.58, "#46556a");
      sky.addColorStop(1, "#202735");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Urban roadside skyline, streetlights and shopfront silhouettes.
      for (let i = 0; i < 13; i++) {
        const x = i * 78 - (g.environmentDistance * 1.4 % 78);
        const height = 65 + (i * 31 % 95);
        ctx.fillStyle = i % 2 ? "#211d38" : "#29213f";
        ctx.fillRect(x, 480 - height, 48, height);
        ctx.fillStyle = "rgba(197,166,255,.22)";
        for (let wy = 495 - height; wy < 474; wy += 17) ctx.fillRect(x + 10, wy, 4, 5);
      }

      // Residential streetscape: repeating houses on both sides, scaled by perspective.
      for (let i = 0; i < 6; i++) {
        const z = ((i / 6) + (g.environmentDistance * 0.0012 % 1)) % 1;
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
        const z = ((i / 4) + (g.environmentDistance * 0.0012 % 1)) % 1;
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
          const z = ((i / 8) + (g.environmentDistance * 0.0012 % 1)) % 1;
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
          mbg: [0, 0],
          kopdes: [1, 0],
          sedotwc: [2, 0],
          jenazah: [0, 1],
          sawit: [1, 1],
          lpg: [2, 1],
        };
        const atlasCell = atlasCells[item.kind];
        const atlasReady = obstacleAtlas?.complete
          && obstacleAtlas.naturalWidth >= 1600
          && obstacleAtlas.naturalHeight >= 1056;
        if (atlasReady && atlasCell) {
          // Each cell is 512×512px; cells are separated by a fixed 32px gutter.
          const cellSize = 512;
          const cellStep = 544;
          const [col, row] = atlasCell;
          const spriteSize = 152 * scale; // 20% smaller than the previous 190px size.
          ctx.drawImage(
            obstacleAtlas,
            col * cellStep, row * cellStep, cellSize, cellSize,
            -spriteSize / 2, -spriteSize * 0.92, spriteSize, spriteSize
          );
        } else if (["mbg", "kopdes", "sedotwc", "jenazah", "sawit", "lpg"].includes(item.kind)) {
          const truck = ["kopdes", "sedotwc", "sawit", "lpg"].includes(item.kind);
          const van = item.kind === "mbg" || item.kind === "jenazah";
          const cw = w * (truck ? 1.72 : van ? 1.55 : 1.42) * 0.8;
          const ch = h * (truck ? 2.05 : van ? 1.9 : 1.72) * 0.8;
          const body = item.kind === "mbg" ? "#4b9b54" : item.kind === "kopdes" ? "#d94b43" : item.kind === "sedotwc" ? "#e2b83f" : item.kind === "jenazah" ? "#20232b" : item.kind === "sawit" ? "#d99c2b" : "#4b9c43";
          ctx.fillStyle="#11151c"; ctx.beginPath(); ctx.ellipse(0,3*scale,cw*.62,ch*.12,0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle="#171c25"; ctx.fillRect(-cw*.46,-ch*.16,cw*.18,ch*.46); ctx.fillRect(cw*.28,-ch*.16,cw*.18,ch*.46);
          ctx.fillStyle=body; ctx.fillRect(-cw*.5,-ch*.72,cw,ch*.62);
          ctx.fillStyle=truck ? "#6b7e88" : "#27384b";
          ctx.beginPath(); ctx.moveTo(-cw*.37,-ch*.7); ctx.lineTo(-cw*.23,-ch*.98); ctx.lineTo(cw*.28,-ch*.98); ctx.lineTo(cw*.43,-ch*.7); ctx.closePath(); ctx.fill();
          ctx.fillStyle="#a9d1df"; ctx.fillRect(-cw*.29,-ch*.91,cw*.24,ch*.17); ctx.fillRect(cw*.05,-ch*.91,cw*.24,ch*.17);
          ctx.fillStyle="#f9e8b1"; ctx.fillRect(-cw*.43,-ch*.28,cw*.12,ch*.08); ctx.fillRect(cw*.31,-ch*.28,cw*.12,ch*.08);
          ctx.fillStyle="#a93e49"; ctx.fillRect(-cw*.42,-ch*.08,cw*.13,ch*.08); ctx.fillRect(cw*.29,-ch*.08,cw*.13,ch*.08);
          ctx.fillStyle="rgba(255,255,255,.2)"; ctx.fillRect(-cw*.46,-ch*.7,cw*.92,ch*.06);
          if(item.kind==="mbg" || item.kind==="sedotwc" || item.kind==="lpg"){ctx.fillStyle="#fff0a8";ctx.fillRect(-cw*.12,-ch*1.04,cw*.24,ch*.08);}
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
        const scale = (0.25 + item.z * 0.95) * 1.55;
        ctx.save();
        ctx.translate(x, y - 18 * scale);
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
      const mamaDrawn = drawVeyloraSprite(mamaRow, mamaX, mamaY, g.caught ? 370 : 230, g.caught ? 455 : 285, mamaFrame);
      if (!mamaDrawn) {
        const legacyMamaDrawn = drawSprite(2, mamaX, mamaY, g.caught ? 250 : 150, g.caught ? 310 : 190, Math.floor(time / 170) % 4);
        if (!legacyMamaDrawn) {
          ctx.font = "58px system-ui"; ctx.textAlign = "center"; ctx.fillText("👩🏻", mamaX, mamaY - 8);
        }
      }
      // Broom is already part of Veylora's sprite atlas; do not draw a duplicate prop.\n\n      // The Veylora CAUGHT row already contains both characters in one authored capture composition.
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
      // Home hero sprites are rendered from fixed atlas cells in the DOM.
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
      setDistance(finalDistance);
      setScore(finalScore);
      setCoins(g.coinCount);
      setBest((old) => Math.max(old, finalDistance));
      const sessionResult = { sessionId: g.sessionId, distance: finalDistance, coins: g.coinCount, score: finalScore };
      const saveResult = async () => {
        try {
          const { data: authData, error: authError } = await supabase.auth.getSession();
          if (authError) throw authError;
          const user = authData?.session?.user;
          const isGoogle = Boolean(user && !user.is_anonymous && (
            user.app_metadata?.provider === "google" ||
            user.app_metadata?.providers?.includes("google") ||
            user.identities?.some((identity) => identity.provider === "google")
          ));
          if (!isGoogle) {
            sessionStorage.setItem(PENDING_RESULT_KEY, JSON.stringify(sessionResult));
            setPendingGuestResult(true);
            setResultSaveStatus("HASIL INI SEMENTARA. LOGIN GOOGLE UNTUK MENYIMPANNYA.");
            return;
          }
          const token = authData.session.access_token;
          const response = await fetch("/api/mamah-ngamuk/result", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
            body: JSON.stringify(sessionResult),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Gagal menyimpan hasil permainan.");
          setWallet(Number(result.balance || 0));
          setBest(Number(result.bestDistance || finalDistance));
          setWalletSyncError("");
          setGameStats((old) => ({ ...old, gamesPlayed: old.gamesPlayed + (result.duplicate ? 0 : 1), totalPoints: old.totalPoints + (result.duplicate ? 0 : finalScore), bestScore: Math.max(old.bestScore || 0, finalScore) }));
          setResultSaveStatus("HASIL BERHASIL DISIMPAN");
        } catch (error) {
          console.error("Mamah Ngamuk result sync failed:", error);
          setWalletSyncError(error.message || "HASIL BELUM TERSIMPAN · PERIKSA KONEKSI");
        }
      };
      saveResult();
      setStatus("caught");
      // Being caught ends the run, not the music session.
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
      // Keep distance and roadside scenery at their normal pace.
      // Only approaching vehicles receive the exponential per-wave speed multiplier.
      const baseRunSpeed = .30;
      g.distance += baseRunSpeed * dt;
      g.environmentDistance += baseRunSpeed * dt;
      g.elapsed += dt;
      const difficulty = Math.min(1, g.distance / 100000);
      // Vehicle movement speed rises linearly: Wave 1 = 1x, Wave 2 = 2x, Wave 3 = 3x...
      const waveSpeedMultipliers = [1, 1.5, 2, 2.5, 3];
      g.carSpeed = baseRunSpeed * (waveSpeedMultipliers[Math.min(g.waveIndex, 4)] || 3.5);
      const reachedWave = WAVE_STAGES[g.waveIndex + 1];
      if (reachedWave && g.distance >= reachedWave.at) {
        g.waveIndex += 1;
        setWaveNotice(reachedWave.alert);
        window.clearTimeout(waveNoticeTimerRef.current);
        waveNoticeTimerRef.current = window.setTimeout(() => setWaveNotice(""), 4000);
        tone(740, .12);
        window.setTimeout(() => tone(980, .16), 115);
      }
      p.lane += (p.targetLane - p.lane) * Math.min(1, dt * 0.24);
      const wasAirborne = p.jump > 0;
      p.jump = Math.max(0, p.jump - dt * .00135);
      if (wasAirborne && p.jump === 0) { g.wasJumping = true; g.landedAt = performance.now(); }
      p.slide = 0;
      g.spawn -= dt * 0.001;
      if (g.spawn <= 0) {
        // Exact vehicle count rises by one each wave: 2, 3, 4, 5, 6...
        // One vehicle is placed per staggered row; the safe gap zigzags across lanes.
        const safeLane = LANES[Math.floor(Math.random() * LANES.length)];
        const vehicleKinds = ["mbg", "kopdes", "sedotwc", "jenazah", "sawit", "lpg"];
        const vehicleCount = 2 + g.waveIndex;
        const rowSpacing = Math.max(.25, (.18 - g.waveIndex * .008) * 2);
        const pattern = [];
        const safeLaneIndex = LANES.indexOf(safeLane);
        for (let row = 0; row < vehicleCount; row++) {
          const rowSafeLane = LANES[(safeLaneIndex + row) % LANES.length];
          const blockedLanes = LANES.filter((lane) => lane !== rowSafeLane);
          const vehicleLane = blockedLanes[Math.floor(Math.random() * blockedLanes.length)];
          pattern.push({
            lane: vehicleLane,
            kind: vehicleKinds[Math.floor(Math.random() * vehicleKinds.length)],
            z: -row * rowSpacing - Math.random() * .025,
          });
        }
        pattern.forEach((item) => g.items.push({ ...item, resolved:false }));
        // Reward scales with wave: 4, 6, 8, 10, then 12 coins.
        const coinCount = 4 + g.waveIndex * 2;
        const coinLane = safeLane;
        if (Math.random() < .9) {
          for (let i = 0; i < coinCount; i++) {
            g.items.push({ lane:coinLane, z:-.10-i*.075, kind:"coin", resolved:false });
          }
        }
        // Vehicle arrival frequency rises by 0.5x per wave: 1x, 1.5x, 2x, 2.5x...
        const arrivalRateMultiplier = 1 + g.waveIndex * .5;
        const spawnGap = 3.2 / arrivalRateMultiplier;
        g.spawn = spawnGap + Math.random() * .18;
      }
      g.items.forEach((item) => { item.prevZ = item.z; item.z += g.carSpeed * dt * .00105; });
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
        const halfDepth = ["kopdes", "sedotwc", "sawit", "lpg"].includes(item.kind) ? .105 : .078;
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
        setDistance(Math.floor(g.distance));
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
      window.clearTimeout(waveNoticeTimerRef.current);
      observer.disconnect();
      window.removeEventListener("keydown", key);
      gameRef.current = null;
      sheetRef.current = null;
    };
  }, [move, tone, stopMusic]);

  useEffect(() => () => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.src = "";
      bgmRef.current = null;
    }
    if (audioRef.current && audioRef.current.state !== "closed") audioRef.current.close().catch(() => {});
  }, []);

  const pause = () => {
    const g = gameRef.current;
    if (!g || !g.running || g.paused) return;
    g.paused = true;
    g.pauseStartedAt = performance.now();
    setStatus("paused");
  };

  const resume = () => {
    const g = gameRef.current;
    if (!g || !g.paused) return;
    g.paused = false;
    g.pauseStartedAt = 0;
    g.lastTime = performance.now();
    startMusic();
    setStatus("playing");
  };

  const openConfirmAction = (action) => {
    const g = gameRef.current;
    confirmResumeRef.current = Boolean(g?.running && !g?.paused);
    if (confirmResumeRef.current && g) {
      g.paused = true;
      g.pauseStartedAt = performance.now();
    }
    setConfirmAction(action);
  };

  const cancelConfirmAction = () => {
    setConfirmAction("");
    if (!confirmResumeRef.current) return;
    confirmResumeRef.current = false;
    const g = gameRef.current;
    if (g?.running && g.paused) {
      g.paused = false;
      g.pauseStartedAt = 0;
      g.lastTime = performance.now();
      setStatus("playing");
      startMusic();
    }
  };

  const confirmCurrentAction = () => {
    const action = confirmAction;
    confirmResumeRef.current = false;
    setConfirmAction("");
    if (action === "restart") start();
    else if (action === "home") goHome();
  };

  const goHome = () => {
    confirmResumeRef.current = false;
    try { sessionStorage.removeItem(PENDING_RESULT_KEY); } catch {}
    setPendingGuestResult(false);
    setResultSaveStatus("");
    const g = gameRef.current;
    if (g) { g.running = false; g.paused = false; g.pauseStartedAt = 0; g.over = false; g.caught = false; }
    // In-game Home remains part of the same audio session.
    bgmSessionRef.current = true;
    startMusic();
    setWaveNotice("");
    setStatus("ready");
  };

  const pointerDown = (event) => {
    touchRef.current = { x: event.clientX, y: event.clientY };
    // Browser chrome can only be hidden after a real user gesture.
    const root = document.querySelector(".mamah-game");
    if (root && !document.fullscreenElement && root.requestFullscreen) {
      root.requestFullscreen().catch(() => {});
    }
  };
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
      {status === "splash" && <section className="mamah-splash-screen" aria-label="Memuat Mamah Ngamuk">
  
        <div className="mamah-splash-progress">
          <div className="mamah-splash-progress__track"><span style={{ width: `${splashProgress}%` }} /></div>
          <strong>{splashProgress}%</strong>
        </div>
      </section>}
      {status === "loading" && <section className="mamah-screen mamah-screen--loading"><div className="mamah-loader"><span>DF</span></div><p className="mamah-brand__eyebrow">DAJJAL FAMILY · GAMING UNIVERSE</p><h1 className="mamah-logo">MAMAH <span>NGAMUK!</span></h1><p className="mamah-loading-label">MENYIAPKAN DUNIA GAME...</p></section>}
      {status === "ready" && <section className="mamah-screen mamah-screen--menu">
        <header className="mamah-home-header">
          <span className="mamah-brand__eyebrow">DAJJAL FAMILY · GAMING UNIVERSE</span>
          <div className="mamah-header-actions"><button type="button" className="mamah-account-button" onClick={() => setMenuPanel("profile")}>👤 {player?.nickname || "PROFIL / AKUN"}</button>
          <button type="button" className="mamah-sound-toggle" onClick={() => setSoundOn(v => !v)} aria-label={soundOn ? "Matikan suara" : "Nyalakan suara"}>{soundOn ? "♫ SOUND ON" : "♪ SOUND OFF"}</button></div>
        </header>
        <div className="mamah-home-title">
          <h1 className="mamah-logo">MAMAH <span>NGAMUK!</span></h1>
          <p className="mamah-tagline">UH-OH... MAMA IS COMING!</p>
        </div>
        <div className="mamah-home-hero" aria-label="Mama Veylora angry dan Anak Dajjal menangis">
          <div className="mamah-hero-speed mamah-hero-speed--left">✦</div>
          <div className="mamah-hero-character mamah-hero-character--mama" role="img" aria-label="Mama Veylora marah" />
          <div className="mamah-hero-character mamah-hero-character--child" role="img" aria-label="Anak Dajjal menangis" />
          <div className="mamah-hero-caption"><b>ANGRY MAMA</b><span>VS</span><b>CRYING BOY</b></div>
          <div className="mamah-hero-speed mamah-hero-speed--right">✦</div>
        </div>
        <div className="mamah-home-bottom">
          <div className="mamah-home-record">
            <div><small>BEST DISTANCE</small><strong>{best.toLocaleString("id-ID")} <i>m</i></strong></div>
            <div><small>MY COINS · MAMAH NGAMUK</small><strong>🪙 {accountLoading ? "..." : wallet.toLocaleString("id-ID")}</strong></div>
          </div>
          <div className="mamah-player-summary"><div className="mamah-player-summary__identity"><span className="mamah-player-avatar">👤</span><div><small>PLAYER</small><strong>{player?.nickname || (accountLoading ? "MEMUAT AKUN..." : "BELUM LOGIN")}</strong></div></div><div className="mamah-player-summary__stats"><span><small>SESI</small><b>{gameStats.gamesPlayed.toLocaleString("id-ID")}</b></span><span><small>TOTAL POIN</small><b>{gameStats.totalPoints.toLocaleString("id-ID")}</b></span><span><small>BEST SCORE</small><b>{gameStats.bestScore.toLocaleString("id-ID")}</b></span></div>{walletSyncError && <small className="mamah-account-warning">{walletSyncError}</small>}{!player && !accountLoading && <Link href="/register" className="mamah-account-cta">LOGIN / BUAT AKUN</Link>}</div>
          <button type="button" className="mamah-button mamah-button--primary mamah-play-button" onClick={start}>▶ PLAY GAME</button>
          <div className="mamah-home-grid">
            <button type="button" onClick={() => setMenuPanel("leaderboard")}><span>🏆</span>LEADERBOARD</button>
            <button type="button" onClick={() => setMenuPanel("howto")}><span>📖</span>HOW TO PLAY</button>
            <button type="button" onClick={() => setSettingsOpen(true)}><span>⚙️</span>SETTINGS</button>
            <button type="button" onClick={() => setMenuPanel("achievements")}><span>🏅</span>ACHIEVEMENTS</button>
          </div>
          <p className="mamah-menu-hint">SWIPE LEFT · SWIPE RIGHT  —  AVOID CARS & COLLECT COINS</p>
          <button type="button" className="mamah-exit-link" onClick={() => setConfirmExit(true)}>BACK TO GAME LIBRARY</button>
        </div>
      </section>}
      {menuPanel && <section className="mamah-overlay" onClick={() => setMenuPanel("")}>
        <div className="mamah-dialog mamah-menu-panel" onClick={e => e.stopPropagation()}>
          <button className="mamah-dialog__close" onClick={() => setMenuPanel("")} aria-label="Tutup">×</button>
          <p className="mamah-dialog__eyebrow">MAMAH NGAMUK!</p>
          {menuPanel === "profile" && <><h2>👤 PROFIL PEMAIN</h2>
            <div className="mamah-profile-identity"><span className="mamah-profile-avatar">👤</span><div><b>{player?.nickname || "BELUM LOGIN"}</b><small>{accountType === "google" ? "GOOGLE ACCOUNT" : accountType === "guest" ? "GUEST ACCOUNT" : accountType === "signed_out" ? "SIGNED OUT" : "PLAYER ACCOUNT"}</small></div></div>
            <div className="mamah-profile-stats"><div><small>MY COINS</small><strong>🪙 {wallet.toLocaleString("id-ID")}</strong></div><div><small>BEST DISTANCE</small><strong>{best.toLocaleString("id-ID")} m</strong></div><div><small>BEST SCORE</small><strong>{gameStats.bestScore.toLocaleString("id-ID")}</strong></div><div><small>TOTAL POINTS</small><strong>{gameStats.totalPoints.toLocaleString("id-ID")}</strong></div><div><small>SESSIONS</small><strong>{gameStats.gamesPlayed.toLocaleString("id-ID")}</strong></div></div>
            {accountType === "guest" && <button className="mamah-button mamah-button--primary" disabled={googleLinkLoading} onClick={connectGoogleFromGame}>{googleLinkLoading ? "CONNECTING..." : "🔗 LINK GOOGLE ACCOUNT"}</button>}
            {accountType === "signed_out" && <button className="mamah-button mamah-button--primary" onClick={() => { window.location.href = "/register"; }}>LOGIN / CREATE ACCOUNT</button>}
            {walletSyncError && <p className="mamah-account-warning">{walletSyncError}</p>}
            <p className="mamah-dialog__note">Total poin, best score, dan saldo berasal dari database akun. Best Distance saat ini masih tersimpan di perangkat ini.</p>
            <button className="mamah-button mamah-button--quiet" onClick={() => setMenuPanel("")}>TUTUP</button></>}
          {menuPanel === "leaderboard" && <><h2>🏆 LEADERBOARD</h2>{accountType !== "google" ? <><p className="mamah-dialog__note">LOGIN MENGGUNAKAN AKUN GOOGLE UNTUK MELIHAT DAN MASUK KE LEADERBOARD.</p><button className="mamah-button mamah-button--primary" onClick={() => setMenuPanel("profile")}>LOGIN GOOGLE</button></> : <><div className="mamah-panel-stat"><span>PERSONAL BEST</span><strong>{best.toLocaleString("id-ID")} m</strong></div><p className="mamah-dialog__note">Leaderboard game akan ditampilkan di sini setelah papan peringkat game diaktifkan.</p></>}</>}
          {menuPanel === "howto" && <><h2>HOW TO PLAY</h2><div className="mamah-howto-row"><b>←</b><span>SWIPE LEFT<br/><small>Pindah ke jalur kiri</small></span></div><div className="mamah-howto-row"><b>→</b><span>SWIPE RIGHT<br/><small>Pindah ke jalur kanan</small></span></div><div className="mamah-howto-row"><b>🪙</b><span>COLLECT COINS<br/><small>Kumpulkan koin sebanyak mungkin</small></span></div><div className="mamah-howto-row"><b>🚗</b><span>AVOID VEHICLES<br/><small>Jangan sampai tertabrak!</small></span></div></>}
          {menuPanel === "achievements" && <><h2>🏅 ACHIEVEMENTS</h2><div className="mamah-achievement"><span>{best >= 1000 ? "🏆" : "🔒"}</span><div><b>FIRST ESCAPE</b><small>Capai jarak 1.000 meter</small></div><strong>{best >= 1000 ? "UNLOCKED" : "LOCKED"}</strong></div><div className="mamah-achievement"><span>{best >= 10000 ? "🥇" : "🔒"}</span><div><b>MASTER RUNNER</b><small>Capai jarak 10.000 meter</small></div><strong>{best >= 10000 ? "UNLOCKED" : "LOCKED"}</strong></div></>}
        </div>
      </section>}
      {status === "playing" && <>
        {waveNotice && <div className="mamah-wave-alert" role="status" aria-live="polite">{waveNotice}</div>}
        <div className="mamah-hud mamah-hud--minimal"><div className="mamah-hud__stats"><div><small>DISTANCE</small><strong>{distance.toLocaleString("id-ID")} m</strong></div><div><small>COINS</small><strong className="is-gold">🪙 {coins}</strong></div><div><small>BEST</small><strong>{String(best).padStart(6,"0")}</strong></div></div></div>
        <div className="mamah-game-actions" aria-label="Kontrol permainan">
          <button type="button" onPointerDown={e => e.stopPropagation()} onClick={pause} aria-label="Pause" title="Pause">Ⅱ</button>
          <button type="button" onPointerDown={e => e.stopPropagation()} onClick={() => openConfirmAction("restart")} aria-label="Restart" title="Restart">↻</button>
          <button type="button" onPointerDown={e => e.stopPropagation()} onClick={() => openConfirmAction("home")} aria-label="Home Mamah Ngamuk" title="Home">⌂</button>
        </div>
      </>}
      {status === "paused" && <section className="mamah-overlay"><div className="mamah-dialog"><span className="mamah-dialog__emoji">Ⅱ</span><p className="mamah-dialog__eyebrow">PERMAINAN DIJEDA</p><h2>ISTIRAHAT DULU?</h2><button className="mamah-button mamah-button--primary" onClick={resume}>▶ LANJUTKAN</button><button className="mamah-button" onClick={() => openConfirmAction("restart")}>↻ MAIN LAGI</button><button className="mamah-button mamah-button--quiet" onClick={() => setConfirmExit(true)}>↩ KELUAR GAME</button></div></section>}
      {status === "caught" && <section className="mamah-catch-caption" aria-live="assertive"><strong>PULANG! MANDI!</strong></section>}\n      {status === "over" && <section className="mamah-overlay mamah-overlay--gameover"><div className="mamah-dialog mamah-dialog--result"><span className="mamah-dialog__emoji">🧹</span><p className="mamah-dialog__eyebrow">MAMA BERHASIL MENANGKAP!</p><h2>KETANGKAP MAMAH!</h2><div className="mamah-result mamah-result--primary"><span>JARAK TEMPUH <strong>{distanceResult} m</strong></span><span>TOTAL KOIN <strong>🪙 {coins}</strong></span></div><div className="mamah-result"><span>SKOR AKHIR <strong>{String(score).padStart(6,"0")}</strong></span><span>BEST <strong>{String(best).padStart(6,"0")}</strong></span></div>{pendingGuestResult && <><p className="mamah-dialog__note">GUEST: HASIL INI BELUM TERSIMPAN. LOGIN GOOGLE SEKARANG UNTUK MENYIMPAN SKOR DAN KOIN.</p><button className="mamah-button mamah-button--primary" disabled={googleLinkLoading} onClick={connectGoogleFromGame}>{googleLinkLoading ? "MENGHUBUNGKAN..." : "🔐 LOGIN GOOGLE & SIMPAN HASIL"}</button><button className="mamah-button mamah-button--quiet" onClick={() => { try { sessionStorage.removeItem(PENDING_RESULT_KEY); } catch {} setPendingGuestResult(false); setResultSaveStatus("HASIL GUEST DIHAPUS"); }}>TIDAK, HAPUS HASIL</button></>}{resultSaveStatus && <p className="mamah-dialog__note">{resultSaveStatus}</p>}<button className="mamah-button mamah-button--primary" onClick={start}>↻ MAIN LAGI</button><button className="mamah-button mamah-button--quiet" onClick={goHome}>⌂ MENU UTAMA</button></div></section>}
      {confirmAction && <section className="mamah-overlay" onClick={cancelConfirmAction}><div className="mamah-dialog" role="alertdialog" aria-modal="true" onClick={e => e.stopPropagation()}><span className="mamah-dialog__emoji">{confirmAction === "restart" ? "↻" : "⌂"}</span><p className="mamah-dialog__eyebrow">KONFIRMASI</p><h2>{confirmAction === "restart" ? "RESTART PERMAINAN?" : "KEMBALI KE HOME?"}</h2><p className="mamah-dialog__note">{confirmAction === "restart" ? "Permainan saat ini akan dimulai ulang." : "Kamu akan meninggalkan sesi permainan dan kembali ke menu utama."}</p><button className="mamah-button mamah-button--primary" onClick={confirmCurrentAction}>YES</button><button className="mamah-button mamah-button--quiet" onClick={cancelConfirmAction}>NO</button></div></section>}
      {settingsOpen && <section className="mamah-overlay" onClick={() => setSettingsOpen(false)}><div className="mamah-dialog" onClick={e => e.stopPropagation()}><button className="mamah-dialog__close" onClick={() => setSettingsOpen(false)} aria-label="Tutup">×</button><p className="mamah-dialog__eyebrow">PENGATURAN</p><h2>SUARA GAME</h2><button className="mamah-button" onClick={() => setSoundOn(v => !v)}>{soundOn ? "♫ SUARA: ON" : "♪ SUARA: OFF"}</button><p className="mamah-dialog__note">Atur volume melalui tombol volume perangkat.</p></div></section>}
      {confirmExit && <section className="mamah-overlay" onClick={() => setConfirmExit(false)}><div className="mamah-dialog" role="alertdialog" aria-modal="true" aria-labelledby="mamah-exit-title" onClick={e => e.stopPropagation()}><span className="mamah-dialog__emoji">🚪</span><p className="mamah-dialog__eyebrow">KONFIRMASI</p><h2 id="mamah-exit-title">KELUAR DARI GAME?</h2><p className="mamah-dialog__note">Sesi permainan ini akan diakhiri dan kamu kembali ke Game Library.</p><button className="mamah-button" onClick={() => setConfirmExit(false)}>TETAP MAIN</button><button className="mamah-button mamah-button--danger" onClick={() => { window.location.href = "/mini-game"; }}>YA, KELUAR</button></div></section>}
    </main>
  );
}
