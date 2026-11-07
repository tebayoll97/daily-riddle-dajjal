
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";
import { useLanguage } from "@/app/components/LanguageProvider";

const translations = {
  en: {
    checking: "Verifying administrator...",
    title: "PLAYER",
    titleAccent: "MANAGEMENT",
    subtitle: "Manage player accounts and monitor activity.",
    back: "BACK TO DASHBOARD",
    ban: "BAN PLAYER",
    unban: "UNBAN",
    delete: "DELETE PLAYER",
    banned: "BANNED",
    active: "ACTIVE",
    actionTitle: "PLAYER ACTION",
    banConfirm: "Ban this player from signing in?",
    unbanConfirm: "Restore this player's access?",
    deleteConfirm: "Permanently delete this player's game profile and score history? This cannot be undone.",
    cancel: "CANCEL",
    confirm: "CONFIRM",
    processing: "PROCESSING...",
    actionError: "Unable to complete this action.",
    logout: "SIGN OUT",
    total: "TOTAL PLAYERS",
    guest: "GUESTS ON THIS PAGE",
    google: "GOOGLE ON THIS PAGE",
    search: "Search nickname...",
    all: "ALL",
    guestFilter: "GUEST",
    googleFilter: "GOOGLE",
    other: "OTHER",
    playerList: "PLAYER DIRECTORY",
    found: "players found",
    noPlayers: "No players found.",
    noResults: "Try another nickname or filter.",
    server: "SERVER",
    points: "POINTS",
    games: "GAMES",
    joined: "JOINED",
    account: "ACCOUNT",
    previous: "PREVIOUS",
    next: "NEXT",
    page: "Page",
    of: "of",
    loading: "LOADING PLAYERS...",
    error: "Unable to load players.",
    accessDenied: "Administrator access denied.",
    retry: "TRY AGAIN",
    guestLabel: "GUEST",
    googleLabel: "GOOGLE",
    otherLabel: "OTHER",
    unknownLabel: "UNKNOWN",
    logoutLoading: "SIGNING OUT...",
    searchButton: "SEARCH",
    emptySearch: "Enter a nickname to search.",
    footer: "THE DAILY RIDDLE · PLAYER CONTROL CENTER",
  },
  id: {
    checking: "Memverifikasi administrator...",
    title: "MANAJEMEN",
    titleAccent: "PEMAIN",
    subtitle: "Kelola akun pemain dan pantau aktivitas permainan.",
    back: "KEMBALI KE DASHBOARD",
    ban: "BLOKIR PEMAIN",
    unban: "BUKA BLOKIR",
    delete: "HAPUS PEMAIN",
    banned: "DIBLOKIR",
    active: "AKTIF",
    actionTitle: "TINDAKAN PEMAIN",
    banConfirm: "Blokir pemain ini agar tidak bisa masuk?",
    unbanConfirm: "Pulihkan akses pemain ini?",
    deleteConfirm: "Hapus permanen profil permainan dan seluruh riwayat skor pemain ini? Tindakan ini tidak dapat dibatalkan.",
    cancel: "BATAL",
    confirm: "KONFIRMASI",
    processing: "MEMPROSES...",
    actionError: "Tindakan tidak dapat diselesaikan.",
    logout: "KELUAR",
    total: "TOTAL PEMAIN",
    guest: "GUEST DI HALAMAN INI",
    google: "GOOGLE DI HALAMAN INI",
    search: "Cari nickname...",
    all: "SEMUA",
    guestFilter: "GUEST",
    googleFilter: "GOOGLE",
    other: "LAINNYA",
    playerList: "DAFTAR PEMAIN",
    found: "pemain ditemukan",
    noPlayers: "Pemain tidak ditemukan.",
    noResults: "Coba nickname atau filter lainnya.",
    server: "SERVER",
    points: "POIN",
    games: "PERMAINAN",
    joined: "BERGABUNG",
    account: "AKUN",
    previous: "SEBELUMNYA",
    next: "BERIKUTNYA",
    page: "Halaman",
    of: "dari",
    loading: "MEMUAT PEMAIN...",
    error: "Tidak dapat memuat data pemain.",
    accessDenied: "Akses administrator ditolak.",
    retry: "COBA LAGI",
    guestLabel: "GUEST",
    googleLabel: "GOOGLE",
    otherLabel: "LAINNYA",
    unknownLabel: "TIDAK DIKETAHUI",
    logoutLoading: "SEDANG KELUAR...",
    searchButton: "CARI",
    emptySearch: "Masukkan nickname untuk mencari.",
    footer: "THE DAILY RIDDLE · PLAYER CONTROL CENTER",
  },
};

