
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "./components/LanguageProvider";

const translations = {
  en: {
    present: "DAJJAL & VEYLORA PRESENT",
    tagline: "One day. One riddle. One champion.",
    ready: "Are You Ready?",
    mystery: "A new mystery awaits you every day.",
    wait: "PLEASE WAIT...",
    play: "PLAY TODAY'S RIDDLE",
    global: "GLOBAL CHALLENGE • ALL SERVERS WELCOME",
    error: "Something went wrong. Please try again.",
  },
  id: {
    present: "DAJJAL & VEYLORA MEMPERSEMBAHKAN",
    tagline: "Satu hari. Satu teka-teki. Satu juara.",
    ready: "Apakah Kamu Siap?",
    mystery: "Misteri baru menantimu setiap hari.",
    wait: "MOHON TUNGGU...",
    play: "MAINKAN TEKA-TEKI HARI INI",
    global: "TANTANGAN GLOBAL • SEMUA SERVER DIPERSILAKAN",
    error: "Terjadi kesalahan. Silakan coba lagi.",
  },
};

export default function Home() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [loading, setLoading] = useState(false);

  async function handlePlay() {
    setLoading(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const user = sessionData.session?.user;

      if (user) {
        const { data: player, error: playerError } =
          await supabase
            .from("players")
            .select("id")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (playerError) throw playerError;

        if (player) {
          router.push("/game");
        } else {
          router.push("/register");
        }
      } else {
        router.push("/register");
      }
    } catch (error) {
      console.error(error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080711] text-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-xl w-full">

        <p className="text-purple-400 tracking-[0.4em] text-xs mb-4">
          {t.present}
        </p>

        <h1 className="text-4xl md:text-6xl font-black tracking-wider">
          THE DAILY
          <span className="block text-purple-500">
            RIDDLE
          </span>
        </h1>

        <p className="text-gray-400 mt-5 text-sm">
          {t.tagline}
        </p>

        <div className="mt-10 border border-purple-500/30 rounded-2xl p-8 bg-[#151020]">

          <div className="text-6xl mb-5">🔮</div>

          <h2 className="text-xl font-bold">
            {t.ready}
          </h2>

          <p className="text-gray-400 text-sm mt-3">
            {t.mystery}
          </p>

          <button
            onClick={handlePlay}
            disabled={loading}
            className="mt-7 w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition rounded-xl py-4 font-bold tracking-wider"
          >
            {loading ? t.wait : t.play}
          </button>

        </div>

        <p className="text-gray-600 text-xs mt-8">
          {t.global}
        </p>

      </div>
    </main>
  );
}
