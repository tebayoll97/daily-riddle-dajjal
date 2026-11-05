
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "./LanguageProvider";

const translations = {
  en: {
    checking: "Checking account...",
    title: "SIGN OUT",
    guestTitle: "WARNING: UNPROTECTED ACCOUNT",
    guestMessage:
      "You are using a Guest Account. If you sign out, you may permanently lose access to your nickname, avatar, points and all game progress.",
    guestAction:
      "We strongly recommend connecting Google first.",
    connect: "CONNECT GOOGLE ACCOUNT",
    cancel: "CANCEL",
    logoutAnyway: "LOGOUT ANYWAY",
    confirmGuest:
      "Are you absolutely sure? Your Guest Account may not be recoverable after signing out.",
    confirmNormal: "Are you sure you want to sign out?",
    signingOut: "SIGNING OUT...",
    failed: "Unable to sign out. Please try again.",
    confirm: "CONFIRM LOGOUT",
  },
  id: {
    checking: "Memeriksa akun...",
    title: "KELUAR AKUN",
    guestTitle: "PERINGATAN: AKUN BELUM DIAMANKAN",
    guestMessage:
      "Kamu sedang menggunakan Guest Account. Jika logout, kamu berisiko kehilangan akses ke nickname, avatar, poin, dan seluruh progres permainan.",
    guestAction:
      "Kami sangat menyarankan menghubungkan Google terlebih dahulu.",
    connect: "HUBUNGKAN AKUN GOOGLE",
    cancel: "BATAL",
    logoutAnyway: "TETAP LOGOUT",
    confirmGuest:
      "Apakah kamu benar-benar yakin? Akun Guest mungkin tidak bisa dipulihkan setelah logout.",
    confirmNormal: "Apakah kamu yakin ingin keluar dari akun?",
    signingOut: "SEDANG KELUAR...",
    failed: "Tidak dapat logout. Silakan coba lagi.",
    confirm: "KONFIRMASI LOGOUT",
  },
};

export default function AccountLogout() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [isGuest, setIsGuest] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startLogout() {
    if (checking || loading) return;

    setError("");
    setChecking(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        router.replace("/register");
        return;
      }

      const guest = Boolean(user.is_anonymous);

      setIsGuest(guest);
      setShowWarning(guest);
      setShowFinalConfirm(!guest);
    } catch (err) {
      console.error("Account check error:", err);
      setError(err.message || t.failed);
    } finally {
      setChecking(false);
    }
  }

  async function handleLogout() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      router.replace("/register");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message || t.failed);
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-purple-500/20 bg-white/5 p-4 space-y-3">

      {!showWarning && !showFinalConfirm && (
        <button
          onClick={startLogout}
          disabled={checking || loading}
          className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
        >
          {checking ? t.checking : t.title}
        </button>
      )}

      {showWarning && isGuest && (
        <div className="space-y-4">
          <h3 className="font-bold text-amber-300">
            ⚠ {t.guestTitle}
          </h3>

          <p className="text-sm text-gray-300 leading-relaxed">
            {t.guestMessage}
          </p>

          <p className="text-sm font-semibold text-purple-300">
            {t.guestAction}
          </p>

          <Link
            href="/profile#account-security"
            className="block text-center rounded-lg bg-purple-600 hover:bg-purple-500 py-3 text-sm font-bold transition"
          >
            {t.connect}
          </Link>

          {!showFinalConfirm ? (
            <button
              onClick={() => setShowFinalConfirm(true)}
              className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-300"
            >
              {t.logoutAnyway}
            </button>
          ) : (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 space-y-3">
              <p className="text-sm text-red-300">
                {t.confirmGuest}
              </p>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full rounded-lg bg-red-600 hover:bg-red-500 py-3 text-sm font-bold disabled:opacity-50"
              >
                {loading ? t.signingOut : t.confirm}
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setShowWarning(false);
              setShowFinalConfirm(false);
              setError("");
            }}
            disabled={loading}
            className="w-full rounded-lg bg-white/10 py-3 text-sm font-bold"
          >
            {t.cancel}
          </button>
        </div>
      )}

      {showFinalConfirm && !isGuest && (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            {t.confirmNormal}
          </p>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full rounded-lg bg-red-600 hover:bg-red-500 py-3 text-sm font-bold disabled:opacity-50"
          >
            {loading ? t.signingOut : t.confirm}
          </button>

          <button
            onClick={() => setShowFinalConfirm(false)}
            disabled={loading}
            className="w-full rounded-lg bg-white/10 py-3 text-sm font-bold"
          >
            {t.cancel}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
