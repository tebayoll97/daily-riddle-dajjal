
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [server, setServer] = useState("");

  function handleRegister(e) {
    e.preventDefault();

    if (!nickname.trim() || !server.trim()) {
      alert("Please enter your nickname and server.");
      return;
    }

    const player = {
      nickname: nickname.trim(),
      server: server.trim(),
    };

    localStorage.setItem("dailyRiddlePlayer", JSON.stringify(player));

    router.push("/");
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
              className="w-full mt-2 p-4 rounded-xl bg-[#080711] border border-purple-500/30 outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 rounded-xl py-4 font-bold tracking-wider"
          >
            ENTER THE GAME
          </button>
        </form>
      </div>
    </main>
  );
}
