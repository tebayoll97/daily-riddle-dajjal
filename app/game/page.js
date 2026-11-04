
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function GamePage() {
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlayer() {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const user = sessionData.session?.user;

        if (!user) {
          router.replace("/register");
          return;
        }

        const { data, error: playerError } = await supabase
          .from("players")
          .select("id, nickname, server_number")
          .eq("auth_user_id", user.id)
          .single();

        if (playerError) throw playerError;

        setPlayer(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlayer();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center">
        Loading player...
      </main>
    );
  }

  if (error || !player) {
    return (
      <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-400">
            Player Profile Not Found
          </h1>
          <p className="text-gray-400 mt-3 text-sm">
            {error || "Please register again."}
          </p>
          <button
            onClick={() => router.push("/register")}
            className="mt-6 bg-purple-600 px-6 py-3 rounded-xl"
          >
            REGISTER AGAIN
          </button>
        </div>
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
          Server {player.server_number}
        </p>

        <div className="mt-10 bg-[#151020] border border-purple-500/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-5">🔮</div>

          <h2 className="text-2xl font-bold">
            Today's Mystery
          </h2>

          <p className="text-gray-400 text-sm mt-4">
            Your daily challenge is coming soon.
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          GLOBAL CHALLENGE • ALL SERVERS WELCOME
        </p>

      </div>
    </main>
  );
}
