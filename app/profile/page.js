 
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
    play: "PLAY TODAY'S RIDDLE",
    retry: "TRY AGAIN",
    error: "Unable to load profile.",
    security: "ACCOUNT SECURITY",
    securityTitle: "Account Security",
    securityDescription: "Protect your account and game progress.",
    totalPoints: "TOTAL POINTS",
    solved: "RIDDLES SOLVED",
    lastCompleted: "Last Completed",
    dateLocale: "en-US",
  },
  id: {
    loading: "Memuat profil...",
    title: "PROFIL PEMAIN",
    nickname: "Nama Pemain",
    server: "Server",
    joined: "Bergabung",
    edit: "EDIT PROFIL",
    play: "MAINKAN TEKA-TEKI HARI INI",
    retry: "COBA LAGI",
    error: "Tidak dapat memuat profil.",
    security: "KEAMANAN AKUN",
    securityTitle: "Keamanan Akun",
    securityDescription: "Lindungi akun dan progres permainanmu.",
    totalPoints: "TOTAL POIN",
    solved: "TEKA-TEKI SELESAI",
    lastCompleted: "Terakhir Diselesaikan",
    dateLocale: "id-ID",
  },
};

export default function ProfilePage() {
  const router = useRouter();
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
          setStats(profileResult.stats || {
            total_points: 0,
            riddles_solved: 0,
            last_completed_at: null,
          });
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

  const lastCompletedDate = stats?.last_completed_at
    ? new Date(stats.last_completed_at).toLocaleDateString(t.dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

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

          <h2 className="text-2xl font-bold text-center mt-4 ui-section-title">
            {player.nickname}
          </h2>

          <p className="text-purple-300 text-sm text-center mt-1">
            Server {player.server_number}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-xl bg-[#080711] border border-purple-500/10 p-4 text-center ui-card">
              <p className="text-2xl font-black text-yellow-400">
                {Number(stats?.total_points || 0).toLocaleString()}
              </p>
              <p className="text-gray-500 text-[10px] tracking-wider mt-2">
                {t.totalPoints}
              </p>
            </div>
            <div className="rounded-xl bg-[#080711] border border-purple-500/10 p-4 text-center ui-card">
              <p className="text-2xl font-black text-purple-300">
                {Number(stats?.riddles_solved || 0).toLocaleString()}
              </p>
              <p className="text-gray-500 text-[10px] tracking-wider mt-2">
                {t.solved}
              </p>
            </div>
          </div>

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

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">
                {t.lastCompleted}
              </span>
              <span className="font-semibold text-right">
                {lastCompletedDate}
              </span>
            </div>

          </div>
        </div>

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
          href="/game"
          className="block text-center mt-8 w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-4 font-bold tracking-wider transition"
        >
          {t.play}
        </Link>

      </div>
    </main>
  );
}
