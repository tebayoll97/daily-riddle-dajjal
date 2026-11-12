"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "../mini-game-master.css";
import "./run-jump.css";

const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 320;
const GROUND_Y = 258;
const BEST_SCORE_KEY = "dajjal-run-jump-best";

export default function MiniGamePage() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const frameRef = useRef(0);
  const spriteRef = useRef(null);
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
      spawn: 72,
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
      if (Number.isFinite(savedBest) && savedBest > 0) setBest(savedBest);
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
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * pixelRatio));
      const height = Math.max(1, Math.round((rect.width * WORLD_HEIGHT / WORLD_WIDTH) * pixelRatio));
      canvas.width = width;
      canvas.height = height;
      context.setTransform(width / WORLD_WIDTH, 0, 0, width / WORLD_WIDTH, 0, 0);
    };

    const draw = (time) => {
      const sky = context.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
      sky.addColorStop(0, "#17142d");
      sky.addColorStop(1, "#0b1020");
      context.fillStyle = sky;
      context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      context.fillStyle = "rgba(255,255,255,.48)";
      for (let i = 0; i < 28; i += 1) {
        context.fillRect((i * 137 + 23) % WORLD_WIDTH, (i * 47 + 17) % 175, 2, 2);
      }

      game.clouds.forEach((cloud) => {
        context.fillStyle = "rgba(191,180,230,.12)";
        context.beginPath();
        context.arc(cloud.x, cloud.y, 17, 0, Math.PI * 2);
        context.arc(cloud.x + 20, cloud.y - 7, 22, 0, Math.PI * 2);
        context.arc(cloud.x + 43, cloud.y, 16, 0, Math.PI * 2);
        context.fill();
      });

      context.fillStyle = "#17142b";
      context.fillRect(0, GROUND_Y, WORLD_WIDTH, WORLD_HEIGHT - GROUND_Y);
      context.strokeStyle = "rgba(167,139,250,.65)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, GROUND_Y);
      context.lineTo(WORLD_WIDTH, GROUND_Y);
      context.stroke();

      context.strokeStyle = "rgba(167,139,250,.2)";
      context.lineWidth = 1;
      for (let x = -((game.distance * 1.4) % 48); x < WORLD_WIDTH; x += 48) {
        context.beginPath();
        context.moveTo(x, GROUND_Y + 19);
        context.lineTo(x + 22, GROUND_Y + 19);
        context.stroke();
      }

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
        context.font = obstacle.type === "rock" ? "34px system-ui" : "38px system-ui";
        context.textAlign = "center";
        context.fillText(
          obstacle.type === "rock" ? "🪨" : "🌵",
          obstacle.x + obstacle.width / 2,
          GROUND_Y - 4
        );
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
      game.speed = Math.min(11.5, game.speed + 0.0018 * delta);

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
        const type = Math.random() > 0.72 ? "rock" : "cactus";
        game.obstacles.push({
          x: WORLD_WIDTH + 10,
          width: type === "rock" ? 34 : 30,
          type,
        });
        game.spawn = 62 + Math.random() * 54 - game.speed * 2;
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
      const collided = game.obstacles.some((obstacle) =>
        playerBox.right > obstacle.x + 5 &&
        playerBox.left < obstacle.x + obstacle.width - 4 &&
        playerBox.bottom > GROUND_Y - 40 &&
        playerBox.top < GROUND_Y
      );

      const points = Math.floor(game.distance / 8);
      if (points % 5 === 0 && points !== game.lastScore) {
        game.lastScore = points;
        setScore(points);
      }

      if (collided) {
        game.running = false;
        game.over = true;
        setScore(points);
        setBest((previousBest) => {
          const nextBest = Math.max(previousBest, points);
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
          <div className="mg-game-stats mb-2 flex shrink-0 items-center justify-between px-1 sm:mb-3">
            <div>
              <p className="text-[9px] font-black tracking-[.22em] text-purple-300">DISTANCE</p>
              <p className="font-mono text-2xl font-black tabular-nums sm:text-3xl">
                {String(score).padStart(5, "0")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black tracking-[.22em] text-gray-500">PERSONAL BEST</p>
              <p className="font-mono text-lg font-bold tabular-nums text-gray-300 sm:text-xl">
                {String(best).padStart(5, "0")}
              </p>
            </div>
          </div>

          <div className="mg-game-world-frame w-full overflow-hidden rounded-2xl border border-purple-300/15">
            <div className="mg-extended-sky" aria-hidden="true">
              <span className="mg-sky-star mg-sky-star--one" />
              <span className="mg-sky-star mg-sky-star--two" />
              <span className="mg-sky-star mg-sky-star--three" />
              <span className="mg-sky-cloud mg-sky-cloud--one" />
              <span className="mg-sky-cloud mg-sky-cloud--two" />
              <span className="mg-sky-cloud mg-sky-cloud--three" />
              <span className="mg-sky-glow" />
            </div>
            <div className="mg-game-canvas-frame relative w-full overflow-hidden bg-[#0c0a17]">
              <canvas
                ref={canvasRef}
                className="mg-game-canvas block w-full touch-none"
                aria-label="Permainan lari dan melompat. Ketuk area permainan atau tekan Space untuk melompat."
                onPointerDown={jump}
              />
              {status !== "playing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#080711]/55 px-3 py-2 text-center backdrop-blur-[2px]">
                  <div className="mb-0.5 text-2xl sm:text-4xl" aria-hidden="true">
                    {status === "over" ? "💥" : "🏃"}
                  </div>
                  <p className="text-base font-black tracking-wide sm:text-lg">
                    {status === "over" ? "GAME OVER" : "READY TO RUN?"}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-gray-300 sm:text-xs">
                    {status === "over"
                      ? `Jarak kamu: ${score} poin`
                      : "Tekan tombol untuk memulai permainan"}
                  </p>
                  <button
                    type="button"
                    onClick={startGame}
                    className="ui-interactive mt-2 min-h-10 rounded-xl bg-purple-600 px-6 py-2 text-[10px] font-black tracking-wider shadow-lg shadow-purple-950/40 hover:bg-purple-500 sm:mt-4 sm:px-7 sm:py-3 sm:text-xs"
                  >
                    {status === "over" ? "PLAY AGAIN" : "START GAME"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mg-game-controls mt-2 flex shrink-0 flex-col items-center gap-2 sm:mt-3">
            <p className="text-center text-[10px] leading-relaxed text-gray-500 sm:text-[11px]">
              TAP layar untuk melompat · SPACE / ↑ di desktop
            </p>
            <button
              type="button"
              onClick={jump}
              disabled={status === "over"}
              className="ui-interactive min-h-11 w-full rounded-xl border border-purple-400/30 bg-purple-500/10 px-6 py-2.5 text-xs font-black text-purple-100 hover:bg-purple-500/20 disabled:opacity-40 sm:text-sm"
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
