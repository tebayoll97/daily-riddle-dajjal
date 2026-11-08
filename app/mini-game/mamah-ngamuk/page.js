"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const W = 900;
const H = 520;
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
  const [status, setStatus] = useState("ready");
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [best, setBest] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const tone = useCallback((frequency = 520, duration = 0.08) => {
    if (!soundRef.current || typeof window === "undefined") return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      const ctx = audioRef.current || new Audio();
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
    Object.assign(g, { running: true, over: false, distance: 0, speed: 0.34, spawn: 1.1, chase: 0, scoreTick: -1, coinCount: 0 });
    Object.assign(g.player, { lane: 0, targetLane: 0, jump: 0, slide: 0 });
    g.items = [];
    setScore(0);
    setCoins(0);
    setStatus("playing");
    tone(660);
  }, [tone]);

  const move = useCallback((direction) => {
    const g = gameRef.current;
    if (!g) return;
    if (!g.running) {
      if (!g.over) start();
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
      running: false, over: false, distance: 0, speed: 0.34, spawn: 1.1, chase: 0, scoreTick: -1, coinCount: 0,
      player: { lane: 0, targetLane: 0, jump: 0, slide: 0 },
      items: [],
    };
    gameRef.current = g;

    const sheet = new Image();
    sheet.onload = () => { sheetRef.current = sheet; };
    sheet.onerror = () => { sheetRef.current = null; };
    sheet.src = "/universe-characters.png";

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.width * H / W * dpr));
      ctx.setTransform(canvas.width / W, 0, 0, canvas.width / W, 0, 0);
    };

    const laneX = (lane, z) => W / 2 + lane * (36 + z * 130);
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
        ctx.fillRect(x, 220 - height, 48, height);
        ctx.fillStyle = "rgba(197,166,255,.22)";
        for (let wy = 235 - height; wy < 214; wy += 17) ctx.fillRect(x + 10, wy, 4, 5);
      }

      // Perspective road.
      ctx.fillStyle = "#171321";
      ctx.beginPath();
      ctx.moveTo(385, 190); ctx.lineTo(515, 190); ctx.lineTo(880, H); ctx.lineTo(20, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#211b30";
      ctx.beginPath();
      ctx.moveTo(398, 190); ctx.lineTo(502, 190); ctx.lineTo(820, H); ctx.lineTo(80, H); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(184,145,255,.5)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(385, 190); ctx.lineTo(20, H); ctx.moveTo(515, 190); ctx.lineTo(880, H); ctx.stroke();

      // Lane dashes moving toward the player.
      for (let laneLine = 0; laneLine < 2; laneLine++) {
        for (let i = 0; i < 8; i++) {
          const z = ((i / 8) + (g.distance * 0.65 % 1)) % 1;
          const y = 190 + z * z * 330;
          const x = W / 2 + (laneLine ? 1 : -1) * (13 + z * 145);
          ctx.strokeStyle = "rgba(193,163,255,.28)";
          ctx.lineWidth = 1 + z * 3;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 8 + z * 18); ctx.stroke();
        }
      }

      // Coins and obstacles: smaller at horizon, larger near player.
      [...g.items].sort((a, b) => a.z - b.z).forEach((item) => {
        const x = laneX(item.lane, item.z);
        const y = 190 + item.z * item.z * 330;
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
          if (item.kind === "barrier") {
            ctx.fillStyle = "#dc6c69";
            ctx.fillRect(-size * .7, -size * .75, size * 1.4, size * .75);
            ctx.fillStyle = "#f7c2a2";
            ctx.fillRect(-size * .7, -size * .75, size * 1.4, size * .14);
            ctx.fillStyle = "#4a3044";
            ctx.fillRect(-size * .55, -size * .1, size * .16, size * .48);
            ctx.fillRect(size * .39, -size * .1, size * .16, size * .48);
          } else if (item.kind === "arch") {
            ctx.fillStyle = "#8a72bd";
            ctx.fillRect(-size * .72, -size * 1.25, size * .24, size * 1.25);
            ctx.fillRect(size * .48, -size * 1.25, size * .24, size * 1.25);
            ctx.fillRect(-size * .72, -size * 1.25, size * 1.44, size * .26);
          } else {
            ctx.fillStyle = "#b8a7d5";
            ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(size * .72, 0); ctx.lineTo(-size * .72, 0); ctx.closePath(); ctx.fill();
            ctx.fillStyle = "#7d6b9d";
            ctx.fillRect(-size * .62, -size * .18, size * 1.24, size * .18);
          }
          ctx.restore();
        }
      });

      const player = g.player;
      const px = laneX(player.lane, 1);
      const bounce = g.running && player.jump <= 0 && player.slide <= 0 ? Math.sin(time / 65) * 4 : 0;
      // Mama Veylora stays behind the child; her broom swings while she runs.
      const mamaY = 458 + Math.sin(time / 95) * 3;
      const mamaDrawn = drawSprite(2, px - 4, mamaY, 76, 96, Math.floor(time / 130) % 4);
      if (!mamaDrawn) {
        ctx.font = "58px system-ui"; ctx.textAlign = "center"; ctx.fillText("👩🏻", px - 4, mamaY - 8);
      }
      ctx.save();
      ctx.translate(px + 39, mamaY - 48);
      ctx.rotate(Math.sin(time / 105) * .32 - .45);
      ctx.strokeStyle = "#9b6a43"; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, 25); ctx.lineTo(40, -28); ctx.stroke();
      ctx.fillStyle = "#d9b77d";
      ctx.beginPath(); ctx.moveTo(40, -28); ctx.lineTo(55, -19); ctx.lineTo(48, -4); ctx.lineTo(34, -12); ctx.closePath(); ctx.fill();
      ctx.restore();

      const childY = 408 - player.jump * 118;
      const childHeight = player.slide > 0 ? 50 : 86;
      const childWidth = player.slide > 0 ? 62 : 68;
      const childDrawn = drawSprite(4, px, childY + bounce, childWidth, childHeight, Math.floor(time / 105) % 4);
      if (!childDrawn) {
        ctx.font = "62px system-ui"; ctx.textAlign = "center"; ctx.fillText("🧒", px, childY + bounce);
      }

      // Chase pressure glow at the lower edge.
      const pressure = Math.min(1, g.chase);
      if (pressure > 0.02) {
        ctx.fillStyle = "rgba(235,83,122," + (pressure * .12) + ")";
        ctx.fillRect(0, H - 18, W, 18);
      }
      if (!g.running) {
        ctx.fillStyle = "rgba(5,4,12,.25)";
        ctx.fillRect(0, 0, W, H);
      }
    };

    const finish = () => {
      g.running = false; g.over = true;
      const finalScore = Math.floor(g.distance * 12) + g.coinCount * 25;
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
      if (!g.running) return;
      const p = g.player;
      g.distance += g.speed * dt;
      g.speed = Math.min(.72, g.speed + .000025 * dt);
      p.lane += (p.targetLane - p.lane) * Math.min(1, dt * 0.24);
      p.jump = Math.max(0, p.jump - dt * .0015);
      p.slide = Math.max(0, p.slide - dt * .0017);
      g.spawn -= dt;
      if (g.spawn <= 0) {
        const lane = LANES[Math.floor(Math.random() * 3)];
        const roll = Math.random();
        const kind = roll < .25 ? "coin" : roll < .53 ? "barrier" : roll < .76 ? "arch" : "crate";
        if (kind === "coin") {
          for (let i = 0; i < 5; i++) g.items.push({ lane, z: -i * .1, kind });
        } else {
          g.items.push({ lane, z: 0, kind });
          if (Math.random() < .25) g.items.push({ lane: LANES[(LANES.indexOf(lane) + 1) % 3], z: -.18, kind: "coin" });
        }
        g.spawn = 1.05 + Math.random() * .65 - g.speed * .25;
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
      g.items.forEach((item) => {
        if (item.kind === "coin" || item.resolved || item.z <= .91 || item.z >= 1.04 || Math.abs(item.lane - p.lane) >= .42) return;
        item.resolved = true;
        const failedMove =
          (item.kind === "barrier" && p.jump < .22) ||
          (item.kind === "arch" && p.slide < .18) ||
          (item.kind === "crate" && p.jump < .2);
        if (failedMove) {
          g.chase = Math.min(1, g.chase + .36);
          tone(190, .12);
        } else {
          g.chase = Math.max(0, g.chase - .12);
        }
      });
      g.chase = Math.max(0, g.chase - .00012 * dt);
      if (g.chase >= 1) { finish(); return; }
      const points = Math.floor(g.distance * 12) + g.coinCount * 25;
      if (Math.floor(g.distance * 12 / 10) !== g.scoreTick) {
        g.scoreTick = Math.floor(g.distance * 12 / 10) * 10;
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
      observer.disconnect();
      window.removeEventListener("keydown", key);
      gameRef.current = null;
      sheetRef.current = null;
    };
  }, [move, tone]);

  useEffect(() => () => {
    if (audioRef.current && audioRef.current.state !== "closed") audioRef.current.close().catch(() => {});
  }, []);

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
    <main className="min-h-screen bg-[#080711] px-3 py-5 text-white sm:px-5 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/mini-game" className="ui-interactive rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-purple-200">← MINI GAME</Link>
          <button type="button" onClick={() => setSoundOn((v) => !v)} aria-pressed={soundOn} className="ui-interactive rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2.5 text-xs font-bold text-purple-100">{soundOn ? "♫ SOUND ON" : "♪ SOUND OFF"}</button>
        </div>

        <header className="text-center">
          <p className="ui-eyebrow">DAJJAL FAMILY · MINI GAME</p>
          <h1 className="ui-title text-center">MAMAH <span className="text-purple-300">CHASE</span></h1>
          <p className="ui-subtitle mx-auto text-center">Anak Dajjal kabur! Mamah Veylora mengejar sambil membawa sapu. Jangan sampai tertangkap! 😂</p>
        </header>

        <section className="overflow-hidden rounded-3xl border border-purple-400/20 bg-[#100d1d] p-2.5 shadow-[0_20px_70px_rgba(76,29,149,.16)] sm:p-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <div><p className="text-[9px] font-black tracking-[.2em] text-purple-300">SCORE</p><p className="font-mono text-2xl font-black tabular-nums">{String(score).padStart(6, "0")}</p></div>
            <div className="text-center"><p className="text-[9px] font-black tracking-[.2em] text-amber-300">COINS</p><p className="font-mono text-xl font-black text-amber-200">🪙 {coins}</p></div>
            <div className="text-right"><p className="text-[9px] font-black tracking-[.2em] text-gray-500">BEST</p><p className="font-mono text-xl font-bold tabular-nums text-gray-300">{String(best).padStart(6, "0")}</p></div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-purple-300/15 bg-[#0c0a17]">
            <canvas ref={canvasRef} className="block aspect-[900/520] w-full touch-none" aria-label="Universe Runner. Geser kiri kanan untuk pindah jalur, ke atas untuk melompat, ke bawah untuk sliding." onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => { touchRef.current = null; }} />
            {status !== "playing" && <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080711]/50 px-4 text-center backdrop-blur-[2px]">
              <div className="mb-2 text-4xl" aria-hidden="true">{status === "over" ? "🧹" : "🏃‍♂️"}</div>
              <p className="text-lg font-black tracking-wide">{status === "over" ? "MAMAH CAUGHT YOU!" : "SIAP KABUR?"}</p>
              <p className="mt-1 max-w-sm text-xs text-gray-300">{status === "over" ? "Waduh, ketahuan Mamah! Coba lari lebih jauh lagi." : "Kumpulkan koin, hindari rintangan, dan jangan sampai Mama menangkapmu."}</p>
              <button type="button" onClick={start} className="ui-interactive mt-4 rounded-xl bg-purple-600 px-7 py-3 text-xs font-black tracking-wider shadow-lg shadow-purple-950/40 hover:bg-purple-500">{status === "over" ? "LARI LAGI" : "MULAI LARI"}</button>
            </div>}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:hidden">
            <button onClick={() => move("left")} className="ui-interactive rounded-xl border border-white/10 bg-white/5 py-3 text-lg font-black">←</button>
            <button onClick={() => move("jump")} className="ui-interactive rounded-xl border border-purple-400/25 bg-purple-500/10 py-3 text-lg font-black">↑</button>
            <button onClick={() => move("slide")} className="ui-interactive rounded-xl border border-purple-400/25 bg-purple-500/10 py-3 text-lg font-black">↓</button>
            <button onClick={() => move("right")} className="ui-interactive rounded-xl border border-white/10 bg-white/5 py-3 text-lg font-black">→</button>
          </div>
          <p className="mt-3 text-center text-[10px] text-gray-500">SWIPE: ← → pindah jalur · ↑ lompat · ↓ sliding</p>
        </section>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl border border-white/8 bg-white/[.025] p-3 text-center"><p className="text-[9px] font-bold tracking-wider text-gray-500">RUNNER</p><p className="mt-1 text-xs font-bold text-purple-100">ANAK DAJJAL</p></div>
          <div className="rounded-xl border border-white/8 bg-white/[.025] p-3 text-center"><p className="text-[9px] font-bold tracking-wider text-gray-500">CHASER</p><p className="mt-1 text-xs font-bold text-purple-100">MAMAH VEYLORA</p></div>
          <div className="rounded-xl border border-white/8 bg-white/[.025] p-3 text-center"><p className="text-[9px] font-bold tracking-wider text-gray-500">SPECIAL ITEM</p><p className="mt-1 text-xs font-bold text-purple-100">🧹 MAMAH BROOM</p></div>
        </div>
        <p className="text-center text-[10px] tracking-wider text-gray-600">DAJJAL FAMILY · GAMING UNIVERSE</p>
      </div>
    </main>
  );
}
