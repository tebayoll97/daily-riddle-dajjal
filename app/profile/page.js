
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData.session;

        if (!session) {
          router.replace("/register");
          return;
        }

        const { data, error: playerError } = await supabase
          .from("players")
          .select("nickname, server_number, created_at")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();

        if (playerError) throw playerError;

        if (!data) {
          router.replace("/register");
          return;
        }

        setPlayer(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-purple-300">
        Loading profile...
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
          TRY AGAIN
        </button>
      </div>
    );
  }

  if (!player) return null;

  const joinedDate = player.created_at
    ? new Date(player.created_at).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <main className="min-h-[70vh] bg-[#080711] text-white px-5 py-10">
      <div className="max-w-xl mx-auto">
        <p className="text-purple-400 text-xs tracking-[0.3em]">
          THE DAILY RIDDLE
        </p>

        <h1 className="text-3xl font-black mt-3">
          PLAYER PROFILE
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Your identity in the world of daily riddles.
        </p>

        <div className="mt-8 rounded-2xl border border-purple-500/30 bg-[#151020] p-6">
          <div className="w-20 h-20 rounded-full bg-purple-600/20 border border-purple-400/40 flex items-center justify-center mx-auto">
            <span className="text-3xl font-black text-purple-300">
              {player.nickname.charAt(0).toUpperCase()}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-center mt-4">
            {player.nickname}
          </h2>

          <p className="text-purple-300 text-sm text-center mt-1">
            Server {player.server_number}
          </p>

          <div className="border-t border-purple-500/20 mt-6 pt-5 space-y-4">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">Nickname</span>
              <span className="font-semibold">{player.nickname}</span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">Server</span>
              <span className="font-semibold">{player.server_number}</span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">Joined</span>
              <span className="font-semibold">{joinedDate}</span>
            </div>
          </div>
        </div>

        <Link
          href="/game"
          className="block text-center mt-6 w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-4 font-bold tracking-wider transition"
        >
          PLAY TODAY'S RIDDLE
        </Link>
      </div>
    </main>
  );
}