const filters = ["ALL", "GUEST", "GOOGLE", "OTHER"];

function formatDate(date, language) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    language === "id" ? "id-ID" : "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function accountStyle(type) {
  switch (type) {
    case "GUEST":
      return "bg-amber-500/10 border-amber-500/30 text-amber-300";
    case "GOOGLE":
      return "bg-blue-500/10 border-blue-500/30 text-blue-300";
    case "OTHER":
      return "bg-purple-500/10 border-purple-500/30 text-purple-300";
    default:
      return "bg-gray-500/10 border-gray-500/30 text-gray-400";
  }
}

export default function AdminPlayersPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: sessionError } =
        await supabaseAdminClient.auth.getSession();

      if (sessionError) throw sessionError;

      const session = data?.session;

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
        search,
      });

      const response = await fetch(
        `/api/admin/players?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          router.replace("/admin/login");
          return;
        }

        throw new Error(result.error || t.error);
      }

      setPlayers(result.players || []);
      setPagination(
        result.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      console.error("Player management error:", err);
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  }, [page, search, router, t.error]);

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
          router.replace("/admin/login");
          return;
        }

        if (active) {
          setAdmin(result.admin);
        }
      } catch (err) {
        console.error("Admin verification error:", err);
        if (active) setError(err.message || t.error);
      } finally {
        if (active) setChecking(false);
      }
    }

    verifyAccess();

    return () => {
      active = false;
    };
  }, [router, t.error]);

  useEffect(() => {
    if (admin) loadPlayers();
  }, [admin, loadPlayers]);

  async function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleFilterChange(value) {
    setFilter(value);
  }


  function openPlayerAction(player, action) {
    setActionTarget(player);
    setActionType(action);
  }

  async function confirmPlayerAction() {
    if (!actionTarget || !actionType || actionLoading) return;
    setActionLoading(true);
    setError("");

    try {
      const { data: { session }, error: sessionError } =
        await supabaseAdminClient.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch(
        `/api/admin/players/${actionTarget.id}`,
        {
          method: actionType === "delete" ? "DELETE" : "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: actionType === "delete"
            ? undefined
            : JSON.stringify({ action: actionType }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t.actionError);

      setActionTarget(null);
      setActionType(null);
      await loadPlayers();
    } catch (err) {
      setError(err.message || t.actionError);
    } finally {
      setActionLoading(false);
    }
  }

  const filteredPlayers = players.filter((player) => {
    if (filter === "ALL") return true;
    if (filter === "OTHER") {
      return (
        player.accountType === "OTHER" ||
        player.accountType === "UNKNOWN"
      );
    }

    return player.accountType === filter;
  });

  const guestCount = players.filter(
    (p) => p.accountType === "GUEST"
  ).length;

  const googleCount = players.filter(
    (p) => p.accountType === "GOOGLE"
  ).length;

  if (checking) {
    return (
      <main className="min-h-screen bg-[#080711] flex flex-col items-center justify-center text-purple-300 gap-4">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
        <p className="text-xs tracking-widest animate-pulse">
          {t.checking}
        </p>
      </main>
    );
  }

  if (!admin) {
    return (
      <main className="min-h-screen bg-[#080711] text-white flex flex-col items-center justify-center px-5 text-center">
        <div className="text-5xl">🔒</div>
        <h1 className="text-2xl font-black mt-5 ui-title">
          {t.accessDenied}
        </h1>
        <button
          onClick={() => router.replace("/admin/login")}
          className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-bold"
        >
          ADMIN LOGIN
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080711] text-white px-3 sm:px-4 py-5 sm:py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-purple-400 text-xs tracking-[0.3em]">
              THE DAILY RIDDLE
            </p>

            <h1 className="text-3xl sm:text-4xl font-black mt-3 ui-title">
              {t.title}{" "}
              <span className="text-purple-400">
                {t.titleAccent}
              </span>
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/admin")}
              className="rounded-lg sm:rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-bold text-purple-300 transition"
            >
              ← {t.back}
            </button>

            <button
          </div>
        </header>

        {/* ADMIN INFO */}
        <section className="mt-8 rounded-2xl border border-purple-500/20 bg-[#151020] p-4 sm:p-3 sm:p-5 ui-card">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xl ui-card">
              ♛
            </div>

            <div className="min-w-0">
              <p className="text-[10px] text-purple-300 font-bold tracking-widest">
                ADMINISTRATOR
              </p>
              <p className="text-sm font-bold break-all mt-1">
                {admin.email}
              </p>
            </div>

            <div className="ml-auto hidden sm:block text-[10px] text-green-400 font-bold">
              ● SECURE ACCESS
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="rounded-2xl border border-purple-500/20 bg-[#151020] p-3 sm:p-5 ui-card">
            <p className="text-[10px] tracking-widest text-gray-400 font-bold">
              {t.total}
            </p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-3 tabular-nums">
              {pagination.total.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 mt-2">
              {t.playerList}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-[#151020] p-3 sm:p-5 ui-card">
            <p className="text-[10px] tracking-widest text-amber-300 font-bold">
              {t.guest}
            </p>
            <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-3 tabular-nums">
              {guestCount}
            </p>
            <p className="text-[10px] text-gray-500 mt-2">
              {t.account}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-[#151020] p-3 sm:p-5 ui-card">
            <p className="text-[10px] tracking-widest text-blue-300 font-bold">
              {t.google}
            </p>
            <p className="text-2xl sm:text-3xl font-black text-blue-300 mt-3 tabular-nums">
              {googleCount}
            </p>
            <p className="text-[10px] text-gray-500 mt-2">
              {t.account}
            </p>
          </div>
        </section>

        {/* SEARCH */}
        <section className="mt-8 rounded-2xl border border-purple-500/20 bg-[#151020] p-4 sm:p-3 sm:p-5 ui-card">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2 sm:gap-3"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.search}
              className="flex-1 min-w-0 rounded-lg sm:rounded-xl border border-purple-500/20 bg-[#0B0913] px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white outline-none focus:border-purple-400 transition placeholder:text-gray-600"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg sm:rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition"
            >
              {t.searchButton}
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mt-4">
            {filters.map((item) => {
              const active = filter === item;

              const labels = {
                ALL: t.all,
                GUEST: t.guestFilter,
                GOOGLE: t.googleFilter,
                OTHER: t.other,
              };

              return (
                <button
                  key={item}
                  onClick={() => handleFilterChange(item)}
                  className={`rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black tracking-wider transition ${
                    active
                      ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/30"
                      : "bg-[#0B0913] border-purple-500/20 text-gray-400 hover:border-purple-400/50 hover:text-white"
                  }`}
                >
                  {labels[item]}
                </button>
              );
            })}
          </div>
        </section>

        {/* PLAYER LIST */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-black tracking-wider text-purple-300 ui-section-title">
                {t.playerList}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {filteredPlayers.length} {t.found}
              </p>
            </div>

            <button
              onClick={loadPlayers}
              disabled={loading}
              className="rounded-lg border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-2 text-xs font-bold text-purple-300 disabled:opacity-50"
            >
              ↻ REFRESH
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-purple-500/20 bg-[#151020] min-h-64 flex flex-col items-center justify-center gap-3 sm:p-4 ui-card">
              <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
              <p className="text-xs text-purple-300 font-bold tracking-widest animate-pulse">
                {t.loading}
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center ui-card">
              <div className="text-3xl">⚠️</div>
              <p className="text-sm text-red-300 mt-3">{error}</p>
              <button
                onClick={loadPlayers}
                className="mt-5 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-3 text-xs font-bold"
              >
                {t.retry}
              </button>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="rounded-2xl border border-purple-500/20 bg-[#151020] min-h-56 flex flex-col items-center justify-center text-center px-5 ui-card">
              <div className="text-4xl">👥</div>
              <p className="font-bold mt-4">{t.noPlayers}</p>
              <p className="text-xs text-gray-500 mt-2">
                {t.noResults}
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE PLAYER CARDS */}
              <div className="grid grid-cols-1 md:hidden gap-3">
                {filteredPlayers.map((player) => (
                  <article
                    key={player.id}
                    className="rounded-2xl border border-purple-500/20 bg-[#151020] p-3 sm:p-4 ui-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-lg sm:rounded-xl border border-purple-500/20 bg-purple-600/10 flex items-center justify-center overflow-hidden ui-card">
                        {player.avatarUrl ? (
                          <img
                            src={player.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">👤</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-black text-sm break-words">
                          {player.nickname || "Unnamed Player"}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {t.server} {player.serverNumber || "-"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-black ${accountStyle(player.accountType)}`}
                      >
                        {player.accountType}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-purple-500/10">
                      <div>
                        <p className="text-[9px] text-gray-500 font-bold">
                          {t.points}
                        </p>
                        <p className="font-black text-purple-300 mt-1">
                          {player.totalPoints.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-gray-500 font-bold">
                          {t.games}
                        </p>
                        <p className="font-black mt-1">
                          {player.gamesPlayed}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-gray-500 font-bold">
                          {t.joined}
                        </p>
                        <p className="text-xs font-bold mt-1">
                          {formatDate(player.createdAt, language)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-purple-500/10">
                      <span className={`text-[9px] font-black rounded-full px-2 py-1 border ${player.isBanned ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-green-500/20 bg-green-500/10 text-green-300"}`}>
                        {player.isBanned ? t.banned : t.active}
                      </span>
                      <button
                        onClick={() => openPlayerAction(player, player.isBanned ? "unban" : "ban")}
                        className="ml-auto rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[9px] font-bold text-amber-300"
                      >
                        {player.isBanned ? t.unban : t.ban}
                      </button>
                      <button
                        onClick={() => openPlayerAction(player, "delete")}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[9px] font-bold text-red-300"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-purple-500/20 bg-[#151020] ui-card">
                <table className="w-full text-left">
                  <thead className="bg-purple-500/5 border-b border-purple-500/20">
                    <tr className="text-[10px] text-purple-300 tracking-wider">
                      <th className="px-5 py-4">PLAYER</th>
                      <th className="px-4 py-4">{t.account}</th>
                      <th className="px-4 py-4">{t.server}</th>
                      <th className="px-4 py-4">{t.points}</th>
                      <th className="px-4 py-4">{t.games}</th>
                      <th className="px-4 py-4">{t.joined}</th>
                      <th className="px-4 py-4">STATUS</th>
                      <th className="px-4 py-4">ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPlayers.map((player) => (
                      <tr
                        key={player.id}
                        className="border-b border-purple-500/10 last:border-0 hover:bg-purple-500/5 transition"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-48">
                            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center overflow-hidden ui-card">
                              {player.avatarUrl ? (
                                <img
                                  src={player.avatarUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                "👤"
                              )}
                            </div>
                            <span className="font-bold text-sm">
                              {player.nickname || "Unnamed Player"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-[9px] font-black ${accountStyle(player.accountType)}`}
                          >
                            {player.accountType}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-300">
                          {player.serverNumber || "-"}
                        </td>

                        <td className="px-4 py-4 text-sm font-black text-purple-300 tabular-nums">
                          {player.totalPoints.toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-300">
                          {player.gamesPlayed}
                        </td>

                        <td className="px-4 py-4 text-xs text-gray-400">
                          {formatDate(player.createdAt, language)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-[9px] font-black rounded-full px-2 py-1 border ${player.isBanned ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-green-500/20 bg-green-500/10 text-green-300"}`}>
                            {player.isBanned ? t.banned : t.active}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openPlayerAction(player, player.isBanned ? "unban" : "ban")}
                              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[10px] font-bold text-amber-300 whitespace-nowrap"
                            >
                              {player.isBanned ? t.unban : t.ban}
                            </button>
                            <button
                              onClick={() => openPlayerAction(player, "delete")}
                              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] font-bold text-red-300 whitespace-nowrap"
                            >
                              {t.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* PAGINATION */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 rounded-2xl border border-purple-500/20 bg-[#151020] p-3 sm:p-4 ui-card">
              <p className="text-xs text-gray-400">
                {t.page} {page} {t.of} {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="rounded-xl border border-purple-500/20 bg-[#0B0913] px-4 py-2 text-xs font-bold text-gray-300 disabled:opacity-30"
                >
                  ← {t.previous}
                </button>

                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(pagination.totalPages, p + 1)
                    )
                  }
                  disabled={
                    page >= pagination.totalPages || loading
                  }
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold disabled:opacity-30"
                >
                  {t.next} →
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="text-center text-gray-600 text-[10px] mt-8 sm:mt-12 tracking-wider">
          {t.footer} · 2026
        </p>

        {actionTarget && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="player-action-title"
              className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-[#151020] p-5 sm:p-6 shadow-2xl shadow-purple-950/40 ui-card"
            >
              <div className="text-2xl mb-3">{actionType === "delete" ? "⚠️" : actionType === "ban" ? "🛡️" : "🔓"}</div>
              <h2 id="player-action-title" className="text-lg font-black text-white">
                {t.actionTitle}
              </h2>
              <p className="text-sm font-bold text-purple-300 mt-2 break-words">
                {actionTarget.nickname || "Unnamed Player"}
              </p>
              <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                {actionType === "delete" ? t.deleteConfirm : actionType === "ban" ? t.banConfirm : t.unbanConfirm}
              </p>
              {error && <p className="text-xs text-red-300 mt-3">{error}</p>}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => { setActionTarget(null); setActionType(null); }}
                  disabled={actionLoading}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-gray-300 disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={confirmPlayerAction}
                  disabled={actionLoading}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-black disabled:opacity-50 ${actionType === "delete" ? "bg-red-600 hover:bg-red-500" : "bg-purple-600 hover:bg-purple-500"}`}
                >
                  {actionLoading ? t.processing : t.confirm}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
