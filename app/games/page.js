"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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
    mamah: "MAMAH NGAMUK",
    mamahDesc: "Escape angry Mamah Veylora, dodge traffic, collect coins, and build your personal record.",
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
    mamah: "MAMAH NGAMUK",
    mamahDesc: "Kabur dari Mamah Veylora, hindari kendaraan, kumpulkan koin, dan pecahkan rekor pribadimu.",
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
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [catalogGames, setCatalogGames] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

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

  async function handlePlayMamah() {
    if (loading) return;
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user || session.user.is_anonymous) {
        setShowGooglePrompt(true);
        return;
      }
      const context = await getPlayerContext();
      if (context.status === "ready" && context.accountType === "google") {
        router.push("/games/mamah-ngamuk?splash=1");
        return;
      }
      setShowGooglePrompt(true);
    } catch (error) {
      console.error("Mamah Ngamuk launch error:", error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLoginFromPrompt() {
    if (googleBusy) return;
    setGoogleBusy(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const redirectTo = `${window.location.origin}/login?next=${encodeURIComponent("/games/mamah-ngamuk?splash=1")}`;
      const options = { redirectTo, queryParams: { access_type: "offline", prompt: "select_account" } };
      if (session?.user?.is_anonymous) {
        const { error } = await supabase.auth.linkIdentity({ provider: "google", options });
        if (error) throw error;
        return;
      }
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options });
      if (error) throw error;
    } catch (error) {
      console.error("Google login from Game Library failed:", error);
      setGoogleBusy(false);
      setShowError(true);
    }
  }

  async function handlePlayDailyRiddle() {
    if (loading) return;
    setLoading(true);
    try {
      const context = await getPlayerContext();
      router.push(context.status === "ready" && context.accountType === "google" ? "/game" : "/login?next=%2Fgame");
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
    .filter((game) => game.slug !== "daily-riddle" && game.slug !== "mamah-ngamuk" && game.status === "coming_soon")
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
          <article className="relative mt-4 overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-[#281a25] via-[#171024] to-[#100d19] ui-card">
            <div className="relative flex flex-col items-stretch sm:flex-row sm:items-center">
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-amber-950/80 via-rose-950/60 to-purple-950/80 sm:h-64 sm:w-[42%]">
                <div className="absolute inset-0 flex items-center justify-center text-7xl">🧹</div>
                <div className="absolute bottom-4 left-5 rounded-full border border-amber-200/20 bg-black/40 px-3 py-1 text-[9px] font-bold tracking-[0.2em] text-amber-100">FULL SCREEN ACTION</div>
              </div>
              <div className="flex flex-1 flex-col items-start gap-4 p-6 sm:p-8">
                <div className="max-w-xl">
                  <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-amber-300">02 · ACCOUNT GAME</p>
                  <h2 className="text-2xl font-black sm:text-3xl ui-section-title">{t.mamah}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">{t.mamahDesc}</p>
                  <p className="mt-2 text-[10px] font-bold tracking-wider text-amber-200/80">GOOGLE LOGIN REQUIRED</p>
                </div>
                <button onClick={handlePlayMamah} disabled={loading} className="w-full shrink-0 rounded-xl bg-amber-600 px-7 py-4 text-sm font-black tracking-wider sm:w-auto">
                  {loading ? t.wait : t.play}
                </button>
              </div>
            </div>
          </article>

          <article className="relative mt-4 overflow-hidden rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-[#102536] via-[#111827] to-[#100d19] ui-card">
            <div className="relative flex flex-col items-stretch sm:flex-row sm:items-center">
              <div className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-950/80 via-emerald-950/50 to-purple-950/80 text-7xl sm:h-64 sm:w-[42%]" aria-hidden="true">🦖</div>
              <div className="flex flex-1 flex-col items-start gap-4 p-6 sm:p-8">
                <div className="max-w-xl">
                  <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-cyan-300">03 · ARCADE GAME</p>
                  <h2 className="text-2xl font-black sm:text-3xl ui-section-title">DAJJAL FAMILY JUMP</h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">{language === "id" ? "Lari sejauh mungkin, lompat melewati rintangan, dan pecahkan rekor jarakmu. Bisa dimainkan tanpa login." : "Run as far as you can, jump over obstacles, and beat your distance record. Play without signing in."}</p>
                  <p className="mt-2 text-[10px] font-bold tracking-wider text-cyan-200/80">PUBLIC ARCADE · NO LOGIN REQUIRED</p>
                </div>
                <Link href="/games/run-jump" className="w-full shrink-0 rounded-xl bg-cyan-700 px-7 py-4 text-center text-sm font-black tracking-wider transition hover:bg-cyan-600 sm:w-auto">{language === "id" ? "MAIN SEKARANG" : "PLAY NOW"}</Link>
              </div>
            </div>
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


      {showGooglePrompt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md" onClick={() => setShowGooglePrompt(false)}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="mamah-google-title" className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-b from-[#261a2b] to-[#100d19] p-6 text-center shadow-[0_25px_90px_rgba(0,0,0,.75)] ui-popup ui-card" onClick={(event) => event.stopPropagation()}>
            <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-400/10 text-3xl">🔐</div>
            <p className="relative text-[9px] font-black tracking-[.3em] text-amber-300">ACCOUNT REQUIRED</p>
            <h2 id="mamah-google-title" className="relative mt-2 text-xl font-black text-white ui-section-title">{language === "id" ? "LOGIN GOOGLE DIPERLUKAN" : "GOOGLE LOGIN REQUIRED"}</h2>
            <p className="relative mt-3 text-sm leading-relaxed text-gray-300">{language === "id" ? "MAMAH NGAMUK membutuhkan akun Google agar koin dan Best Distance kamu tersimpan dengan aman." : "MAMAH NGAMUK requires a Google account so your coins and Best Distance can be saved securely."}</p>
            <button type="button" onClick={handleGoogleLoginFromPrompt} disabled={googleBusy} className="relative mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-black text-gray-900 transition hover:bg-gray-100 disabled:opacity-60">
              <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.06 13.22l7.98 6.19C11.93 13.72 17.45 9.5 24 9.5z" transform="translate(0 4)"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 37.95 46.98 31.75 46.98 24.55z"/><path fill="#FBBC05" d="M10.04 28.59A14.4 14.4 0 0 1 9.27 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78l7.48-6.19z" transform="translate(0 4)"/><path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.93-5.8l-7.73-6c-2.14 1.45-4.87 2.3-8.2 2.3-6.55 0-12.07-4.22-14.04-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48z" transform="translate(0 -4)"/></svg>
              {googleBusy ? (language === "id" ? "MEMBUKA GOOGLE..." : "OPENING GOOGLE...") : (language === "id" ? "LOGIN DENGAN GOOGLE" : "SIGN IN WITH GOOGLE")}
            </button>
            <button type="button" onClick={() => setShowGooglePrompt(false)} disabled={googleBusy} className="relative mt-3 w-full rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold tracking-wider text-gray-300 transition hover:bg-white/10 disabled:opacity-50">{language === "id" ? "BATAL" : "CANCEL"}</button>
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
