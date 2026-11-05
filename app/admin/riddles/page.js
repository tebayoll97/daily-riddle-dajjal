
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function AdminRiddlesPage() {
  const { language } = useLanguage();
  const isID = language === "id";

  const [riddles, setRiddles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRiddles() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          isID
            ? "Sesi admin tidak ditemukan. Silakan login kembali."
            : "Admin session not found. Please log in again."
        );
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/riddles", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load riddles.");
      }

      setRiddles(result.riddles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRiddles();
  }, []);

  function formatDate(date) {
    if (!date) return "-";

    return new Date(`${date}T00:00:00+07:00`).toLocaleDateString(
      isID ? "id-ID" : "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }
    );
  }

  return (
    <main className="min-h-screen bg-[#080711] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">

        <Link
          href="/admin"
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          ← {isID ? "Kembali ke Dashboard" : "Back to Dashboard"}
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 mb-8">
          <div>
            <h1 className="text-2xl font-black">
              {isID ? "Manajemen Teka-teki" : "Daily Riddles"}
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              {isID
                ? "Kelola semua teka-teki harian."
                : "Manage all daily riddles."}
            </p>
          </div>

          <button
            onClick={loadRiddles}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold disabled:opacity-50"
          >
            ↻ {isID ? "Muat Ulang" : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4">
            <p className="text-xs text-gray-400">
              {isID ? "Total Teka-teki" : "Total Riddles"}
            </p>

            <p className="text-3xl font-black text-purple-400 mt-2">
              {riddles.length}
            </p>
          </div>

          <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4">
            <p className="text-xs text-gray-400">
              {isID ? "Aktif" : "Active"}
            </p>

            <p className="text-3xl font-black text-green-400 mt-2">
              {riddles.filter((r) => r.is_active).length}
            </p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">
            {isID ? "Memuat teka-teki..." : "Loading riddles..."}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-300 text-sm">{error}</p>

            <button
              onClick={loadRiddles}
              className="mt-3 text-sm text-purple-300 underline"
            >
              {isID ? "Coba lagi" : "Try again"}
            </button>
          </div>
        )}

        {!loading && !error && riddles.length === 0 && (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-gray-300 font-bold">
              {isID
                ? "Belum ada teka-teki."
                : "No riddles found."}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {riddles.map((riddle) => (
              <div
                key={riddle.id}
                className="bg-white/5 border border-purple-500/20 rounded-2xl p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-purple-300 text-sm font-bold">
                      {formatDate(riddle.riddle_date)}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {riddle.points} {isID ? "poin" : "points"}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      riddle.is_active
                        ? "bg-green-500/15 text-green-400"
                        : "bg-gray-500/15 text-gray-400"
                    }`}
                  >
                    {riddle.is_active
                      ? isID
                        ? "AKTIF"
                        : "ACTIVE"
                      : isID
                        ? "NONAKTIF"
                        : "INACTIVE"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      QUESTION (ENGLISH)
                    </p>
                    <p className="text-sm text-gray-200">
                      {riddle.question_en || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      PERTANYAAN (INDONESIA)
                    </p>
                    <p className="text-sm text-gray-200">
                      {riddle.question_id || "-"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {isID ? "Jawaban EN" : "Accepted Answers EN"}
                      </p>
                      <p className="text-sm text-purple-300">
                        {riddle.answers_en?.join(", ") || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {isID ? "Jawaban ID" : "Accepted Answers ID"}
                      </p>
                      <p className="text-sm text-purple-300">
                        {riddle.answers_id?.join(", ") || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
