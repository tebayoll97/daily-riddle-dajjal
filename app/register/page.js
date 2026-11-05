
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "../components/LanguageProvider";

const translations = {
  en: {
    registration: "PLAYER REGISTRATION",
    title: "JOIN THE GAME",
    description: "Enter your identity to join the global challenge.",
    nickname: "Player Nickname",
    nicknamePlaceholder: "Enter your nickname",
    server: "Server Number",
    serverPlaceholder: "Example: 278",
    registering: "REGISTERING...",
    submit: "ENTER THE GAME",
    missing: "Please enter your nickname and server.",
    invalidServer: "Please enter a valid server number.",
    failed: "Registration failed. Please try again.",
  },
  id: {
    registration: "PENDAFTARAN PEMAIN",
    title: "GABUNG PERMAINAN",
    description: "Masukkan identitasmu untuk mengikuti tantangan global.",
    nickname: "Nama Pemain",
    nicknamePlaceholder: "Masukkan nickname kamu",
    server: "Nomor Server",
    serverPlaceholder: "Contoh: 278",
    registering: "MENDAFTARKAN...",
    submit: "MASUK KE PERMAINAN",
    missing: "Silakan masukkan nickname dan server.",
    invalidServer: "Silakan masukkan nomor server yang valid.",
    failed: "Pendaftaran gagal. Silakan coba lagi.",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

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
      setError(t.missing);
      return;
    }

    if (!/^\d+$/.test(cleanServer) || Number(cleanServer) <= 0) {
      setError(t.invalidServer);
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
      setError(err.message || t.failed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#151020] border border-purple-500/30 rounded-2xl p-8">

        <p className="text-purple-400 text-xs tracking-[0.3em] text-center mb-4">
          {t.registration}
        </p>

        <h1 className="text-3xl font-black text-center">
          {t.title}
        </h1>

        <p className="text-gray-400 text-sm text-center mt-3 mb-8">
          {t.description}
        </p>

        <form onSubmit={handleRegister} className="space-y-5">

          <div>
            <label className="text-sm text-gray-300">
              {t.nickname}
            </label>

            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.nicknamePlaceholder}
              maxLength={30}
              required
              className="w-full mt-2 p-4 rounded-xl bg-[#080711] border border-purple-500/30 outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">
              {t.server}
            </label>

            <input
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder={t.serverPlaceholder}
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
            {loading ? t.registering : t.submit}
          </button>

        </form>
      </div>
    </main>
  );
}
