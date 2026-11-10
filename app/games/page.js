"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerContext } from "@/lib/playerAccount";
import { useLanguage } from "../components/LanguageProvider";

const translations = {
  en: {
    eyebrow: "THE GAME LIBRARY",
    title: "CHOOSE YOUR",
    accent: "ADVENTURE",
    description: "Discover different worlds, challenge your mind, and build your journey in one gaming universe.",
    available: "AVAILABLE NOW",
    daily: "THE DAILY RIDDLE",
    dailyDesc: "A fresh mystery. Test your knowledge, solve the clues, and compete for points.",
    play: "PLAY NOW",
    soon: "COMING SOON",
    rune: "RUNE PUZZLE",
    runeDesc: "Decode ancient symbols and uncover the secrets hidden in the runes.",
    memory: "MEMORY CHALLENGE",
    memoryDesc: "Train your memory, sharpen your focus, and beat your best time.",
    logic: "LOGIC BATTLE",
    logicDesc: "Face clever challenges and prove your strategic thinking.",
    wait: "PLEASE WAIT...",
    errorTitle: "SOMETHING WENT WRONG",
    error: "Unable to continue. Please try again.",
    close: "GOT IT",
  },
  id: {
    eyebrow: "PERPUSTAKAAN PERMAINAN",
    title: "PILIH",
    accent: "PETUALANGANMU",
    description: "Jelajahi dunia yang berbeda, tantang pikiranmu, dan bangun perjalananmu dalam satu universe gaming.",
    available: "SUDAH TERSEDIA",
    daily: "THE DAILY RIDDLE",
    dailyDesc: "Misteri baru setiap hari. Uji pengetahuan, pecahkan petunjuk, dan kumpulkan poin.",
    play: "MAIN SEKARANG",
    soon: "SEGERA HADIR",
    rune: "RUNE PUZZLE",
    runeDesc: "Pecahkan simbol kuno dan temukan rahasia yang tersembunyi di dalam rune.",
    memory: "MEMORY CHALLENGE",
    memoryDesc: "Latih ingatan, tingkatkan fokus, dan pecahkan rekor waktumu.",
    logic: "LOGIC BATTLE",
    logicDesc: "Hadapi tantangan cerdas dan buktikan kemampuan strategimu.",
    wait: "MOHON TUNGGU...",
    errorTitle: "TERJADI KESALAHAN",
    error: "Tidak dapat melanjutkan. Silakan coba lagi.",
    close: "MENGERTI",
  },
};

