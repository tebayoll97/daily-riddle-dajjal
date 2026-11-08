"use client";

import Link from "next/link";

const miniGames = [
  { href: "/mini-game/mamah-ngamuk", title: "MAMAH NGAMUK", description: "Anak Dajjal kabur! Hindari rintangan, kumpulkan koin, dan jangan sampai tertangkap Mamah.", tag: "2.5D ENDLESS RUNNER", symbol: "🧹", tone: "from-amber-500/20 to-rose-500/5" },
  { href: "/mini-game/run-jump", title: "RUN & JUMP", description: "Lari sejauh mungkin, lompat melewati rintangan, dan pecahkan rekor jarak.", tag: "ARCADE RUNNER", symbol: "🦖", tone: "from-violet-500/20 to-cyan-500/5" },
];

export default function MiniGameDirectoryPage() {
  return (
    <main className="min-h-screen bg-[#080711] px-4 py-8 text-white sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <Link href="/games" className="ui-interactive inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-purple-200">← GAME LIBRARY</Link>
        <header className="mb-8 mt-8 text-center">
          <p className="ui-eyebrow">DAJJAL FAMILY · GAMING UNIVERSE</p>
          <h1 className="ui-title">MINI <span className="text-purple-300">GAMES</span></h1>
          <p className="ui-subtitle mx-auto mt-3 max-w-xl">Pilih permainanmu. Setiap mini game memiliki dunia, tampilan, dan pengalaman bermain sendiri.</p>
        </header>
        <section className="grid gap-4 sm:grid-cols-2">
          {miniGames.map((game, index) => (
            <Link key={game.href} href={game.href} className={`ui-interactive group overflow-hidden rounded-3xl border border-purple-300/15 bg-gradient-to-br ${game.tone} p-5 transition hover:border-purple-300/40 sm:p-7`}>
              <div className="mb-8 flex items-start justify-between">
                <span className="text-5xl" aria-hidden="true">{game.symbol}</span>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[9px] font-black tracking-[.18em] text-purple-200">{game.tag}</span>
              </div>
              <p className="text-[10px] font-bold tracking-[.2em] text-purple-300">0{index + 1} · PLAYABLE</p>
              <h2 className="mt-2 text-2xl font-black tracking-wide">{game.title}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-300">{game.description}</p>
              <div className="mt-7 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-black tracking-wider group-hover:bg-purple-500">PLAY NOW <span aria-hidden="true">→</span></div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
