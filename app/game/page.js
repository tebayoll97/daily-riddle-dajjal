
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GamePage() {
  const router = useRouter();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const savedPlayer = localStorage.getItem("dailyRiddlePlayer");

    if (!savedPlayer) {
      router.replace("/register");
      return;
    }

    setPlayer(JSON.parse(savedPlayer));
  }, [router]);

  if (!player) {
    return (
      <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080711] text-white p-6">
      <div className="max-w-xl mx-auto pt-12">

        <p className="text-purple-400 text-xs tracking-[0.3em]">
          THE DAILY RIDDLE
        </p>

        <h1 className="text-3xl font-black mt-4">
          Welcome, {player.nickname}!
        </h1>

        <p className="text-gray-400 mt-2">
          Server {player.server}
        </p>

        <div className="mt-10 bg-[#151020] border border-purple-500/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-5">🔮</div>

          <h2 className="text-2xl font-bold">
            Today's Mystery
          </h2>

          <p className="text-gray-400 text-sm mt-4">
            Your daily challenge is coming soon.
          </p>

          <div className="mt-7 border border-purple-500/20 rounded-xl p-5">
            <p className="text-purple-300 font-bold">
              ONE DAY. ONE RIDDLE.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Can you become today's champion?
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          GLOBAL CHALLENGE • ALL SERVERS WELCOME
        </p>

      </div>
    </main>
  );
}
