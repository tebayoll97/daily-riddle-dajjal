
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isID = language === "id";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkExistingAdmin() {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session) {
          const response = await fetch("/api/admin/me", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          });

          if (response.ok) {
            router.replace("/admin");
            return;
          }
        }
      } catch (err) {
        console.error("Admin session check:", err);
      }

      setChecking(false);
    }

    checkExistingAdmin();
  }, [router]);

  async function handleLogin(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;

      const token = data.session?.access_token;

      if (!token) {
        throw new Error("Unable to create login session.");
      }

      const response = await fetch("/api/admin/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        await supabase.auth.signOut();

        throw new Error(
          result.error ||
            (isID
              ? "Akun ini bukan administrator."
              : "This account is not an administrator.")
        );
      }

      router.replace("/admin");
    } catch (err) {
      console.error("Admin login error:", err);

      setError(
        err.message ||
          (isID
            ? "Login administrator gagal."
            : "Administrator login failed.")
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-[75vh] bg-[#080711] flex items-center justify-center text-purple-300">
        {isID ? "Memeriksa sesi..." : "Checking session..."}
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] bg-[#080711] text-white px-5 py-12 flex items-center justify-center">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <span className="text-3xl">♛</span>
          </div>

          <p className="text-purple-400 text-xs tracking-[0.3em] mt-6">
            THE DAILY RIDDLE
          </p>

          <h1 className="text-3xl font-black mt-3">
            ADMIN <span className="text-purple-400">PORTAL</span>
          </h1>

          <p className="text-gray-500 text-sm mt-3">
            {isID
              ? "Masuk ke pusat kendali administrator."
              : "Sign in to the administrator control center."}
          </p>

        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-[#151020] p-6 sm:p-8">

          <div className="flex items-center gap-3 mb-6">
            <span className="text-green-400">●</span>

            <p className="text-sm font-bold text-gray-300">
              {isID ? "ADMINISTRATOR LOGIN" : "ADMINISTRATOR LOGIN"}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-purple-500/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {isID ? "Kata Sandi" : "Password"}
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-purple-500/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 py-3.5 font-bold tracking-wider transition"
            >
              {loading
                ? isID
                  ? "MEMERIKSA..."
                  : "VERIFYING..."
                : isID
                  ? "MASUK SEBAGAI ADMIN"
                  : "SIGN IN AS ADMIN"}
            </button>

          </form>

          <p className="text-center text-[11px] text-gray-600 mt-6">
            {isID
              ? "Akses khusus administrator yang terdaftar."
              : "Restricted access for registered administrators."}
          </p>

        </div>

      </div>
    </main>
  );
}
