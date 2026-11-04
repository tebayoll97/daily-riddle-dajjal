
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [server, setServer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    const cleanNickname = nickname.trim();
    const cleanServer = server.trim();

    if (!cleanNickname || !cleanServer) {
      setError("Please enter your nickname and server.");
      return;
    }

    if (!/^\d+$/.test(cleanServer) || Number(cleanServer) <= 0) {
      setError("Please enter a valid server number.");
      return;
    }

    setLoading(true);

    try {
      let { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      let user = sessionData.session?.user;

      if (!user) {
        const { data, error } =
          await supabase.auth.signInAnonymously();

        if (error) throw error;

        user = data.user;
      }

      const { data: existingPlayer, error: lookupError } =
        await supabase
          .from("players")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

      if (lookupError) throw lookupError;

      if (existingPlayer) {
        const { error: updateError } = await supabase
          .from("players")
          .update({
            nickname: cleanNickname,
            server_number: Number(cleanServer),
          })
          .eq("auth_user_id", user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("players")
          .insert({
            auth_user_id: user.id,
            nickname: cleanNickname,
            server_number: Number(cleanServer),
          });

        if (insertError) throw insertError;
      }

      router.push("/game");
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#151020] border border-purple-500/30 rounded-2xl p-8">

        <p className="text-purple-400 text-xs tracking-[0.3em] text-center mb-4">
          PLAYER REGISTRATION
        </p>

        <h1 className="text-3xl font-black text-center">
          JOIN THE GAME
        </h1>

        <p className="text-gray-400 text-sm text-center mt-3 mb-8">
          Enter your identity to join the global challenge.
        </p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-sm text-gray-300">
              Player Nickname
            </label>

            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              maxLength={30}
              required
              className="w-full mt-2 p-4 rounded-xl bg-[#080711] border border-purple-500/30 outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">
              Server Number
            </label>

            <input
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder="Example: 278"
              inputMode="numeric"
              maxLength={6}
              required
              className="w-full mt-2 p-4 rounded-xl bg-[#080711] border border-purple-500/30 outline-none focus:border-purple-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl py-4 font-bold tracking-wider"
          >
            {loading ? "REGISTERING..." : "ENTER THE GAME"}
          </button>
        </form>
      </div>
    </main>
  );
}
