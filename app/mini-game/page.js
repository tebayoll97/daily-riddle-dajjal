"use client";

import Link from "next/link";
import { useState } from "react";
import "./mini-game-master.css";

const miniGames = [
  { href: "/mini-game/run-jump", title: "DAJJAL FAMILY JUMP", description: "Lari sejauh mungkin, lompat melewati rintangan, dan pecahkan rekor jarak.", tag: "DAJJAL FAMILY ARCADE", symbol: "🦖", tone: "from-violet-500/20 to-cyan-500/5" },
];

export default function MiniGameDirectoryPage() {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <main className="mg-page min-h-screen bg-[#080711] px-4 py-8 text-white sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <Link href="/games" className="ui-interactive inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-purple-200">← GAME LIBRARY</Link>
        <header className="mb-8 mt-8 text-center">
          <p className="ui-eyebrow">DAJJAL FAMILY · GAMING UNIVERSE</p>
          <h1 className="ui-title">MINI <span className="text-purple-300">GAMES</span></h1>
          <p className="ui-subtitle mx-auto mt-3 max-w-xl">Pilih permainanmu. Setiap mini game memiliki dunia, tampilan, dan pengalaman bermain sendiri.</p>
        </header>
        <section className="grid gap-4 sm:grid-cols-2">
          {miniGames.map((game, index) => (
            <button key={game.href} type="button" onClick={() => setSelectedGame(game)} className={`ui-interactive group w-full text-left overflow-hidden rounded-3xl border border-purple-300/15 bg-gradient-to-br ${game.tone} p-5 transition hover:border-purple-300/40 sm:p-7`}>
              <div className="mb-8 flex items-start justify-between">
                <span className="text-5xl" aria-hidden="true">{game.symbol}</span>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[9px] font-black tracking-[.18em] text-purple-200">{game.tag}</span>
              </div>
              <p className="text-[10px] font-bold tracking-[.2em] text-purple-300">0{index + 1} · PLAYABLE</p>
              <h2 className="mt-2 text-2xl font-black tracking-wide">{game.title}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-300">{game.description}</p>
              <div className="mt-7 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-black tracking-wider group-hover:bg-purple-500">PLAY NOW <span aria-hidden="true">→</span></div>
            </button>
          ))}
        </section>
      </div>
      {selectedGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md" onClick={() => setSelectedGame(null)}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="mini-game-confirm-title" className="ui-popup ui-card w-full max-w-sm rounded-3xl border border-purple-300/25 bg-[#151020] p-6 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 text-4xl">{selectedGame.symbol}</div>
            <p className="ui-eyebrow">READY PLAYER?</p>
            <h2 id="mini-game-confirm-title" className="text-xl font-black tracking-wide text-white">MAU MEMAINKAN</h2>
            <p className="mt-1 text-lg font-black text-purple-300">{selectedGame.title}?</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">{selectedGame.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setSelectedGame(null)} className="ui-interactive rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-gray-300">NANTI</button>
              <Link href={selectedGame.href} className="ui-interactive rounded-xl bg-purple-600 px-4 py-3 text-xs font-black text-white hover:bg-purple-500">YA, MAINKAN →</Link>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
