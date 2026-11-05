
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PublicPlayerProfile() {
  const params = useParams();
  const playerId = params.id;

  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
          throw new Error(
            result.error || "Unable to load player profile."
          );
        }

        setPlayer(result.player);
        setStats(result.stats);

      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    if (playerId) {
      loadProfile();
    }
  }, [playerId]);

  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-[#080711] text-purple-300">
        Loading player profile...
      </main>
    );
  }

  if (error || !player || !stats) {
    return (
      <main className="min-h-[70vh] bg-[#080711] text-white flex flex-col items-center justify-center px-5 text-center">
        <div className="text-5xl">👤</div>
        <h1 className="text-2xl font-black mt-5">
          PLAYER NOT FOUND
        </h1>
        <p className="text-gray-400 text-sm mt-3">
          {error || "This player profile is unavailable."}
        </p>
        <Link
          href="/leaderboard"
          className="mt-6 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold"
        >
          BACK TO RANKING
        </Link>
      </main>
    );
  }

  const joinedDate = player.created_at
    ? new Date(player.created_at).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  const lastPlayed = stats.last_completed_at
    ? new Date(stats.last_completed_at).toLocaleDateString("en-US", {
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
          <h1 className="text-3xl font-black mt-3">
            PLAYER PROFILE
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Discover the riddle challenger's journey.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-purple-500/30 bg-[#151020] p-6">

          <div className="w-24 h-24 rounded-full bg-purple-600/20 border border-purple-400/40 flex items-center justify-center mx-auto">
            <span className="text-4xl font-black text-purple-300">
              {player.nickname.charAt(0).toUpperCase()}
            </span>
          </div>

          <h2 className="text-2xl font-black text-center mt-5 break-words">
            {player.nickname}
          </h2>

          <p className="text-purple-300 text-sm text-center mt-2">
            SERVER {player.server_number}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-8">

            <div className="bg-[#080711] rounded-xl p-5 text-center">
              <p className="text-2xl font-black text-yellow-400">
                {Number(stats.total_points).toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                TOTAL POINTS
              </p>
            </div>

            <div className="bg-[#080711] rounded-xl p-5 text-center">
              <p className="text-2xl font-black text-purple-300">
                {stats.riddles_solved}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                RIDDLES SOLVED
              </p>
            </div>

          </div>

          <div className="border-t border-purple-500/20 mt-6 pt-5 space-y-4">

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">Nickname</span>
              <span className="font-semibold text-right break-all">
                {player.nickname}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">Server</span>
              <span className="font-semibold">
                {player.server_number}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">Joined</span>
              <span className="font-semibold text-right">
                {joinedDate}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-gray-400">Last Completed</span>
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
          ← BACK TO GLOBAL RANKING
        </Link>

      </div>
    </main>
  );
}
