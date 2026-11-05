
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GoogleAccountLink() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [connected, setConnected] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkAccount() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        if (active) {
          setChecking(false);
        }
        return;
      }

      const user = data.user;
      const hasGoogle = user.identities?.some(
        (identity) => identity.provider === "google"
      );

      if (active) {
        setConnected(Boolean(hasGoogle));
        setIsGuest(Boolean(user.is_anonymous));
        setChecking(false);
      }
    }

    checkAccount();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAccount();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function connectGoogle() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!session.user.is_anonymous) {
        setConnected(true);
        setIsGuest(false);
        setMessage("Your account is already registered.");
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

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google linking error:", error);
      setMessage(
        error.message || "Unable to connect your Google account."
      );
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="rounded-xl border border-purple-500/20 bg-white/5 p-4">
        <p className="text-sm text-gray-400">
          Checking account status...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-purple-500/20 bg-white/5 p-4 space-y-3">
      <div>
        <h3 className="font-bold text-white">
          Account Security
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          Secure your game progress by connecting your Google account.
        </p>
      </div>

      {connected ? (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
          <p className="text-sm font-semibold text-green-400">
            ✓ Google account connected
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Your game identity is now linked to Google.
          </p>
        </div>
      ) : isGuest ? (
        <button
          onClick={connectGoogle}
          disabled={loading}
          className="w-full rounded-lg bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-200 disabled:opacity-50 transition"
        >
          {loading
            ? "Connecting..."
            : "Continue with Google"}
        </button>
      ) : (
        <p className="text-sm text-gray-400">
          Your account is not anonymous.
        </p>
      )}

      {message && (
        <p className="text-sm text-red-400">
          {message}
        </p>
      )}

      {isGuest && !connected && (
        <p className="text-xs text-gray-500">
          Your existing nickname, avatar and game progress
          will remain connected to this account.
        </p>
      )}
    </div>
  );
}
