
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "./LanguageProvider";

const translations = {
  en: {
    checking: "Checking account...",
    title: "ACCOUNT SECURITY",
    description:
      "Secure your game progress by connecting your Google account.",
    connected: "GOOGLE ACCOUNT CONNECTED",
    connectedDescription:
      "Your game identity is now linked to Google.",
    guest: "GUEST ACCOUNT",
    guestDescription:
      "Your account is not protected by Google yet.",
    connect: "CONTINUE WITH GOOGLE",
    connecting: "CONNECTING...",
    alreadyConnected: "Your account is already registered.",
    failed: "Unable to connect your Google account.",
    expired:
      "Your session has expired. Please register or log in again.",
  },
  id: {
    checking: "Memeriksa akun...",
    title: "KEAMANAN AKUN",
    description:
      "Amankan progres permainan dengan menghubungkan akun Google.",
    connected: "AKUN GOOGLE TERHUBUNG",
    connectedDescription:
      "Identitas permainanmu sekarang sudah terhubung dengan Google.",
    guest: "AKUN TAMU",
    guestDescription:
      "Akunmu belum diamankan dengan Google.",
    connect: "HUBUNGKAN DENGAN GOOGLE",
    connecting: "MENGHUBUNGKAN...",
    alreadyConnected: "Akunmu sudah terdaftar.",
    failed: "Tidak dapat menghubungkan akun Google.",
    expired:
      "Sesi akunmu sudah berakhir. Silakan daftar atau login kembali.",
  },
};

export default function GoogleAccountLink() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [connected, setConnected] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [message, setMessage] = useState("");

  async function checkAccount() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (!user) {
        throw new Error(t.expired);
      }

      const hasGoogle = user.identities?.some(
        (identity) => identity.provider === "google"
      );

      setConnected(Boolean(hasGoogle));
      setIsGuest(Boolean(user.is_anonymous));
      setMessage("");
    } catch (error) {
      console.error("Google account check:", error);
      setMessage(error.message || t.failed);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;
        if (!user) throw new Error(t.expired);

        const hasGoogle = user.identities?.some(
          (identity) => identity.provider === "google"
        );

        if (active) {
          setConnected(Boolean(hasGoogle));
          setIsGuest(Boolean(user.is_anonymous));
        }
      } catch (error) {
        console.error("Google account check:", error);

        if (active) {
          setMessage(error.message || t.failed);
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "USER_UPDATED" ||
        event === "TOKEN_REFRESHED"
      ) {
        setTimeout(() => {
          if (active) checkAccount();
        }, 0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [t.expired, t.failed]);

  async function connectGoogle() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error(t.expired);
      }

      if (!session.user.is_anonymous) {
        await checkAccount();
        setMessage(t.alreadyConnected);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.linkIdentity({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/profile`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Google linking error:", error);
      setMessage(error.message || t.failed);
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="rounded-xl border border-purple-500/20 bg-white/5 p-4">
        <p className="text-sm text-gray-400">
          {t.checking}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-purple-500/20 bg-white/5 p-4 space-y-3">
      <div>
        <h3 className="font-bold text-white">
          {t.title}
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          {t.description}
        </p>
      </div>

      {connected ? (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
          <p className="text-sm font-semibold text-green-400">
            ✓ {t.connected}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {t.connectedDescription}
          </p>
        </div>
      ) : isGuest ? (
        <>
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-sm font-semibold text-amber-300">
              ⚠ {t.guest}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {t.guestDescription}
            </p>
          </div>

          <button
            onClick={connectGoogle}
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-200 disabled:opacity-50 transition"
          >
            {loading ? t.connecting : t.connect}
          </button>
        </>
      ) : (
        <p className="text-sm text-gray-400">
          {t.alreadyConnected}
        </p>
      )}

      {message && (
        <p className="text-sm text-red-400">
          {message}
        </p>
      )}
    </div>
  );
}
