
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../components/LanguageProvider";

const translations = {
  en: {
    tagline: "One world. One leaderboard. One champion.",
    loading: "Loading global ranking...",
    tryAgain: "TRY AGAIN",
    noChampions: "NO CHAMPIONS YET",
    noChampionsDesc: "Complete daily riddles and become the first global champion!",
    rank: "RANK",
    player: "PLAYER",
    points: "POINTS",
    solved: "SOLVED",
    topPlayers: "TOP PLAYERS",
    players: "PLAYERS",
    refresh: "↻ REFRESH RANKING",
    refreshing: "LOADING...",
    footer: "ONE DAY. ONE RIDDLE. ONE CHAMPION.",
    error: "Unable to load leaderboard.",
    genericError: "Something went wrong.",
  },
  id: {
    tagline: "Satu dunia. Satu peringkat. Satu juara.",
    loading: "Memuat peringkat global...",
    tryAgain: "COBA LAGI",
    noChampions: "BELUM ADA JUARA",
    noChampionsDesc: "Selesaikan teka-teki harian dan jadilah juara global pertama!",
    rank: "RANK",
    player: "PEMAIN",
    points: "POIN",
    solved: "SELESAI",
    topPlayers: "PEMAIN TERATAS",
    players: "PEMAIN",
    refresh: "↻ SEGARKAN PERINGKAT",
    refreshing: "MEMUAT...",
    footer: "SATU HARI. SATU TEKA-TEKI. SATU JUARA.",
    error: "Tidak dapat memuat peringkat.",
    genericError: "Terjadi kesalahan.",
  },
};

export default function LeaderboardPage() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRanking() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/leaderboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t.error);
      }

      setRanking(result.ranking || []);
    } catch (err) {
      console.error(err);
      setError(err.message || t.genericError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRanking();
  }, []);

  const topThree = ranking.slice(0, 3);

  const podiumOrder = [
    topThree[1],
    topThree[0],
    topThree[2],
  ];

  return (
    <main className="min-h-[70vh] bg-[#080711] text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">

        <div className="text-center">
          <p className="text-purple-400 text-xs tracking-[0.35em]">
            THE DAILY RIDDLE
          </p>

          <h1 className="text-3xl sm:text-4xl font-black mt-3">
            GLOBAL <span className="text-purple-400">RANKING</span>
          </h1>

          <p className="text-gray-500 text-sm mt-3">
            {t.tagline}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-purple-300">
            {t.loading}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400">{error}</p>

            <button
              onClick={loadRanking}
              className="mt-5 bg-purple-600 px-6 py-3 rounded-xl font-bold"
            >
              {t.tryAgain}
            </button>
          </div>
        ) : ranking.length === 0 ? (
          <div className="mt-12 border border-purple-500/20 bg-[#151020] rounded-2xl p-10 text-center">
            <div className="text-5xl">👑</div>

            <h2 className="text-xl font-bold mt-5">
              {t.noChampions}
            </h2>

            <p className="text-gray-400 text-sm mt-3">
              {t.noChampionsDesc}
            </p>
          </div>
        ) : (
          <>
            {/* TOP THREE */}
            <section className="mt-12">
              <div className="grid grid-cols-3 gap-2 sm:gap-5 items-end">

                {podiumOrder.map((player, index) => {
                  if (!player) return <div key={index} />;

                  const isFirst = player.rank === 1;

                  return (
                    <div
                      key={player.player_id}
                      className={`text-center rounded-2xl border p-3 sm:p-5 ${
                        isFirst
                          ? "bg-[#241b13] border-yellow-500/50 py-8"
                          : "bg-[#151020] border-purple-500/20"
                      }`}
                    >
                      <div className="text-3xl sm:text-4xl">
                        {player.rank === 1
                          ? "👑"
                          : player.rank === 2
                          ? "🥈"
                          : "🥉"}
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        {t.rank} #{player.rank}
                      </p>

                      <Link
                        href={`/player/${player.player_id}`}
                        className={`font-black mt-2 break-words block hover:underline ${
                          isFirst
                            ? "text-yellow-400 text-sm sm:text-lg"
                            : "text-white text-xs sm:text-base"
                        }`}
                      >
                        {player.nickname}
                      </Link>

                      <p className="text-gray-500 text-[10px] mt-1">
                        SERVER {player.server_number}
                      </p>

                      <p className={`font-black mt-4 ${
                        isFirst
                          ? "text-yellow-400 text-xl sm:text-2xl"
                          : "text-purple-300 text-base sm:text-xl"
                      }`}>
                        {Number(player.total_points).toLocaleString()}
                      </p>

                      <p className="text-gray-500 text-[9px] mt-1">
                        {t.points}
                      </p>
                    </div>
                  );
                })}

              </div>
            </section>

            {/* FULL RANKING */}
            <section className="mt-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black tracking-wider">
                  {t.topPlayers}
                </h2>

                <span className="text-xs text-purple-400">
                  {ranking.length} {t.players}
                </span>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-[#151020] overflow-hidden">

                <div className="grid grid-cols-[45px_1fr_85px] sm:grid-cols-[60px_1fr_100px_110px] gap-2 px-4 py-4 bg-purple-500/10 text-[10px] text-gray-400 font-bold tracking-wider">
                  <span>{t.rank}</span>
                  <span>{t.player}</span>
                  <span className="text-right sm:text-center">
                    {t.points}
                  </span>
                  <span className="hidden sm:block text-right">
                    {t.solved}
                  </span>
                </div>

                {ranking.map((player) => (
                  <div
                    key={player.player_id}
                    className="grid grid-cols-[45px_1fr_85px] sm:grid-cols-[60px_1fr_100px_110px] gap-2 items-center px-4 py-4 border-t border-purple-500/10"
                  >
                    <span className={`font-black ${
                      player.rank <= 3
                        ? "text-yellow-400"
                        : "text-gray-500"
                    }`}>
                      #{player.rank}
                    </span>

                    <div className="min-w-0">
                      <Link
                        href={`/player/${player.player_id}`}
                        className="font-bold text-sm truncate block hover:text-purple-400 transition"
                      >
                        {player.nickname}
                      </Link>

                      <p className="text-gray-500 text-[10px] mt-1">
                        Server {player.server_number}
                      </p>
                    </div>

                    <span className="text-right sm:text-center font-black text-purple-300 text-sm">
                      {Number(player.total_points).toLocaleString()}
                    </span>

                    <span className="hidden sm:block text-right text-gray-400 text-sm">
                      {player.riddles_solved}
                    </span>
                  </div>
                ))}

              </div>
            </section>
          </>
        )}

        <button
          onClick={loadRanking}
          disabled={loading}
          className="w-full mt-8 border border-purple-500/30 hover:bg-purple-500/10 disabled:opacity-50 rounded-xl py-4 text-sm font-bold tracking-wider transition"
        >
          {loading ? t.refreshing : t.refresh}
        </button>

        <p className="text-center text-gray-600 text-xs mt-8">
          {t.footer}
        </p>

      </div>
    </main>
  );
}
