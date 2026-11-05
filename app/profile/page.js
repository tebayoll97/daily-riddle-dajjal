
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "../components/LanguageProvider";
import GoogleAccountLink from "../components/GoogleAccountLink";
import AccountLogout from "../components/AccountLogout";

const translations = {
  en: {
    loading: "Loading profile...",
    title: "PLAYER PROFILE",
    description: "Your identity in the Dajjal & Veylora Gaming Universe.",
    nickname: "Nickname",
    server: "Server",
    joined: "Joined",
    edit: "EDIT PROFILE",
    play: "PLAY TODAY'S RIDDLE",
    retry: "TRY AGAIN",
    error: "Unable to load profile.",
    dateLocale: "en-US",
  },
  id: {
    loading: "Memuat profil...",
    title: "PROFIL PEMAIN",
    description: "Identitasmu di Dajjal & Veylora Gaming Universe.",
    nickname: "Nama Pemain",
    server: "Server",
    joined: "Bergabung",
    edit: "EDIT PROFIL",
    play: "MAINKAN TEKA-TEKI HARI INI",
    retry: "COBA LAGI",
    error: "Tidak dapat memuat profil.",
    dateLocale: "id-ID",
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [player, setPlayer] = useState(null);
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
          .select("nickname, server_number, created_at, avatar_url")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();

        if (playerError) throw playerError;

        if (!data) {
          router.replace("/register");
          return;
        }

        if (active) {
          setPlayer(data);
        }
      } catch (err) {
        console.error(err);

        if (active) {
          setError(err.message || t.error);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router, t.error]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-purple-300">
        {t.loading}
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

        <h1 className="text-3xl font-black mt-3">
          {t.title}
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          {t.description}
        </p>

        {/* PLAYER PROFILE */}
        <div className="mt-8 rounded-2xl border border-purple-500/30 bg-[#151020] p-6">

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

          <h2 className="text-2xl font-bold text-center mt-4">
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

        {/* ACCOUNT SECURITY */}
        <section
          id="account-security"
          className="mt-8 space-y-4 scroll-mt-32"
        >
          <div>
            <p className="text-purple-400 text-xs tracking-[0.25em]">
              ACCOUNT MANAGEMENT
            </p>

            <h2 className="text-xl font-bold mt-2">
              Account Security
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Protect your identity and game progress.
            </p>
          </div>

          <GoogleAccountLink />

          <AccountLogout />
        </section>

        {/* PLAY BUTTON */}
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