export default function GamesPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [catalogGames, setCatalogGames] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selectedMiniGame, setSelectedMiniGame] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadCatalog() {
      const { data, error } = await supabase
        .from("games")
        .select("id, slug, name, description, status, sort_order")
        .order("sort_order", { ascending: true });
      if (error) {
        console.error("Game catalog load error:", error);
        if (active) setCatalogLoading(false);
        return;
      }
      if (active) {
        setCatalogGames(data || []);
        setCatalogLoading(false);
      }
    }
    loadCatalog();
    return () => { active = false; };
  }, []);

  async function handlePlayDailyRiddle() {
    if (loading) return;
    setLoading(true);
    try {
      const context = await getPlayerContext();
      router.push(context.status === "ready" ? "/game" : "/register");
    } catch (error) {
      console.error("Daily Riddle launch error:", error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }

  const gameArtwork = {
    "rune-puzzle": { icon: "ᚱ", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85", alt: "Ancient glowing runic symbols" },
    "memory-challenge": { icon: "◈", image: "https://images.unsplash.com/photo-1606509036992-38f2048865f5?auto=format&fit=crop&w=900&q=85", alt: "Colorful puzzle pieces" },
    "logic-battle": { icon: "✧", image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=900&q=85", alt: "Strategy board game pieces" },
  };
  const games = catalogGames
    .filter((game) => game.slug !== "daily-riddle" && game.status !== "archived")
    .map((game) => ({
      ...game,
      name: game.slug === "rune-puzzle" ? t.rune : game.slug === "memory-challenge" ? t.memory : game.slug === "logic-battle" ? t.logic : game.name,
      description: game.slug === "rune-puzzle" ? t.runeDesc : game.slug === "memory-challenge" ? t.memoryDesc : game.slug === "logic-battle" ? t.logicDesc : (game.description || ""),
      ...(gameArtwork[game.slug] || { icon: "✦", image: "", alt: game.name }),
    }));

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080711] text-white px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[100px]" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-9 text-center">
          <p className="mb-3 text-[10px] font-bold tracking-[0.35em] text-purple-400">{t.eyebrow}</p>
          <h1 className="text-3xl font-black tracking-wide sm:text-5xl ui-title">
            {t.title} <span className="text-purple-400">{t.accent}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-400">{t.description}</p>
        </div>

        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <h2 className="text-[10px] font-bold tracking-[0.25em] text-emerald-300 ui-section-title">{t.available}</h2>
          </div>
          <article className="relative overflow-hidden rounded-3xl border border-purple-400/30 bg-gradient-to-br from-[#241638] via-[#171024] to-[#100d19] shadow-[0_15px_60px_rgba(88,28,135,0.13)] ui-card">
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-purple-500/15 blur-3xl" />
            <div className="relative flex flex-col items-stretch sm:flex-row sm:items-center">
              <div className="relative h-44 w-full overflow-hidden sm:h-64 sm:w-[42%]">
                <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=90" alt="Mysterious glowing puzzle scene" className="h-full w-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171024] via-transparent to-purple-950/10 sm:bg-gradient-to-r sm:from-transparent sm:to-[#171024]" />
                <div className="absolute bottom-4 left-5 rounded-full border border-purple-200/20 bg-black/40 px-3 py-1 text-[9px] font-bold tracking-[0.2em] text-purple-100 backdrop-blur">{t.daily}</div>
              </div>
              <div className="flex flex-1 flex-col items-start gap-4 p-6 sm:p-8">

              <div className="max-w-xl">
                <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-purple-300">01 · {t.available}</p>
                <h2 className="text-2xl font-black sm:text-3xl ui-section-title">{t.daily}</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">{t.dailyDesc}</p>
              </div>
              <button onClick={handlePlayDailyRiddle} disabled={loading} className="w-full shrink-0 rounded-xl bg-purple-600 px-7 py-4 text-sm font-black tracking-wider shadow-lg shadow-purple-900/30 transition hover:bg-purple-500 active:scale-[0.98] disabled:opacity-50 sm:w-auto">
                {loading ? t.wait : t.play}
              </button>
              </div>
            </div>
          </article>
        </section>

        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,.7)]" />
            <h2 className="text-[10px] font-bold tracking-[0.25em] text-purple-200 ui-section-title">ARCADE MINI GAME</h2>
          </div>
          <article className="flex flex-col items-start gap-4 rounded-2xl border border-purple-400/25 bg-gradient-to-r from-[#211532] to-[#11101e] p-5 sm:flex-row sm:items-center sm:justify-between ui-card">
            <div>
              <p className="mb-1 text-[9px] font-black tracking-[.2em] text-purple-300">NEW · PLAYABLE NOW</p>
              <h3 className="text-xl font-black text-white">RUN & JUMP</h3>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-400">Lari tanpa henti bersama karakter universe kita. Lompat, hindari rintangan, dan pecahkan rekor jarakmu.</p>
            </div>
            <button type="button" onClick={() => setSelectedMiniGame({ name: "RUN & JUMP", href: "/mini-game/run-jump", description: "Lari sejauh mungkin, lompat melewati rintangan, dan pecahkan rekor jarak." })} className="w-full shrink-0 rounded-xl bg-purple-600 px-6 py-3 text-xs font-black tracking-wider text-white transition hover:bg-purple-500 active:scale-[.98] sm:w-auto">PLAY MINI GAME →</button>
          </article>
          <article className="mt-3 flex flex-col items-start gap-4 rounded-2xl border border-amber-300/20 bg-gradient-to-r from-[#2a2119] to-[#14101d] p-5 sm:flex-row sm:items-center sm:justify-between ui-card">
            <div>
              <p className="mb-1 text-[9px] font-black tracking-[.2em] text-amber-300">NEW · 2.5D ENDLESS RUNNER</p>
              <h3 className="text-xl font-black text-white">MAMAH NGAMUK</h3>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-400">Anak Dajjal berlari menghindari rintangan dan mengumpulkan koin, sementara Mamah Veylora mengejar sambil membawa sapu!</p>
            </div>
            <button type="button" onClick={() => setSelectedMiniGame({ name: "MAMAH NGAMUK", href: "/mini-game/mamah-ngamuk", description: "Anak Dajjal berlari menghindari rintangan dan mengumpulkan koin, sementara Mamah Veylora mengejar sambil membawa sapu!" })} className="ui-interactive w-full shrink-0 rounded-xl bg-amber-600 px-6 py-3 text-xs font-black tracking-wider text-white transition hover:bg-amber-500 active:scale-[.98] sm:w-auto">PLAY MAMAH NGAMUK →</button>
          </article>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gray-500" />
            <h2 className="text-[10px] font-bold tracking-[0.25em] text-gray-400 ui-section-title">{t.soon}</h2>
          </div>
          {catalogLoading ? (
            <div className="grid gap-3 sm:grid-cols-3" aria-label={t.wait}>
              {[1, 2, 3].map((item) => <div key={item} className="h-56 rounded-2xl border border-purple-500/15 bg-purple-500/5 animate-pulse" />)}
            </div>
          ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {games.map((game, index) => (
              <article key={game.id || game.slug} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition duration-300 hover:border-purple-400/30 hover:bg-purple-500/[0.06] ui-card">
                <div className="relative h-36 overflow-hidden">
                  <img src={game.image} alt={game.alt} loading="lazy" className="h-full w-full object-cover opacity-75 transition duration-500 hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#100d19] via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-200/20 bg-black/45 text-2xl text-purple-100 backdrop-blur ui-card">{game.icon}</div>
                </div>
                <div className="p-5">
                <p className="mb-2 text-[9px] font-bold tracking-[0.2em] text-gray-500">0{game.sort_order || index + 2} · {t.soon}</p>
                <h3 className="text-base font-black">{game.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">{game.description}</p>
                </div>
              </article>
            ))}
          </div>
          )}
        </section>
      </div>

      {selectedMiniGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md" onClick={() => setSelectedMiniGame(null)}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="library-play-title" className="ui-popup ui-card w-full max-w-sm rounded-3xl border border-purple-300/25 bg-[#151020] p-6 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/10 text-3xl">🎮</div>
            <p className="ui-eyebrow">READY PLAYER?</p>
            <h2 id="library-play-title" className="text-xl font-black text-white">MAU MEMAINKAN</h2>
            <p className="mt-1 text-lg font-black text-purple-300">{selectedMiniGame.name}?</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">{selectedMiniGame.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setSelectedMiniGame(null)} className="ui-interactive rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-gray-300">NANTI</button>
              <button type="button" onClick={() => router.push(selectedMiniGame.href)} className="ui-interactive rounded-xl bg-purple-600 px-4 py-3 text-xs font-black text-white hover:bg-purple-500">YA, MAINKAN →</button>
            </div>
          </section>
        </div>
      )}
      {showError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm" onClick={() => setShowError(false)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="games-error-title" className="w-full max-w-sm rounded-2xl border border-purple-500/30 bg-[#151020] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.6)] ui-popup ui-gradient-frame ui-card" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-2xl text-red-400">!</div>
            <h2 id="games-error-title" className="text-center text-lg font-black ui-section-title">{t.errorTitle}</h2>
            <p className="mt-3 text-center text-sm text-gray-400">{t.error}</p>
            <button onClick={() => setShowError(false)} className="mt-6 w-full rounded-xl bg-purple-600 py-3 text-sm font-bold transition hover:bg-purple-500">{t.close}</button>
          </div>
        </div>
      )}
    </main>
  );
}
