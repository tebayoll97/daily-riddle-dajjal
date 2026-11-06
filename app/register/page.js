
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "../components/LanguageProvider";
import GameCharacter from "@/lib/GameCharacter";

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
    submit: "CREATE PLAYER PROFILE",
    missing: "Please enter your nickname and server.",
    invalidServer: "Please enter a valid server number.",
    failed: "Registration failed. Please try again.",
    checking: "Checking your account...",
    adminBlocked: "Administrator accounts cannot register as players.",
    accountError: "Unable to verify your account. Please try again.",
    googleLogin: "CONTINUE WITH GOOGLE",
    googleLoading: "CONNECTING TO GOOGLE...",
    googleError: "Unable to sign in with Google. Please try again.",
    or: "OR",
    guestTitle: "PLAY AS GUEST",
    googleWelcome: "GOOGLE ACCOUNT VERIFIED",
    googleQuestion:
      "This Google account does not have a player profile yet. Would you like to create one?",
    yes: "YES, CREATE PROFILE",
    no: "NO, NOT NOW",
    googleProfileTitle: "COMPLETE YOUR PLAYER PROFILE",
    back: "BACK",
    duplicate: "A player profile already exists. Redirecting to your profile...",
    googleOnly:
      "Please use a Google account to create this player profile.",
    activeSession:
      "You already have an active account session. Please use that account or sign out first.",
    successTitle: "PLAYER PROFILE CREATED!",
    successDescription: "Your identity is ready. Entering the Gaming Universe...",
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
    submit: "BUAT PROFIL PEMAIN",
    missing: "Silakan masukkan nickname dan server.",
    invalidServer: "Silakan masukkan nomor server yang valid.",
    failed: "Pendaftaran gagal. Silakan coba lagi.",
    checking: "Memeriksa akun...",
    adminBlocked: "Akun administrator tidak dapat mendaftar sebagai pemain.",
    accountError: "Tidak dapat memeriksa akun. Silakan coba lagi.",
    googleLogin: "LANJUTKAN DENGAN GOOGLE",
    googleLoading: "MENGHUBUNGKAN KE GOOGLE...",
    googleError: "Tidak dapat login dengan Google. Silakan coba lagi.",
    or: "ATAU",
    guestTitle: "BERMAIN SEBAGAI TAMU",
    googleWelcome: "AKUN GOOGLE BERHASIL DIVERIFIKASI",
    googleQuestion:
      "Akun Google ini belum memiliki profil pemain. Apakah kamu ingin membuatnya?",
    yes: "YA, BUAT PROFIL",
    no: "TIDAK, NANTI SAJA",
    googleProfileTitle: "LENGKAPI PROFIL PEMAIN",
    back: "KEMBALI",
    duplicate: "Profil pemain sudah tersedia. Mengarahkan ke profil...",
    googleOnly:
      "Gunakan akun Google untuk membuat profil pemain ini.",
    activeSession:
      "Kamu masih memiliki sesi akun aktif. Silakan gunakan akun tersebut atau logout terlebih dahulu.",
    successTitle: "PROFIL PEMAIN BERHASIL DIBUAT!",
    successDescription: "Identitasmu sudah siap. Memasuki Gaming Universe...",
  },
};

