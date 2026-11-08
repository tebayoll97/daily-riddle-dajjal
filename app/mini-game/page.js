"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const W = 900, H = 320, GROUND = 258;

export default function MiniGamePage() {
  const canvasRef = useRef(null), gameRef = useRef(null), rafRef = useRef(0), spriteRef = useRef(null);
  const soundRef = useRef(true), audioRef = useRef(null);
  const [status, setStatus] = useState("ready"), [score, setScore] = useState(0), [best, setBest] = useState(0), [soundOn, setSoundOn] = useState(true);

  const tone = useCallback((freq, duration = .08) => {
    if (!soundRef.current) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ac = audioRef.current || new AC(); audioRef.current = ac;
      if (ac.state === "suspended") ac.resume();
      const osc = ac.createOscillator(), gain = ac.createGain();
      osc.type = "triangle"; osc.frequency.value = freq;
      gain.gain.setValueAtTime(.045, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ac.currentTime + duration);
      osc.connect(gain); gain.connect(ac.destination); osc.start(); osc.stop(ac.currentTime + duration);
    } catch {}
  }, []);

  const start = useCallback(() => {
    const g = gameRef.current; if (!g) return;
    Object.assign(g, { running: true, over: false, speed: 6, distance: 0, spawn: 72, last: 0, lastScore: -1 });
    Object.assign(g.player, { y: GROUND - 58, vy: 0, jumping: false });
    g.obstacles = []; g.clouds = [{x:180,y:65},{x:520,y:105},{x:790,y:48}];
    setScore(0); setStatus("playing"); tone(650);
  }, [tone]);

  const jump = useCallback(() => {
    const g = gameRef.current; if (!g) return;
    if (!g.running) { if (!g.over) start(); return; }
    if (!g.player.jumping) { g.player.vy = -13.8; g.player.jumping = true; tone(500); }
  }, [start, tone]);

  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const g = gameRef.current = { running:false, over:false, speed:6, distance:0, spawn:72, last:0, lastScore:-1,
      player:{x:105,y:GROUND-58,vy:0,jumping:false}, obstacles:[], clouds:[{x:180,y:65},{x:520,y:105},{x:790,y:48}] };
    const sprite = new Image(); sprite.src = "/universe-characters.png"; sprite.onload = () => { spriteRef.current = sprite; };
    const resize = () => {
      const rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width*dpr));
      canvas.height = Math.floor(rect.width*H/W*dpr);
      ctx.setTransform(canvas.width/W,0,0,canvas.width/W,0,0);
    };
    const draw = (time) => {
      const sky = ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,"#17142d"); sky.addColorStop(1,"#0b1020");
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="rgba(255,255,255,.5)";
      for(let i=0;i<28;i++) ctx.fillRect((i*137+23)%W,(i*47+17)%175,2,2);
      g.clouds.forEach(c=>{ctx.fillStyle="rgba(191,180,230,.12)";ctx.beginPath();ctx.arc(c.x,c.y,17,0,Math.PI*2);ctx.arc(c.x+20,c.y-7,22,0,Math.PI*2);ctx.arc(c.x+43,c.y,16,0,Math.PI*2);ctx.fill();});
      ctx.fillStyle="#17142b";ctx.fillRect(0,GROUND,W,H-GROUND);
      ctx.strokeStyle="rgba(167,139,250,.65)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,GROUND);ctx.lineTo(W,GROUND);ctx.stroke();
      ctx.strokeStyle="rgba(167,139,250,.2)";ctx.lineWidth=1;
      for(let x=-((g.distance*1.4)%48);x<W;x+=48){ctx.beginPath();ctx.moveTo(x,GROUND+19);ctx.lineTo(x+22,GROUND+19);ctx.stroke();}
      const p=g.player, bob=g.running&&!p.jumping?Math.sin(time/75)*2:0;
      if(spriteRef.current?.complete && spriteRef.current.naturalWidth){
        const sw=spriteRef.current.naturalWidth/4, sh=spriteRef.current.naturalHeight/6;
        ctx.drawImage(spriteRef.current,0,0,sw,sh,p.x-7,p.y+bob-5,62,62);
      } else {ctx.font="54px system-ui";ctx.textAlign="center";ctx.fillText("🦖",p.x+24,p.y+50+bob);}
      g.obstacles.forEach(o=>{ctx.font=o.type==="rock"?"34px system-ui":"38px system-ui";ctx.textAlign="center";ctx.fillText(o.type==="rock"?"🪨":"🌵",o.x+o.width/2,GROUND-4);});
      if(!g.running){ctx.fillStyle=g.over?"rgba(5,4,12,.58)":"rgba(6,5,15,.22)";ctx.fillRect(0,0,W,H);}
    };
    const tick = time => {
      if(g.running){
        const dt=g.last?Math.min((time-g.last)/16.67,2):1;g.last=time;
        g.distance+=g.speed*dt;g.speed=Math.min(11.5,g.speed+.0018*dt);
        g.player.vy+=.72*dt;g.player.y+=g.player.vy*dt;
        if(g.player.y>=GROUND-58){g.player.y=GROUND-58;g.player.vy=0;g.player.jumping=false;}
        g.spawn-=dt;
        if(g.spawn<=0){const type=Math.random()>.72?"rock":"cactus";g.obstacles.push({x:W+10,width:type==="rock"?34:30,type});g.spawn=62+Math.random()*54-g.speed*2;}
        g.obstacles.forEach(o=>o.x-=g.speed*dt);g.obstacles=g.obstacles.filter(o=>o.x>-60);
        g.clouds.forEach(c=>{c.x-=g.speed*.16*dt;if(c.x<-70)c.x=W+40;});
        const p=g.player, box={l:p.x+9,r:p.x+40,t:p.y+12,b:p.y+54};
        const hit=g.obstacles.some(o=>box.r>o.x+5&&box.l<o.x+o.width-4&&box.b>GROUND-40&&box.t<GROUND);
        const points=Math.floor(g.distance/8);
        if(points%5===0&&points!==g.lastScore){g.lastScore=points;setScore(points);}
        if(hit){g.running=false;g.over=true;setScore(points);setBest(v=>Math.max(v,points));setStatus("over");tone(140,.24);}
      }
      draw(time);rafRef.current=requestAnimationFrame(tick);
    };
    resize();const observer=new ResizeObserver(resize);observer.observe(canvas);
    rafRef.current=requestAnimationFrame(tick);
    const key=e=>{if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();jump();}};
    window.addEventListener("keydown",key);
    return()=>{cancelAnimationFrame(rafRef.current);observer.disconnect();window.removeEventListener("keydown",key);gameRef.current=null;spriteRef.current=null;};
  },[jump,tone]);

  return <main className="min-h-screen bg-[#080711] px-4 py-7 text-white sm:py-10">
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/games" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-purple-200">← GAME LIBRARY</Link>
        <button onClick={()=>setSoundOn(v=>!v)} aria-pressed={soundOn} className="rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-100">{soundOn?"♫ SOUND ON":"♪ SOUND OFF"}</button>
      </div>
      <header className="text-center"><p className="ui-eyebrow">DAJJAL FAMILY · ARCADE</p><h1 className="ui-title text-center">RUN & <span className="text-purple-300">JUMP</span></h1><p className="ui-subtitle mx-auto text-center">Lari sejauh mungkin. Hindari rintangan. Jangan sampai tertangkap!</p></header>
      <section className="overflow-hidden rounded-3xl border border-purple-400/20 bg-[#100d1d] p-3 shadow-[0_20px_70px_rgba(76,29,149,.16)] sm:p-5">
        <div className="mb-3 flex items-center justify-between px-1">
          <div><p className="text-[9px] font-black tracking-[.22em] text-purple-300">DISTANCE</p><p className="font-mono text-2xl font-black tabular-nums">{String(score).padStart(5,"0")}</p></div>
          <div className="text-right"><p className="text-[9px] font-black tracking-[.22em] text-gray-500">BEST</p><p className="font-mono text-lg font-bold tabular-nums text-gray-300">{String(best).padStart(5,"0")}</p></div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-purple-300/15 bg-[#0c0a17]">
          <canvas ref={canvasRef} className="block aspect-[900/320] w-full touch-none" aria-label="Permainan lari dan melompat. Ketuk layar atau tekan Space untuk melompat." onPointerDown={jump}/>
          {status!=="playing"&&<div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080711]/35 px-4 text-center backdrop-blur-[2px]">
            <div className="mb-2 text-4xl">{status==="over"?"💥":"🏃"}</div><p className="text-lg font-black tracking-wide">{status==="over"?"GAME OVER":"READY TO RUN?"}</p>
            <p className="mt-1 text-xs text-gray-300">{status==="over"?"Jarak kamu: "+score+" poin":"Tap tombol di bawah untuk mulai"}</p>
            <button onClick={start} className="mt-4 rounded-xl bg-purple-600 px-7 py-3 text-xs font-black tracking-wider shadow-lg shadow-purple-950/40"> {status==="over"?"PLAY AGAIN":"START GAME"} </button>
          </div>}
        </div>
        <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-center text-[11px] text-gray-500">TAP layar untuk melompat · SPACE / ↑ di desktop</p>
          <button onClick={jump} disabled={status==="over"} className="w-full rounded-xl border border-purple-400/30 bg-purple-500/10 px-6 py-3 text-sm font-black text-purple-100 sm:w-auto disabled:opacity-40">JUMP ↑</button>
        </div>
      </section>
      <p className="text-center text-[10px] tracking-wider text-gray-600">DAJJAL FAMILY · GAMING UNIVERSE</p>
    </div>
  </main>;
}
