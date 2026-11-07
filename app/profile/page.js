 
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "../components/LanguageProvider";
import GoogleAccountLink from "../components/GoogleAccountLink";
import AccountLogout from "../components/AccountLogout";
import GameCharacter from "@/lib/GameCharacter";

const translations = {
  en: {
    loading: "Loading profile...",
    title: "PLAYER PROFILE",
    nickname: "Nickname",
    server: "Server",
    joined: "Joined",
    edit: "EDIT PROFILE",
    retry: "TRY AGAIN",
    error: "Unable to load profile.",
    stats: "GAME UNIVERSE STATS",
    points: "Total Points",
    gamesPlayed: "Sessions",
    wins: "Wins",
    noStats: "No game statistics yet.",
    security: "ACCOUNT SECURITY",
    securityTitle: "Account Security",
    securityDescription: "Protect your account and game progress.",
    dateLocale: "en-US",
  },
  id: {
    loading: "Memuat profil...",
    title: "PROFIL PEMAIN",
    nickname: "Nama Pemain",
    server: "Server",
    joined: "Bergabung",
    edit: "EDIT PROFIL",
    retry: "COBA LAGI",
    error: "Tidak dapat memuat profil.",
    stats: "STATISTIK GAME UNIVERSE",
    points: "Total Poin",
    gamesPlayed: "Sesi Bermain",
    wins: "Kemenangan",
    noStats: "Belum ada statistik permainan.",
    security: "KEAMANAN AKUN",
    securityTitle: "Keamanan Akun",
    securityDescription: "Lindungi akun dan progres permainanmu.",
    dateLocale: "id-ID",
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState({ summary: {}, games: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData.session;

        if (!session) {
          router.replace("/register");
          return;
        }

        const { data, error: playerError } = await supabase
          .from("players")
          .select("id")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();

        if (playerError) throw playerError;

        if (!data) {
          router.replace("/register");
          return;
        }

        const profileResponse = await fetch(`/api/player/${data.id}`, {
          cache: "no-store",
        });

        const profileResult = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(profileResult.error || t.error);
        }

        if (!profileResult.player) {
          throw new Error(t.error);
        }

        if (active) {
          setPlayer(profileResult.player);
          setStats(profileResult.stats || { summary: {}, games: [] });
          setAvatarFailed(false);
        }
      } catch (err) {
        console.error(err);

        if (active) {
          setError(err.message || t.error);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router, t.error]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-purple-300">
        <GameCharacter character="veylora" expression="thinking" animation="float" size={68} />
        <p className="text-xs tracking-[0.2em] animate-pulse">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-400">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-purple-600 px-5 py-3 rounded-xl"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  if (!player) return null;

  const joinedDate = player.created_at
    ? new Date(player.created_at).toLocaleDateString(
        t.dateLocale,
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "-";

  return (
    <main className="min-h-[70vh] bg-[#080711] text-white px-5 py-10">
      <div className="max-w-xl mx-auto">

        <p className="text-purple-400 text-xs tracking-[0.3em]">
          DAJJAL & VEYLORA GAMING UNIVERSE
        </p>

        <h1 className="text-3xl font-black mt-3 ui-title">
          {t.title}
        </h1>

        {/* PLAYER PROFILE */}
        <div className="mt-8 rounded-2xl border border-purple-500/30 bg-[#151020] p-6 ui-card">

          <div className="w-28 h-28 rounded-full overflow-hidden bg-purple-600/20 border-2 border-purple-400/50 flex items-center justify-center mx-auto">
            {player.avatar_url && !avatarFailed ? (
              <img
                src={player.avatar_url}
                alt={player.nickname || "Player avatar"}
                onError={() => setAvatarFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-black text-purple-300">
                {(player.nickname || "?").charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-center mt-4 ui-section-title">
            {player.nickname}
          </h2>

          <p className="text-purple-300 text-sm text-center mt-1">
            Server {player.server_number}
          </p>

          <Link
            href="/profile/edit"
            className="block text-center mt-5 w-full rounded-xl border border-purple-400/40 bg-purple-500/10 hover:bg-purple-500/20 py-3 text-purple-200 font-bold tracking-wider transition"
          >
            ✎ {t.edit}
          </Link>

          <div className="border-t border-purple-500/20 mt-6 pt-5 space-y-4">

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">
                {t.nickname}
              </span>
              <span className="font-semibold">
                {player.nickname}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">
                {t.server}
              </span>
              <span className="font-semibold">
                {player.server_number}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">
                {t.joined}
              </span>
              <span className="font-semibold">
                {joinedDate}
              </span>
            </div>

          </div>
        </div>

        {/* UNIVERSAL GAME STATISTICS */}
        <section className="mt-8 rounded-2xl border border-purple-500/30 bg-[#151020] p-5 ui-card">
          <p className="text-purple-400 text-xs tracking-[0.25em]">{t.stats}</p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: t.points, value: stats.summary?.totalPoints || 0 },
              { label: t.gamesPlayed, value: stats.summary?.gamesPlayed || 0 },
              { label: t.wins, value: stats.summary?.wins || 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 text-center min-w-0">
                <p className="text-xl font-black text-white">{item.value.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1 break-words">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {stats.games?.length ? stats.games.map((game) => (
              <div key={game.gameId} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{game.gameName}</p>
                  <p className="text-xs text-gray-400">{game.gamesPlayed} {t.gamesPlayed.toLowerCase()} · {game.wins} {t.wins.toLowerCase()}</p>
                </div>
                <p className="font-black text-purple-300 whitespace-nowrap">{game.totalPoints.toLocaleString()} pts</p>
              </div>
            )) : <p className="text-sm text-gray-400 text-center py-3">{t.noStats}</p>}
          </div>
        </section>

        {/* ACCOUNT SECURITY */}
        <section
          id="account-security"
          className="mt-8 space-y-4 scroll-mt-32"
        >
          <div>
            <p className="text-purple-400 text-xs tracking-[0.25em]">
              {t.security}
            </p>

            <h2 className="text-xl font-bold mt-2 ui-section-title">
              {t.securityTitle}
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              {t.securityDescription}
            </p>
          </div>

          <GoogleAccountLink />

          <AccountLogout />
        </section>

        <Link
          href="/games"
          className="block text-center mt-8 w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-4 font-bold tracking-wider transition"
        >
          {language === "id" ? "JELAJAHI SEMUA GAME" : "EXPLORE ALL GAMES"}
        </Link>

      </div>
    </main>
  );
}
