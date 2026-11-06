
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import GameCharacter from "@/lib/GameCharacter";
import { useLanguage } from "../../components/LanguageProvider";

const translations = {
  en: {
    loading: "Loading player profile...",
    notFound: "PLAYER NOT FOUND",
    unavailable: "This player profile is unavailable.",
    back: "BACK TO RANKING",
    title: "PLAYER PROFILE",
    description: "Discover the riddle challenger's journey.",
    totalPoints: "TOTAL POINTS",
    solved: "RIDDLES SOLVED",
    nickname: "Nickname",
    server: "Server",
    joined: "Joined",
    lastCompleted: "Last Completed",
    backGlobal: "← BACK TO GLOBAL RANKING",
    error: "Unable to load player profile.",
    genericError: "Something went wrong.",
    dateLocale: "en-US",
  },
  id: {
    loading: "Memuat profil pemain...",
    notFound: "PEMAIN TIDAK DITEMUKAN",
    unavailable: "Profil pemain ini tidak tersedia.",
    back: "KEMBALI KE PERINGKAT",
    title: "PROFIL PEMAIN",
    description: "Lihat perjalanan pemain dalam tantangan teka-teki.",
    totalPoints: "TOTAL POIN",
    solved: "TEKA-TEKI SELESAI",
    nickname: "Nama Pemain",
    server: "Server",
    joined: "Bergabung",
    lastCompleted: "Terakhir Diselesaikan",
    backGlobal: "← KEMBALI KE PERINGKAT GLOBAL",
    error: "Tidak dapat memuat profil pemain.",
    genericError: "Terjadi kesalahan.",
    dateLocale: "id-ID",
  },
};

export default function PublicPlayerProfile() {
  const params = useParams();
  const playerId = params.id;

  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/player/${playerId}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || t.error);
        }

        if (active) {
          setPlayer(result.player);
          setStats(result.stats);
        }

      } catch (err) {
        console.error(err);
        if (active) setError(err.message || t.genericError);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (playerId) {
      loadProfile();
    }

    return () => {
      active = false;
    };
  }, [playerId, t.error, t.genericError]);

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#080711] text-white flex flex-col items-center justify-center gap-3 p-6">
        <GameCharacter
          character="veylora"
          expression="thinking"
          animation="float"
          size={82}
        />
        <div className="flex items-center gap-2 text-purple-300">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <p className="text-xs tracking-[0.2em] animate-pulse">{t.loading}</p>
        </div>
      </main>
    );
  }

  if (error || !player || !stats) {
    return (
      <main className="min-h-[70vh] bg-[#080711] text-white flex flex-col items-center justify-center px-5 text-center">

        <div className="text-5xl">👤</div>

        <h1 className="text-2xl font-black mt-5 ui-title">
          {t.notFound}
        </h1>

        <p className="text-gray-400 text-sm mt-3">
          {error || t.unavailable}
        </p>

        <Link
          href="/leaderboard"
          className="mt-6 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold"
        >
          {t.back}
        </Link>

      </main>
    );
  }

  const joinedDate = player.created_at
    ? new Date(player.created_at).toLocaleDateString(t.dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  const lastPlayed = stats.last_completed_at
    ? new Date(stats.last_completed_at).toLocaleDateString(t.dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <main className="min-h-[70vh] bg-[#080711] text-white px-5 py-10">
      <div className="max-w-xl mx-auto">

        <div className="text-center">

          <p className="text-purple-400 text-xs tracking-[0.3em]">
            THE DAILY RIDDLE
          </p>

          <h1 className="text-3xl font-black mt-3 ui-title">
            {t.title}
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            {t.description}
          </p>

        </div>

        <div className="mt-10 rounded-2xl border border-purple-500/30 bg-[#151020] p-6 ui-card">

          {/* Player Avatar */}
          <div className="w-28 h-28 rounded-full overflow-hidden bg-purple-600/20 border-2 border-purple-400/50 flex items-center justify-center mx-auto">

            {player.avatar_url ? (
              <img
                src={player.avatar_url}
                alt={player.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-black text-purple-300">
                {player.nickname.charAt(0).toUpperCase()}
              </span>
            )}

          </div>

          <h2 className="text-2xl font-black text-center mt-5 break-words ui-section-title">
            {player.nickname}
          </h2>

          <p className="text-purple-300 text-sm text-center mt-2">
            SERVER {player.server_number}
          </p>

          {/* Player Statistics */}
          <div className="grid grid-cols-2 gap-3 mt-8">

            <div className="bg-[#080711] rounded-xl p-5 text-center">
              <p className="text-2xl font-black text-yellow-400">
                {Number(stats.total_points).toLocaleString()}
              </p>

              <p className="text-gray-500 text-xs mt-2">
                {t.totalPoints}
              </p>
            </div>

            <div className="bg-[#080711] rounded-xl p-5 text-center">
              <p className="text-2xl font-black text-purple-300">
                {stats.riddles_solved}
              </p>

              <p className="text-gray-500 text-xs mt-2">
                {t.solved}
              </p>
            </div>

          </div>

          {/* Player Information */}
          <div className="border-t border-purple-500/20 mt-6 pt-5 space-y-4">

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">{t.nickname}</span>
              <span className="font-semibold text-right break-all">
                {player.nickname}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">{t.server}</span>
              <span className="font-semibold">
                {player.server_number}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">{t.joined}</span>
              <span className="font-semibold text-right">
                {joinedDate}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">{t.lastCompleted}</span>
              <span className="font-semibold text-right">
                {lastPlayed}
              </span>
            </div>

          </div>
        </div>

        <Link
          href="/leaderboard"
          className="block text-center mt-6 w-full rounded-xl border border-purple-500/30 hover:bg-purple-500/10 py-4 font-bold tracking-wider transition"
        >
          {t.backGlobal}
        </Link>

      </div>
    </main>
  );
}
