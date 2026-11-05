
"use client";

import { useEffect, useState } from "react";
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
    checking: "Checking your account...",
    alreadyRegistered: "You already have a player profile.",
    continue: "CONTINUE TO PROFILE",
    adminBlocked: "Administrator accounts cannot register as players.",
    googleBlocked: "Your Google account is already connected. Please use your existing player profile.",
    accountError: "Unable to verify your account. Please try again.",
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
    checking: "Memeriksa akun...",
    alreadyRegistered: "Kamu sudah memiliki profil pemain.",
    continue: "LANJUT KE PROFIL",
    adminBlocked: "Akun administrator tidak dapat mendaftar sebagai pemain.",
    googleBlocked: "Akun Google kamu sudah terhubung. Silakan gunakan profil pemain yang sudah ada.",
    accountError: "Tidak dapat memeriksa akun. Silakan coba lagi.",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [nickname, setNickname] = useState("");
  const [server, setServer] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [existingProfile, setExistingProfile] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAccount() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          if (active) setChecking(false);
          return;
        }

        const user = session.user;

        // Check whether this session belongs to an administrator.
        const adminResponse = await fetch("/api/admin/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        if (adminResponse.ok) {
          if (active) {
            setBlocked(true);
            setError(t.adminBlocked);
            setChecking(false);
          }
          return;
        }

        if (adminResponse.status !== 403 &&
            adminResponse.status !== 401) {
          throw new Error(t.accountError);
        }

        // Check whether this account already has a player profile.
        const { data: player, error: playerError } = await supabase
          .from("players")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (playerError) throw playerError;

        if (player) {
          if (active) {
            setExistingProfile(true);
          }
        } else if (!user.is_anonymous) {
          // Do not create a second profile for a connected Google account.
          if (active) {
            setBlocked(true);
            setError(t.googleBlocked);
          }
        }

        if (active) setChecking(false);
      } catch (err) {
        console.error("Registration account check:", err);

        if (active) {
          setBlocked(true);
          setError(err.message || t.accountError);
          setChecking(false);
        }
      }
    }

    checkAccount();

    return () => {
      active = false;
    };
  }, [t.adminBlocked, t.accountError, t.googleBlocked]);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    const cleanNickname = nickname.trim();
    const cleanServer = server.trim();

    if (!cleanNickname || !cleanServer) {
      setError(t.missing);
      return;
    }

    if (
      !/^\d+$/.test(cleanServer) ||
      Number(cleanServer) <= 0
    ) {
      setError(t.invalidServer);
      return;
    }

    if (cleanNickname.length > 30) {
      setError(t.failed);
      return;
    }

    setLoading(true);

    try {
      let {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      let user = session?.user;

      if (user) {
        // Never allow an administrator to register as a player.
        const adminResponse = await fetch("/api/admin/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        if (adminResponse.ok) {
          throw new Error(t.adminBlocked);
        }

        if (
          adminResponse.status !== 401 &&
          adminResponse.status !== 403
        ) {
          throw new Error(t.accountError);
        }

        if (!user.is_anonymous) {
          throw new Error(t.googleBlocked);
        }

        // A Guest account must not overwrite an existing profile.
        const { data: existingPlayer, error: lookupError } =
          await supabase
            .from("players")
            .select("id")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (lookupError) throw lookupError;

        if (existingPlayer) {
          router.replace("/profile");
          return;
        }
      } else {
        const { data, error: authError } =
          await supabase.auth.signInAnonymously();

        if (authError) throw authError;

        user = data.user;
      }

      const { error: insertError } = await supabase
        .from("players")
        .insert({
          auth_user_id: user.id,
          nickname: cleanNickname,
          server_number: Number(cleanServer),
        });

      if (insertError) throw insertError;

      router.replace("/game");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || t.failed);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center p-6">
        <p className="text-purple-300">{t.checking}</p>
      </main>
    );
  }

  if (existingProfile) {
    return (
      <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#151020] border border-purple-500/30 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-black">
            {t.alreadyRegistered}
          </h1>

          <button
            onClick={() => router.replace("/profile")}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-500 rounded-xl py-4 font-bold"
          >
            {t.continue}
          </button>
        </div>
      </main>
    );
  }

  if (blocked) {
    return (
      <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#151020] border border-purple-500/30 rounded-2xl p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </main>
    );
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