function isGoogleAccount(user) {
  const identities = user?.identities || [];
  const providers = user?.app_metadata?.providers || [];

  return (
    user?.app_metadata?.provider === "google" ||
    providers.includes("google") ||
    identities.some((identity) => identity.provider === "google")
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [nickname, setNickname] = useState("");
  const [server, setServer] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [canGoogleLogin, setCanGoogleLogin] = useState(false);
  const [googleNeedsProfile, setGoogleNeedsProfile] = useState(false);
  const [showGoogleForm, setShowGoogleForm] = useState(false);

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
          if (active) {
            setCanGoogleLogin(true);
            setChecking(false);
          }
          return;
        }

        const user = session.user;

        // Administrator accounts cannot register as players.
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

        if (
          adminResponse.status !== 401 &&
          adminResponse.status !== 403
        ) {
          throw new Error(t.accountError);
        }

        // Find an existing profile using the exact Auth user ID.
        const { data: player, error: playerError } =
          await supabase
            .from("players")
            .select("id")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (playerError) throw playerError;

        if (player) {
          // Existing player: go directly to their profile.
          if (active) {
            router.replace("/profile");
          }
          return;
        }

        if (user.is_anonymous) {
          // New Guest account: show the Guest registration form.
          if (active) setChecking(false);
          return;
        }

        if (isGoogleAccount(user)) {
          // New Google account without a player profile.
          if (active) {
            setGoogleNeedsProfile(true);
            setChecking(false);
          }
          return;
        }

        // Other authenticated accounts are not allowed here.
        if (active) {
          setBlocked(true);
          setError(t.accountError);
          setChecking(false);
        }
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
  }, [router, t.adminBlocked, t.accountError]);

  async function handleGoogleLogin() {
    if (googleLoading) return;

    setGoogleLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      // Never replace an active Guest or Player session.
      if (session) {
        throw new Error(t.activeSession);
      }

      const { error: oauthError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/profile`,
            queryParams: {
              access_type: "offline",
              prompt: "select_account",
            },
          },
        });

      if (oauthError) throw oauthError;
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || t.googleError);
      setGoogleLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    if (loading) return;

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
        // Check administrator identity first.
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

        if (!user.is_anonymous && !isGoogleAccount(user)) {
          throw new Error(t.googleOnly);
        }

        // Check again before inserting to prevent duplicates.
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
        // Create a Guest identity only when no session exists.
        const { data, error: authError } =
          await supabase.auth.signInAnonymously();

        if (authError) throw authError;

        user = data.user;
      }

      if (!user) {
        throw new Error(t.accountError);
      }

      const { error: insertError } = await supabase
        .from("players")
        .insert({
          auth_user_id: user.id,
          nickname: cleanNickname,
          server_number: Number(cleanServer),
        });

      if (insertError) {
        // Handle a duplicate created by another request.
        const { data: duplicatePlayer } = await supabase
          .from("players")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (duplicatePlayer) {
          router.replace("/profile");
          return;
        }

        throw insertError;
      }

      setSuccessOpen(true);
      window.setTimeout(() => router.replace("/game"), 1700);
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
        <div className="flex flex-col items-center gap-2">
          <GameCharacter character="dajjal" expression="thinking" animation="float" size={72} />
          <p className="text-xs tracking-[0.2em] text-purple-300 animate-pulse">{t.checking}</p>
        </div>
      </main>
    );
  }

  if (blocked) {
    return (
      <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#151020] border border-purple-500/30 rounded-2xl p-8 text-center ui-card">
          <p className="text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080711] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#151020] border border-purple-500/30 rounded-2xl p-8 ui-card">

        <p className="text-purple-400 text-xs tracking-[0.3em] text-center mb-4">
          {t.registration}
        </p>

        <h1 className="text-3xl font-black text-center ui-title">
          {t.title}
        </h1>

        <p className="text-gray-400 text-sm text-center mt-3 mb-8">
          {t.description}
        </p>

        {/* NEW GOOGLE ACCOUNT CONFIRMATION */}
        {googleNeedsProfile && !showGoogleForm && (
          <div className="space-y-5">
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 ui-card">
              <p className="font-bold text-green-400">
                ✓ {t.googleWelcome}
              </p>

              <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                {t.googleQuestion}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowGoogleForm(true);
                setError("");
              }}
              className="w-full bg-purple-600 hover:bg-purple-500 rounded-xl py-4 font-bold"
            >
              {t.yes}
            </button>

            <button
              type="button"
              onClick={() => router.replace("/")}
              className="w-full bg-white/10 hover:bg-white/20 rounded-xl py-4 font-bold"
            >
              {t.no}
            </button>
          </div>
        )}

        {/* GOOGLE LOGIN */}
        {!googleNeedsProfile && canGoogleLogin && (
          <>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-200 disabled:opacity-50 rounded-xl py-4 font-bold transition"
            >
              <svg
                viewBox="0 0 48 48"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.06 13.22l7.98 6.19C11.93 13.72 17.45 9.5 24 9.5z"
                  transform="translate(0 4)"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 37.95 46.98 31.75 46.98 24.55z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.04 28.59A14.4 14.4 0 0 1 9.27 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78l7.48-6.19z"
                  transform="translate(0 4)"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.47 0 11.9-2.13 15.93-5.8l-7.73-6c-2.14 1.45-4.87 2.3-8.2 2.3-6.55 0-12.07-4.22-14.04-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  transform="translate(0 -4)"
                />
              </svg>

              {googleLoading ? t.googleLoading : t.googleLogin}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-gray-500">{t.or}</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          </>
        )}

        {/* GUEST OR GOOGLE PROFILE FORM */}
        {(!googleNeedsProfile || showGoogleForm) && (
          <>
            <h2 className="text-center text-sm font-bold text-purple-300 mb-5 ui-section-title">
              {googleNeedsProfile
                ? t.googleProfileTitle
                : t.guestTitle}
            </h2>

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

              {googleNeedsProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setShowGoogleForm(false);
                    setError("");
                  }}
                  disabled={loading}
                  className="w-full bg-white/10 hover:bg-white/20 rounded-xl py-3 font-bold"
                >
                  {t.back}
                </button>
              )}
            </form>
          </>
        )}

        {error && !googleNeedsProfile && (
          <p className="text-red-400 text-sm mt-4">
            {error}
          </p>
        )}

      </div>

      {successOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="registration-success-title" className="w-full max-w-sm rounded-3xl border border-emerald-400/30 bg-[#151020] p-6 text-center shadow-[0_20px_80px_rgba(0,0,0,0.7)] ui-popup ui-gradient-frame ui-card">
            <GameCharacter character="dajjal" expression="happy" animation="float" size={80} />
            <h2 id="registration-success-title" className="mt-3 text-lg font-black text-emerald-300 ui-section-title">{t.successTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">{t.successDescription}</p>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-full origin-left rounded-full bg-emerald-400 animate-pulse" /></div>
          </div>
        </div>
      )}
    </main>
  );
}
