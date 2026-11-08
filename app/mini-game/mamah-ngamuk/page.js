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
  const soundRef = useRef(true);
  const audioRef = useRef(null);
  const touchRef = useRef(null);
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

  const start = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    Object.assign(g, { running: true, paused: false, over: false, caught: false, distance: 0, speed: 0.34, spawn: 1.2, chase: 0, scoreTick: -1, coinCount: 0 });
    Object.assign(g.player, { lane: 0, targetLane: 0, jump: 0, slide: 0 });
    g.items = [];
    setScore(0);
    setCoins(0);
    setDistanceResult(0);
    setStatus("playing");
    tone(660);
  }, [tone]);

  const move = useCallback((direction) => {
    const g = gameRef.current;
    if (!g) return;
    if (!g.running || g.paused) {
      if (!g.over && !g.paused) start();
      return;
    }
    if (direction === "left") g.player.targetLane = Math.max(-1, g.player.targetLane - 1);
    if (direction === "right") g.player.targetLane = Math.min(1, g.player.targetLane + 1);
    if (direction === "jump" && g.player.jump <= 0 && g.player.slide <= 0) {
      g.player.jump = 0.72;
      tone(570, 0.1);
    }
    if (direction === "slide" && g.player.jump <= 0) {
      g.player.slide = 0.58;
      tone(260, 0.1);
    }
  }, [start, tone]);

  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);

  useEffect(() => {
    try { setBest(Number(localStorage.getItem(BEST_KEY)) || 0); } catch {}
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const g = {
      running: false, paused: false, over: false, distance: 0, speed: 0.34, spawn: 1.2, chase: 0, scoreTick: -1, coinCount: 0,
      player: { lane: 0, targetLane: 0, jump: 0, slide: 0 },
      items: [],
    };
    gameRef.current = g;

    const sheet = new Image();
    let bootFallback;
    const finishBoot = () => {
      window.clearTimeout(bootFallback);
      setStatus("ready");
    };
    bootFallback = window.setTimeout(finishBoot, 1400);
    sheet.onload = () => { sheetRef.current = sheet; finishBoot(); };
    sheet.onerror = () => { sheetRef.current = null; finishBoot(); };
    sheet.src = "/universe-characters.png";

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

    const draw = (time) => {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#17132d");
      sky.addColorStop(0.58, "#282044");
      sky.addColorStop(1, "#11101b");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Distant skyline and atmospheric lights.
      for (let i = 0; i < 13; i++) {
        const x = i * 78 - (g.distance * 22 % 78);
        const height = 65 + (i * 31 % 95);
        ctx.fillStyle = i % 2 ? "#211d38" : "#29213f";
        ctx.fillRect(x, 480 - height, 48, height);
        ctx.fillStyle = "rgba(197,166,255,.22)";
        for (let wy = 495 - height; wy < 474; wy += 17) ctx.fillRect(x + 10, wy, 4, 5);
      }

      // Perspective road.
      ctx.fillStyle = "#171321";
      ctx.beginPath();
      ctx.moveTo(365, 480); ctx.lineTo(535, 480); ctx.lineTo(890, H); ctx.lineTo(10, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#211b30";
      ctx.beginPath();
      ctx.moveTo(390, 480); ctx.lineTo(510, 480); ctx.lineTo(820, H); ctx.lineTo(80, H); ctx.closePath(); ctx.fill();
      // Raised road shoulders add depth while the art assets are still procedural.
      ctx.fillStyle = "rgba(112,75,155,.22)";
      ctx.beginPath(); ctx.moveTo(365,480); ctx.lineTo(390,480); ctx.lineTo(80,H); ctx.lineTo(10,H); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(510,480); ctx.lineTo(535,480); ctx.lineTo(890,H); ctx.lineTo(820,H); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(184,145,255,.5)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(365, 480); ctx.lineTo(10, H); ctx.moveTo(535, 480); ctx.lineTo(890, H); ctx.stroke();

      // Lane dashes moving toward the player.
      for (let laneLine = 0; laneLine < 2; laneLine++) {
        for (let i = 0; i < 8; i++) {
          const z = ((i / 8) + (g.distance * 0.65 % 1)) % 1;
          const y = 480 + z * z * 1010;
          const x = W / 2 + (laneLine ? 1 : -1) * (13 + z * 160);
          ctx.strokeStyle = "rgba(193,163,255,.28)";
          ctx.lineWidth = 1 + z * 3;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 12 + z * 34); ctx.stroke();
        }
      }

      // Coins and obstacles: smaller at horizon, larger near player.
      [...g.items].sort((a, b) => a.z - b.z).forEach((item) => {
        const x = laneX(item.lane, item.z);
        const y = 480 + item.z * item.z * 1010;
        const scale = 0.25 + item.z * 0.95;
        if (item.kind === "coin") {
          ctx.save();
          ctx.translate(x, y - 14 * scale);
          ctx.scale(scale, scale);
          ctx.fillStyle = "#ffd76a";
          ctx.strokeStyle = "#fff0ae";
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#9b641a"; ctx.font = "bold 17px system-ui"; ctx.textAlign = "center"; ctx.fillText("$", 0, 6);
          ctx.restore();
        } else {
          const size = 22 + item.z * 58;
          ctx.save();
          ctx.translate(x, y);
          // Soft contact shadow and dimensional base for every obstacle.
          ctx.fillStyle = "rgba(0,0,0,.34)";
          ctx.beginPath(); ctx.ellipse(0, 2, size * .9, size * .2, 0, 0, Math.PI * 2); ctx.fill();
          if (item.kind === "barrier") {
            ctx.fillStyle = "#713c58";
            ctx.fillRect(-size * .7, -size * .12, size * 1.4, size * .2);
            ctx.fillStyle = "#dc6c69";
            ctx.fillRect(-size * .7, -size * .75, size * 1.4, size * .75);
            ctx.fillStyle = "rgba(255,255,255,.22)";
            ctx.fillRect(-size * .7, -size * .75, size * 1.4, size * .1);
            ctx.fillStyle = "#a94f62";
            ctx.beginPath(); ctx.moveTo(size*.7,-size*.75); ctx.lineTo(size*.88,-size*.58); ctx.lineTo(size*.88,-size*.03); ctx.lineTo(size*.7,0); ctx.closePath(); ctx.fill();
            ctx.fillStyle = "#f7c2a2";
            ctx.fillRect(-size * .7, -size * .75, size * 1.4, size * .14);
            ctx.fillStyle = "#4a3044";
            ctx.fillRect(-size * .55, -size * .1, size * .16, size * .48);
            ctx.fillRect(size * .39, -size * .1, size * .16, size * .48);
          } else if (item.kind === "arch") {
            ctx.fillStyle = "#4d3b70";
            ctx.fillRect(-size*.72,-size*1.25,size*.24,size*1.25);
            ctx.fillRect(size*.48,-size*1.25,size*.24,size*1.25);
            ctx.fillStyle = "#a995d8";
            ctx.fillRect(-size * .72, -size * 1.25, size * .24, size * 1.25);
            ctx.fillRect(size * .48, -size * 1.25, size * .24, size * 1.25);
            ctx.fillStyle = "#8a72bd";
            ctx.fillRect(-size * .72, -size * 1.25, size * 1.44, size * .26);
            ctx.fillStyle = "rgba(255,255,255,.22)";
            ctx.fillRect(-size * .68, -size * 1.22, size * 1.36, size * .06);
          } else {
            // Crate: front face, shaded side and top plane for a simple 2.5D cube.
            ctx.fillStyle = "#b96a69";
            ctx.fillRect(-size * .62, -size * .82, size * 1.24, size * .82);
            ctx.fillStyle = "#8d4d61";
            ctx.beginPath(); ctx.moveTo(size*.62,-size*.82); ctx.lineTo(size*.82,-size*.65); ctx.lineTo(size*.82,size*.02); ctx.lineTo(size*.62,0); ctx.closePath(); ctx.fill();
            ctx.fillStyle = "#f2b4a1";
            ctx.beginPath(); ctx.moveTo(-size*.62,-size*.82); ctx.lineTo(-size*.42,-size); ctx.lineTo(size*.82,-size*.82); ctx.lineTo(size*.62,-size*.65); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,.32)";
            ctx.lineWidth = Math.max(1,size*.045);
            ctx.strokeRect(-size*.52,-size*.7,size*1.04,size*.58);
          }
          ctx.restore();
        }
      });

      const player = g.player;
      const px = laneX(player.lane, 1);
      const bounce = g.running && player.jump <= 0 && player.slide <= 0 ? Math.sin(time / 65) * 4 : 0;
      // Mama Veylora stays behind the child; her broom swings while she runs.
      const mamaY = (g.caught ? 1450 : 1510) + Math.sin(time / 95) * 4;
      const mamaDrawn = drawSprite(2, px - 12, mamaY, 110, 138, Math.floor(time / 130) % 4);
      if (!mamaDrawn) {
        ctx.font = "58px system-ui"; ctx.textAlign = "center"; ctx.fillText("👩🏻", px - 4, mamaY - 8);
      }
      ctx.save();
      ctx.translate(px + 48, mamaY - 65);
      ctx.rotate(Math.sin(time / 105) * .32 - .45);
      ctx.strokeStyle = "#9b6a43"; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, 25); ctx.lineTo(40, -28); ctx.stroke();
      ctx.fillStyle = "#d9b77d";
      ctx.beginPath(); ctx.moveTo(40, -28); ctx.lineTo(55, -19); ctx.lineTo(48, -4); ctx.lineTo(34, -12); ctx.closePath(); ctx.fill();
      ctx.restore();

      const childY = (g.caught ? 1450 : 1400) - player.jump * 210;
      const childHeight = player.slide > 0 ? 62 : 112;
      const childWidth = player.slide > 0 ? 76 : 82;
      const childDrawn = drawSprite(4, px, childY + bounce, childWidth * 1.18, childHeight * 1.18, Math.floor(time / 105) % 4);
      if (!childDrawn) {
        ctx.font = "62px system-ui"; ctx.textAlign = "center"; ctx.fillText("🧒", px, childY + bounce);
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
      setStatus("over");
      tone(150, .24);
    };

    const update = (dt) => {
      if (!g.running || g.paused) return;
      const p = g.player;
      g.distance += g.speed * dt;
      g.speed = Math.min(.72, g.speed + .000025 * dt);
      p.lane += (p.targetLane - p.lane) * Math.min(1, dt * 0.24);
      p.jump = Math.max(0, p.jump - dt * .0015);
      p.slide = Math.max(0, p.slide - dt * .0017);
      g.spawn -= dt;
      if (g.spawn <= 0) {
        // Subway-style readable patterns: one main obstacle with open escape lanes.
        const lane = LANES[Math.floor(Math.random() * 3)];
        const roll = Math.random();
        if (roll < .28) {
          // A short coin trail rewards a safe lane without blocking the route.
          for (let i = 0; i < 4; i++) g.items.push({ lane, z: -i * .13, kind: "coin" });
        } else {
          const kind = roll < .53 ? "barrier" : roll < .77 ? "arch" : "crate";
          g.items.push({ lane, z: 0, kind });
          // Coins may appear in a different lane, never as a wall of obstacles.
          if (Math.random() < .48) {
            const safeLane = LANES.filter((value) => value !== lane)[Math.floor(Math.random() * 2)];
            for (let i = 0; i < 3; i++) g.items.push({ lane: safeLane, z: -.1 - i * .13, kind: "coin" });
          }
        }
        g.spawn = 2.25 + Math.random() * 1.05;
      }
      g.items.forEach((item) => { item.z += g.speed * dt * .0012; });
      g.items = g.items.filter((item) => item.z < 1.12);
      const coinHits = g.items.filter((item) => item.kind === "coin" && !item.resolved && item.z > .91 && item.z < 1.04 && Math.abs(item.lane - p.lane) < .42);
      if (coinHits.length) {
        g.coinCount += coinHits.length;
        coinHits.forEach((item) => { item.resolved = true; });
        setCoins(g.coinCount);
        tone(880, .045);
      }
      const obstacleHit = g.items.find((item) => {
        if (item.kind === "coin" || item.resolved || item.z <= .91 || item.z >= 1.04 || Math.abs(item.lane - p.lane) >= .42) return false;
        const failedMove =
          (item.kind === "barrier" && p.jump < .22) ||
          (item.kind === "arch" && p.slide < .18) ||
          (item.kind === "crate" && p.jump < .2);
        return failedMove;
      });
      if (obstacleHit) {
        obstacleHit.resolved = true;
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
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) event.preventDefault();
      if (event.code === "ArrowLeft" || event.code === "KeyA") move("left");
      if (event.code === "ArrowRight" || event.code === "KeyD") move("right");
      if (event.code === "ArrowUp" || event.code === "Space" || event.code === "KeyW") move("jump");
      if (event.code === "ArrowDown" || event.code === "KeyS") move("slide");
    };
    window.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(bootFallback);
      observer.disconnect();
      window.removeEventListener("keydown", key);
      gameRef.current = null;
      sheetRef.current = null;
    };
  }, [move, tone]);

  useEffect(() => () => {
    if (audioRef.current && audioRef.current.state !== "closed") audioRef.current.close().catch(() => {});
  }, []);

  const pause = () => {
    const g = gameRef.current;
    if (!g || !g.running) return;
    g.paused = true;
    setStatus("paused");
  };
  const resume = () => {
    const g = gameRef.current;
    if (!g || !g.paused) return;
    g.paused = false;
    setStatus("playing");
  };

  const pointerDown = (event) => { touchRef.current = { x: event.clientX, y: event.clientY }; };
  const pointerUp = (event) => {
    if (!touchRef.current) return;
    const dx = event.clientX - touchRef.current.x;
    const dy = event.clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? "left" : "right");
    else move(dy < 0 ? "jump" : "slide");
  };

  return (
    <main className="mamah-game mini-game-screen" aria-label="Mamah Ngamuk game">
      <canvas ref={canvasRef} className="mamah-game__world" aria-label="Dunia permainan Mamah Ngamuk" onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => { touchRef.current = null; }} />
      <div className="mamah-game__vignette" aria-hidden="true" />
      {status === "loading" && <section className="mamah-screen mamah-screen--loading"><div className="mamah-loader"><span>DF</span></div><p className="mamah-brand__eyebrow">DAJJAL FAMILY · GAMING UNIVERSE</p><h1 className="mamah-logo">MAMAH <span>NGAMUK!</span></h1><p className="mamah-loading-label">MENYIAPKAN DUNIA GAME...</p></section>}
      {status === "ready" && <section className="mamah-screen mamah-screen--menu">
        <div className="mamah-brand"><span className="mamah-brand__eyebrow">DAJJAL FAMILY · GAMING UNIVERSE</span><h1 className="mamah-logo">MAMAH <span>NGAMUK!</span></h1><p className="mamah-tagline">ANAK DAJJAL KABUR. MAMAH VEYLORA MENGEJAR!</p></div>
        <div className="mamah-menu-card"><div className="mamah-menu-card__coin">🪙 <strong>{coins}</strong></div><button type="button" className="mamah-button mamah-button--primary" onClick={start}>▶ MULAI MAIN</button><button type="button" className="mamah-button" onClick={() => setSettingsOpen(true)}>⚙ PENGATURAN</button><button type="button" className="mamah-button mamah-button--quiet" onClick={() => setConfirmExit(true)}>↩ KELUAR KE GAME LIBRARY</button></div>
        <p className="mamah-menu-hint">SWIPE UNTUK BERGERAK · HINDARI RINTANGAN · KUMPULKAN KOIN</p>
      </section>}
      {status === "playing" && <>
        <div className="mamah-hud"><button type="button" className="mamah-hud__icon" onClick={pause} aria-label="Pause game">Ⅱ</button><div className="mamah-hud__stats"><div><small>SCORE</small><strong>{String(score).padStart(6,"0")}</strong></div><div><small>COINS</small><strong className="is-gold">🪙 {coins}</strong></div><div><small>BEST</small><strong>{String(best).padStart(6,"0")}</strong></div></div><button type="button" className="mamah-hud__icon" onClick={() => setSoundOn(v => !v)} aria-label={soundOn ? "Matikan suara" : "Nyalakan suara"}>{soundOn ? "♫" : "♪"}</button></div>
        <div className="mamah-controls"><button type="button" onClick={() => move("left")} aria-label="Kiri">←</button><button type="button" onClick={() => move("jump")} aria-label="Lompat">↑</button><button type="button" onClick={() => move("slide")} aria-label="Merunduk">↓</button><button type="button" onClick={() => move("right")} aria-label="Kanan">→</button></div><p className="mamah-controls-hint">GESER LAYAR ATAU GUNAKAN TOMBOL</p>
      </>}
      {status === "paused" && <section className="mamah-overlay"><div className="mamah-dialog"><span className="mamah-dialog__emoji">Ⅱ</span><p className="mamah-dialog__eyebrow">PERMAINAN DIJEDA</p><h2>ISTIRAHAT DULU?</h2><button className="mamah-button mamah-button--primary" onClick={resume}>▶ LANJUTKAN</button><button className="mamah-button" onClick={start}>↻ MAIN LAGI</button><button className="mamah-button mamah-button--quiet" onClick={() => setConfirmExit(true)}>↩ KELUAR GAME</button></div></section>}
      {status === "over" && <section className="mamah-overlay"><div className="mamah-dialog mamah-dialog--result"><span className="mamah-dialog__emoji">🧹</span><p className="mamah-dialog__eyebrow">MAMA BERHASIL MENANGKAP!</p><h2>KETANGKAP MAMAH!</h2><div className="mamah-result mamah-result--primary"><span>JARAK TEMPUH <strong>{distanceResult} m</strong></span><span>TOTAL KOIN <strong>🪙 {coins}</strong></span></div><div className="mamah-result"><span>SKOR AKHIR <strong>{String(score).padStart(6,"0")}</strong></span><span>BEST <strong>{String(best).padStart(6,"0")}</strong></span></div><button className="mamah-button mamah-button--primary" onClick={start}>↻ MAIN LAGI</button><button className="mamah-button mamah-button--quiet" onClick={() => setStatus("ready")}>⌂ MENU UTAMA</button></div></section>}
      {settingsOpen && <section className="mamah-overlay" onClick={() => setSettingsOpen(false)}><div className="mamah-dialog" onClick={e => e.stopPropagation()}><button className="mamah-dialog__close" onClick={() => setSettingsOpen(false)} aria-label="Tutup">×</button><p className="mamah-dialog__eyebrow">PENGATURAN</p><h2>SUARA GAME</h2><button className="mamah-button" onClick={() => setSoundOn(v => !v)}>{soundOn ? "♫ SUARA: ON" : "♪ SUARA: OFF"}</button><p className="mamah-dialog__note">Atur volume melalui tombol volume perangkat.</p></div></section>}
      {confirmExit && <section className="mamah-overlay" onClick={() => setConfirmExit(false)}><div className="mamah-dialog" role="alertdialog" aria-modal="true" aria-labelledby="mamah-exit-title" onClick={e => e.stopPropagation()}><span className="mamah-dialog__emoji">🚪</span><p className="mamah-dialog__eyebrow">KONFIRMASI</p><h2 id="mamah-exit-title">KELUAR DARI GAME?</h2><p className="mamah-dialog__note">Sesi permainan ini akan diakhiri dan kamu kembali ke Game Library.</p><button className="mamah-button" onClick={() => setConfirmExit(false)}>TETAP MAIN</button><button className="mamah-button mamah-button--danger" onClick={() => { window.location.href = "/mini-game"; }}>YA, KELUAR</button></div></section>}
    </main>
  );
}
