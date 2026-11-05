
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "@/app/components/LanguageProvider";

const translations = {
  en: {
    checking: "Verifying administrator...",
    title: "ADMIN DASHBOARD",
    subtitle: "Welcome to the control center of The Daily Riddle.",
    admin: "ADMINISTRATOR",
    secure: "SECURE ACCESS VERIFIED",
    management: "CONTENT MANAGEMENT",
    riddles: "Daily Riddles",
    riddlesDesc: "Create, edit, schedule, and manage daily riddles.",
    players: "Player Management",
    playersDesc: "View player accounts and their information.",
    statistics: "Game Statistics",
    statisticsDesc: "Monitor player activity and game performance.",
    coming: "COMING SOON",
    logout: "SIGN OUT",
    loggingOut: "SIGNING OUT...",
    logoutTitle: "SIGN OUT?",
    logoutMessage: "Are you sure you want to sign out of the admin dashboard?",
    cancel: "NO, STAY",
    confirmLogout: "YES, SIGN OUT",
    accessDenied: "Administrator access denied.",
    error: "Unable to verify administrator access.",
  },
  id: {
    checking: "Memverifikasi administrator...",
    title: "DASHBOARD ADMIN",
    subtitle: "Selamat datang di pusat kendali The Daily Riddle.",
    admin: "ADMINISTRATOR",
    secure: "AKSES AMAN TERVERIFIKASI",
    management: "PENGELOLAAN KONTEN",
    riddles: "Teka-Teki Harian",
    riddlesDesc: "Buat, edit, jadwalkan, dan kelola teka-teki harian.",
    players: "Manajemen Pemain",
    playersDesc: "Lihat akun pemain dan informasi mereka.",
    statistics: "Statistik Permainan",
    statisticsDesc: "Pantau aktivitas pemain dan performa permainan.",
    coming: "SEGERA HADIR",
    logout: "KELUAR",
    loggingOut: "SEDANG KELUAR...",
    logoutTitle: "KELUAR DARI ADMIN?",
    logoutMessage: "Apakah kamu yakin ingin keluar dari dashboard administrator?",
    cancel: "TIDAK, TETAP DI SINI",
    confirmLogout: "YA, KELUAR",
    accessDenied: "Akses administrator ditolak.",
    error: "Tidak dapat memverifikasi akses administrator.",
  },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyAccess() {
      try {
        const { data, error: sessionError } =
          await supabaseAdminClient.auth.getSession();

        if (sessionError) throw sessionError;

        const session = data?.session;

        if (!session) {
          router.replace("/admin/login");
          return;
        }

        const response = await fetch("/api/admin/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          await supabaseAdminClient.auth.signOut();

          if (response.status === 401 || response.status === 403) {
            router.replace("/admin/login");
            return;
          }

          throw new Error(result.error || t.error);
        }

        if (active) {
          setAdmin(result.admin);
        }
      } catch (err) {
        console.error("Admin dashboard error:", err);

        if (active) {
          setError(err.message || t.error);
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    verifyAccess();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const { error: logoutError } =
        await supabaseAdminClient.auth.signOut();

      if (logoutError) throw logoutError;

      router.replace("/admin/login");
    } catch (err) {
      console.error("Admin logout error:", err);
      setError(err.message || t.error);
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-[75vh] bg-[#080711] flex flex-col items-center justify-center text-purple-300 gap-4">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
        <p className="text-xs tracking-widest animate-pulse">
          {t.checking}
        </p>
      </main>
    );
  }

  if (error && !admin) {
    return (
      <main className="min-h-[75vh] bg-[#080711] text-white flex flex-col items-center justify-center px-5 text-center">
        <div className="text-5xl">🔒</div>

        <h1 className="text-2xl font-black mt-5">
          {t.accessDenied}
        </h1>

        <p className="text-sm text-red-400 mt-3">
          {error}
        </p>

        <button
          onClick={() => router.replace("/admin/login")}
          className="mt-6 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-3 font-bold"
        >
          ADMIN LOGIN
        </button>
      </main>
    );
  }

  if (!admin) return null;

  const modules = [
    {
      icon: "🧩",
      title: t.riddles,
      description: t.riddlesDesc,
    },
    {
      icon: "👥",
      title: t.players,
      description: t.playersDesc,
    },
    {
      icon: "📊",
      title: t.statistics,
      description: t.statisticsDesc,
    },
  ];

  return (
    <main className="min-h-screen bg-[#080711] text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-purple-400 text-xs tracking-[0.3em]">
              THE DAILY RIDDLE
            </p>

            <h1 className="text-3xl sm:text-4xl font-black mt-3">
              ADMIN <span className="text-purple-400">DASHBOARD</span>
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              {t.subtitle}
            </p>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            disabled={loggingOut}
            className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 px-5 py-3 text-sm font-bold text-red-300 transition"
          >
            {loggingOut ? t.loggingOut : t.logout}
          </button>
        </div>

        {/* ADMIN INFORMATION */}
        <section className="mt-10 rounded-2xl border border-purple-500/30 bg-[#151020] p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl">
              ♛
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-purple-300 font-bold tracking-wider">
                {t.admin}
              </p>

              <p className="font-bold text-white mt-1 break-all">
                {admin.email}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-purple-500/20">
            <p className="text-xs text-green-400 font-bold">
              ● {t.secure}
            </p>
          </div>
        </section>

        {/* MANAGEMENT MODULES */}
        <section className="mt-10">
          <h2 className="text-sm font-black tracking-wider text-purple-300 mb-5">
            {t.management}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <div
                key={module.title}
                className="rounded-2xl border border-purple-500/20 bg-[#151020] p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">
                    {module.icon}
                  </span>

                  <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-[9px] font-bold text-purple-300">
                    {t.coming}
                  </span>
                </div>

                <h3 className="font-black text-lg mt-5">
                  {module.title}
                </h3>

                <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-gray-600 text-xs mt-12">
          THE DAILY RIDDLE · ADMIN CONTROL CENTER · 2026
        </p>
      </div>

      {/* LOGOUT CONFIRMATION POPUP */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-5 py-6"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !loggingOut
            ) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-3xl border border-purple-500/30 bg-[#151020] p-6 sm:p-7 shadow-2xl shadow-purple-950/40 animate-[popupIn_0.2s_ease-out]">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">
              🚪
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-center mt-5">
              {t.logoutTitle}
            </h2>

            <p className="text-sm text-gray-400 text-center mt-3 leading-relaxed">
              {t.logoutMessage}
            </p>

            {error && (
              <p className="text-xs text-red-400 text-center mt-4">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-3 text-xs font-black text-purple-300 transition disabled:opacity-50"
              >
                {t.cancel}
              </button>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl border border-red-500/30 bg-red-600 hover:bg-red-500 px-4 py-3 text-xs font-black text-white transition disabled:opacity-50"
              >
                {loggingOut ? t.loggingOut : t.confirmLogout}
              </button>
            </div>

            {loggingOut && (
              <div className="flex items-center justify-center gap-2 mt-5 text-purple-300">
                <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
                <span className="text-[10px] tracking-widest animate-pulse">
                  {t.loggingOut}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes popupIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </main>
  );
}
