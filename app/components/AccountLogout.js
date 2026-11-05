
"use client";

import { useEffect, useState } from "react";
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
    admin:
      "Administrator accounts must sign out through the Admin Dashboard.",
    adminLink: "OPEN ADMIN DASHBOARD",
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
    admin:
      "Akun administrator harus logout melalui Dashboard Admin.",
    adminLink: "BUKA DASHBOARD ADMIN",
    confirm: "KONFIRMASI LOGOUT",
  },
};

export default function AccountLogout() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [checking, setChecking] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

        const adminResponse = await fetch("/api/admin/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        if (adminResponse.ok) {
          if (active) {
            setIsAdmin(true);
            setChecking(false);
          }
          return;
        }

        if (
          adminResponse.status !== 401 &&
          adminResponse.status !== 403
        ) {
          throw new Error("Unable to verify account.");
        }

        if (active) {
          setIsGuest(Boolean(session.user.is_anonymous));
          setChecking(false);
        }
      } catch (err) {
        console.error("Account check error:", err);

        if (active) {
          setError(err.message || t.failed);
          setChecking(false);
        }
      }
    }

    checkAccount();

    return () => {
      active = false;
    };
  }, [t.failed]);

  function startLogout() {
    setError("");

    if (isGuest) {
      setShowWarning(true);
      setShowFinalConfirm(false);
      return;
    }

    setShowFinalConfirm(true);
  }

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message || t.failed);
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="mt-6 rounded-xl border border-purple-500/20 bg-white/5 p-4">
        <p className="text-sm text-gray-400">
          {t.checking}
        </p>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="mt-6 rounded-xl border border-purple-500/20 bg-white/5 p-4 space-y-3">
        <p className="text-sm text-gray-300">
          {t.admin}
        </p>

        <Link
          href="/admin"
          className="block text-center rounded-lg bg-purple-600 py-3 font-bold text-sm"
        >
          {t.adminLink}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-purple-500/20 bg-white/5 p-4 space-y-3">

      {!showWarning && !showFinalConfirm && (
        <button
          onClick={startLogout}
          className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20 transition"
        >
          {t.title}
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
