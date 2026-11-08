"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./mamah-ngamuk.css";

const W = 900;
const H = 1600;
const BEST_KEY = "mamah-ngamuk-best-v1";
const LANES = [-1, 0, 1];

export default function MamahNgamukPage() {
  const canvasRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const gameRef = useRef(null);
  const rafRef = useRef(0);
  const sheetRef = useRef(null);
  const soundRef = useRef(true);
  const audioRef = useRef(null);
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

  const start = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    Object.assign(g, { running: true, paused: false, over: false, caught: false, distance: 0, speed: 0.105, spawn: 2.8, chase: 0, scoreTick: -1, coinCount: 0 });
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
    const threeCanvas = threeCanvasRef.current;
    if (!ctx || !threeCanvas) return;

    // Lightweight real-time 3D layer for prototype obstacles.
    const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene3d = new THREE.Scene();
    const camera3d = new THREE.OrthographicCamera(0, W, H, 0, 0.1, 3000);
    camera3d.position.set(W / 2, H / 2, 1800);
    camera3d.lookAt(W / 2, H / 2, 0);
    scene3d.add(new THREE.HemisphereLight(0xe8d9ff, 0x24172f, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffd6b0, 2.4);
    keyLight.position.set(-350, 1250, 900);
    keyLight.castShadow = true;
    scene3d.add(keyLight);
    const obstacleMeshes = new Map();
    const makeMaterial = (color, roughness = 0.78, metalness = 0.04) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
    const makeObstacle = (kind) => {
      const group = new THREE.Group();
      const material = (color) => new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.06});
      const box = (w,h,d,x,y,z,color) => { const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color)); m.position.set(x,y,z); m.castShadow=true; group.add(m); return m; };
      if (["sedan","taxi","van","bus","truck"].includes(kind)) {
        const dims = kind==="bus"?[150,112,78]:kind==="truck"?[142,105,82]:kind==="van"?[132,96,76]:kind==="taxi"?[124,78,70]:[124,78,70];
        const [w,h,d]=dims, body=kind==="taxi"?0xe5b83f:kind==="van"?0x6c80b5:kind==="bus"?0x4d7595:kind==="truck"?0x9c6555:0x9b536c;
        box(w,h*.56,d,0,-h*.13,0,body); box(w*.76,h*.43,d*.78,0,h*.31,-d*.04,kind==="taxi"?0xf3d477:0x3b3d58);
        box(w*.82,7,d*.84,0,-h*.02,d*.52,0xd8d5d0);
        [-.32,.32].forEach(x=>{ const wheel=new THREE.Mesh(new THREE.CylinderGeometry(11,11,8,16),material(0x17151c)); wheel.rotation.z=Math.PI/2; wheel.position.set(x*w,-h*.45,d*.22); group.add(wheel); });
        [-1,0,1].forEach(i=>box(w*.18,h*.2,4,i*w*.25,h*.31,d*.39,0xaac4d8));
        box(w*.2,10,5,-w*.34,-h*.12,d*.53,0xffe4a0); box(w*.2,10,5,w*.34,-h*.12,d*.53,0xffe4a0);
        if(kind==="taxi") box(w*.25,7,d*.2,0,h*.55,0,0xfff0b0);
      } else if(kind==="tire") {
        const tire=new THREE.Mesh(new THREE.TorusGeometry(23,9,10,20),material(0x26242d)); tire.rotation.x=Math.PI/2; tire.position.y=-6; group.add(tire);
      } else {
        const cone=new THREE.Mesh(new THREE.ConeGeometry(22,58,8),material(0xff873e)); cone.position.y=15; group.add(cone); box(52,7,28,0,-16,0,0xf4e7cf);
      }
      return group;
    };
    const g = {
      running: false, paused: false, over: false, distance: 0, speed: 0.18, spawn: 3.4, chase: 0, scoreTick: -1, coinCount: 0,
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
      renderer.setSize(rect.width, rect.height, false);
      const visibleWidth = H * (rect.width / Math.max(1, rect.height));
      camera3d.left = (W - visibleWidth) / 2;
      camera3d.right = (W + visibleWidth) / 2;
      camera3d.top = H;
      camera3d.bottom = 0;
      camera3d.updateProjectionMatrix();
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
        if (item.kind === "train") {
          const tw=w*1.42, th=h*1.65;
          ctx.fillStyle="#302943"; ctx.fillRect(-tw/2,-th,tw,th);
          ctx.fillStyle="#4e456a"; ctx.fillRect(-tw/2,-th,tw,th*.2);
          ctx.fillStyle="#b85e70"; ctx.fillRect(-tw/2,-th*.78,tw,th*.17);
          for(let wi=-1;wi<=1;wi++) {
            ctx.fillStyle="#b8c9d9"; ctx.fillRect(wi*tw*.29-tw*.085,-th*.65,tw*.17,th*.32);
            ctx.fillStyle="#e8c47a"; ctx.fillRect(wi*tw*.29-tw*.018,-th*.25,tw*.036,th*.05);
          }
          ctx.fillStyle="#171321"; ctx.fillRect(-tw*.36,-th*.08,tw*.72,th*.1);
          ctx.fillStyle="#c38a55"; ctx.fillRect(-tw*.44,-th*.02,tw*.88,th*.06);
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
        } else {
          ctx.fillStyle="#8d4d61"; ctx.fillRect(-w*.65,-h*.78,w*1.3,h*.78);
          ctx.fillStyle="#bd766e"; ctx.fillRect(-w*.65,-h*.78,w*1.3,h*.66);
          ctx.fillStyle="#e3aa8b"; ctx.beginPath(); ctx.moveTo(-w*.65,-h*.78); ctx.lineTo(-w*.45,-h); ctx.lineTo(w*.78,-h*.78); ctx.closePath(); ctx.fill();
          ctx.fillStyle="rgba(255,255,255,.25)"; ctx.strokeRect(-w*.52,-h*.68,w*1.04,h*.48);
        }
        ctx.restore();
      });
      [...g.items].filter((item) => item.kind === "coin").sort((a, b) => a.z - b.z).forEach((item) => {
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
      const px = laneX(player.lane, 1);
      const bounce = g.running && player.jump <= 0 && player.slide <= 0 ? Math.sin(time / 65) * 4 : 0;
      // Mama Veylora stays behind the child; her broom swings while she runs.
      const mamaY = (g.caught ? 1280 : 1420) + Math.sin(time / 95) * 4;
      const mamaDrawn = drawSprite(2, px - 12, mamaY, 110, 138, Math.floor(time / 130) % 4);
      if (!mamaDrawn) {
        ctx.font = "58px system-ui"; ctx.textAlign = "center"; ctx.fillText("👩🏻", px - 4, mamaY - 8);
      }
      ctx.save();
      ctx.translate(px + 48, mamaY - 65);
      ctx.rotate(g.caught ? (-1.35 + Math.sin(time / 70) * 1.2) : Math.sin(time / 105) * .32 - .45);
      ctx.strokeStyle = "#9b6a43"; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, 25); ctx.lineTo(40, -28); ctx.stroke();
      ctx.fillStyle = "#d9b77d";
      ctx.beginPath(); ctx.moveTo(40, -28); ctx.lineTo(55, -19); ctx.lineTo(48, -4); ctx.lineTo(34, -12); ctx.closePath(); ctx.fill();
      ctx.restore();

      const childY = (g.caught ? 1330 : 1300) - player.jump * 210;
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

      if (g.caught) {
        const pulse = 1 + Math.sin(time / 75) * .045;
        ctx.save();
        ctx.translate(W / 2, 1135);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = "rgba(19,10,30,.88)";
        ctx.strokeStyle = "#ffd48b";
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.roundRect(-230,-58,460,116,28); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fff2cf";
        ctx.font = "1000 42px system-ui";
        ctx.textAlign = "center";
        ctx.shadowColor = "#ff8b4b"; ctx.shadowBlur = 18;
        ctx.fillText("PULANG! MANDI!",0,14);
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
      setStatus("caught");
      tone(150, .24);
      window.clearTimeout(catchTimerRef.current);
      catchTimerRef.current = window.setTimeout(() => setStatus("over"), 1550);
    };

    const update = (dt) => {
      if (!g.running || g.paused) return;
      const p = g.player;
      g.distance += g.speed * dt;
      g.speed = Math.min(.235, g.speed + .0000015 * dt);
      p.lane += (p.targetLane - p.lane) * Math.min(1, dt * 0.24);
      p.jump = Math.max(0, p.jump - dt * .0015);
      p.slide = Math.max(0, p.slide - dt * .0017);
      g.spawn -= dt * 0.001;
      if (g.spawn <= 0) {
        // Pattern-based endless-runner generator: each row leaves at least one safe lane.
        const patterns = [
          [{ row: 0, blocks: [[-1,"train"],[0,"log"]] }, { row: .28, blocks: [[0,"barrier"],[1,"arch"]] }],
          [{ row: 0, blocks: [[0,"train"],[1,"log"]] }, { row: .3, blocks: [[-1,"arch"],[1,"barrier"]] }],
          [{ row: 0, blocks: [[-1,"log"],[1,"train"]] }, { row: .3, blocks: [[-1,"barrier"],[0,"arch"]] }],
          [{ row: 0, blocks: [[-1,"train"]] }, { row: .24, blocks: [[0,"log"],[1,"barrier"]] }],
          [{ row: 0, blocks: [[1,"train"]] }, { row: .26, blocks: [[-1,"arch"],[0,"log"]] }],
        ];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        pattern.forEach((row) => {
          row.blocks.forEach(([lane,kind]) => g.items.push({ lane, z: -row.row, kind }));
          const openLane = LANES.find((lane) => !row.blocks.some(([blocked]) => blocked === lane));
          if (openLane !== undefined) {
            for (let i=0;i<3;i++) g.items.push({ lane:openLane, z:-row.row-i*.075, kind:"coin" });
          }
        });
        // Leave enough distance for the complete pattern to pass before the next one.
        g.spawn = 6.2 + Math.random() * 1.4;
      }
      g.items.forEach((item) => { item.z += g.speed * dt * .001; });
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
          (item.kind === "log" && p.jump < .22) ||
          (item.kind === "barrier" && p.jump < .22) ||
          (item.kind === "arch" && p.slide < .18) ||
          (item.kind === "crate" && p.jump < .2) ||
          (item.kind === "train"); // trains must be avoided by changing lanes
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
      const activeMeshes = new Set();
      g.items.forEach((item) => {
        if (item.kind === "coin" || item.z < -0.08 || item.z > 1.15) return;
        let mesh = obstacleMeshes.get(item);
        if (!mesh) {
          mesh = makeObstacle(item.kind);
          scene3d.add(mesh);
          obstacleMeshes.set(item, mesh);
        }
        activeMeshes.add(item);
        const z = Math.max(0, item.z);
        const scale = 0.44 + z * 1.42;
        const screenX = laneX(item.lane, z);
        const screenY = 480 + z * z * 1010;
        mesh.position.set(screenX, H - screenY, 70 + z * 80);
        mesh.scale.setScalar(scale);
      });
      for (const [item, mesh] of obstacleMeshes) {
        if (!activeMeshes.has(item)) { scene3d.remove(mesh); obstacleMeshes.delete(item); }
      }
      renderer.render(scene3d, camera3d);
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
      window.clearTimeout(catchTimerRef.current);
      observer.disconnect();
      window.removeEventListener("keydown", key);
      gameRef.current = null;
      sheetRef.current = null;
      obstacleMeshes.forEach((mesh) => { scene3d.remove(mesh); mesh.traverse((child) => { if (child.geometry) child.geometry.dispose(); if (child.material) { if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose()); else child.material.dispose(); } }); });
      renderer.dispose();
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
      <canvas ref={threeCanvasRef} className="mamah-game__3d-world" aria-hidden="true" />
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
      {status === "caught" && <section className="mamah-catch-caption" aria-live="assertive"><strong>PULANG! MANDI!</strong></section>}\n      {status === "over" && <section className="mamah-overlay"><div className="mamah-dialog mamah-dialog--result"><span className="mamah-dialog__emoji">🧹</span><p className="mamah-dialog__eyebrow">MAMA BERHASIL MENANGKAP!</p><h2>KETANGKAP MAMAH!</h2><div className="mamah-result mamah-result--primary"><span>JARAK TEMPUH <strong>{distanceResult} m</strong></span><span>TOTAL KOIN <strong>🪙 {coins}</strong></span></div><div className="mamah-result"><span>SKOR AKHIR <strong>{String(score).padStart(6,"0")}</strong></span><span>BEST <strong>{String(best).padStart(6,"0")}</strong></span></div><button className="mamah-button mamah-button--primary" onClick={start}>↻ MAIN LAGI</button><button className="mamah-button mamah-button--quiet" onClick={() => setStatus("ready")}>⌂ MENU UTAMA</button></div></section>}
      {settingsOpen && <section className="mamah-overlay" onClick={() => setSettingsOpen(false)}><div className="mamah-dialog" onClick={e => e.stopPropagation()}><button className="mamah-dialog__close" onClick={() => setSettingsOpen(false)} aria-label="Tutup">×</button><p className="mamah-dialog__eyebrow">PENGATURAN</p><h2>SUARA GAME</h2><button className="mamah-button" onClick={() => setSoundOn(v => !v)}>{soundOn ? "♫ SUARA: ON" : "♪ SUARA: OFF"}</button><p className="mamah-dialog__note">Atur volume melalui tombol volume perangkat.</p></div></section>}
      {confirmExit && <section className="mamah-overlay" onClick={() => setConfirmExit(false)}><div className="mamah-dialog" role="alertdialog" aria-modal="true" aria-labelledby="mamah-exit-title" onClick={e => e.stopPropagation()}><span className="mamah-dialog__emoji">🚪</span><p className="mamah-dialog__eyebrow">KONFIRMASI</p><h2 id="mamah-exit-title">KELUAR DARI GAME?</h2><p className="mamah-dialog__note">Sesi permainan ini akan diakhiri dan kamu kembali ke Game Library.</p><button className="mamah-button" onClick={() => setConfirmExit(false)}>TETAP MAIN</button><button className="mamah-button mamah-button--danger" onClick={() => { window.location.href = "/mini-game"; }}>YA, KELUAR</button></div></section>}
    </main>
  );
}
