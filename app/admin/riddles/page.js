
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    riddle_date: "",
    question_en: "",
    question_id: "",
    hint_en: "",
    hint_id: "",
    answers_en: "",
    answers_id: "",
    points: "100",
    is_active: true,
  });

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error(
        isID
          ? "Sesi admin tidak ditemukan. Silakan login kembali."
          : "Admin session not found. Please log in again."
      );
    }

    return session;
  }

  async function loadRiddles() {
    setLoading(true);
    setError("");

    try {
      const session = await getSession();

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

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const session = await getSession();

      const payload = {
        ...form,
        points: Number(form.points),
        answers_en: form.answers_en
          .split(",")
          .map((answer) => answer.trim())
          .filter(Boolean),
        answers_id: form.answers_id
          .split(",")
          .map((answer) => answer.trim())
          .filter(Boolean),
      };

      const response = await fetch("/api/admin/riddles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create riddle.");
      }

      setSuccess(
        isID
          ? "Teka-teki berhasil ditambahkan!"
          : "Riddle successfully created!"
      );

      setForm({
        riddle_date: "",
        question_en: "",
        question_id: "",
        hint_en: "",
        hint_id: "",
        answers_en: "",
        answers_id: "",
        points: "100",
        is_active: true,
      });

      await loadRiddles();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

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

  function Field({ label, value, field, placeholder, multiline = false }) {
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          {label}
        </label>

        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => updateForm(field, e.target.value)}
            placeholder={placeholder}
            required
            rows={3}
            className="w-full rounded-xl bg-[#100d1d] border border-purple-500/20 p-3 text-sm text-white outline-none focus:border-purple-400"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => updateForm(field, e.target.value)}
            placeholder={placeholder}
            required
            className="w-full rounded-xl bg-[#100d1d] border border-purple-500/20 p-3 text-sm text-white outline-none focus:border-purple-400"
          />
        )}
      </div>
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

        <div className="mt-6 mb-8">
          <h1 className="text-2xl font-black">
            {isID ? "Manajemen Teka-teki" : "Daily Riddles"}
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            {isID
              ? "Buat dan kelola teka-teki harian."
              : "Create and manage daily riddles."}
          </p>
        </div>

        {/* CREATE RIDDLE FORM */}

        <section className="bg-white/5 border border-purple-500/20 rounded-2xl p-5 mb-8">
          <h2 className="text-lg font-black mb-5">
            ✦ {isID ? "Tambah Teka-teki Baru" : "Add New Riddle"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {isID ? "Tanggal Tayang" : "Publish Date"}
              </label>

              <input
                type="date"
                value={form.riddle_date}
                onChange={(e) =>
                  updateForm("riddle_date", e.target.value)
                }
                required
                className="w-full rounded-xl bg-[#100d1d] border border-purple-500/20 p-3 text-sm text-white outline-none focus:border-purple-400"
              />
            </div>

            <div className="border-t border-white/10 pt-5 space-y-4">
              <h3 className="font-bold text-purple-300">
                🇬🇧 English Version
              </h3>

              <Field
                label="Question (English)"
                field="question_en"
                value={form.question_en}
                placeholder="Write the riddle question..."
                multiline
              />

              <Field
                label="Hint (English)"
                field="hint_en"
                value={form.hint_en}
                placeholder="Write a hint..."
              />

              <Field
                label="Accepted Answers (English)"
                field="answers_en"
                value={form.answers_en}
                placeholder="echo, an echo"
              />

              <p className="text-xs text-gray-500">
                {isID
                  ? "Pisahkan beberapa jawaban menggunakan koma."
                  : "Separate multiple accepted answers with commas."}
              </p>
            </div>

            <div className="border-t border-white/10 pt-5 space-y-4">
              <h3 className="font-bold text-purple-300">
                🇮🇩 Bahasa Indonesia
              </h3>

              <Field
                label="Pertanyaan (Indonesia)"
                field="question_id"
                value={form.question_id}
                placeholder="Tulis pertanyaan teka-teki..."
                multiline
              />

              <Field
                label="Petunjuk (Indonesia)"
                field="hint_id"
                value={form.hint_id}
                placeholder="Tulis petunjuk..."
              />

              <Field
                label="Jawaban yang Diterima (Indonesia)"
                field="answers_id"
                value={form.answers_id}
                placeholder="gema, suara gema"
              />

              <p className="text-xs text-gray-500">
                {isID
                  ? "Pisahkan beberapa jawaban menggunakan koma."
                  : "Separate multiple accepted answers with commas."}
              </p>
            </div>

            <div className="border-t border-white/10 pt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {isID ? "Poin" : "Points"}
                </label>

                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={form.points}
                  onChange={(e) =>
                    updateForm("points", e.target.value)
                  }
                  required
                  className="w-full rounded-xl bg-[#100d1d] border border-purple-500/20 p-3 text-sm text-white outline-none focus:border-purple-400"
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    updateForm("is_active", e.target.checked)
                  }
                  className="w-4 h-4 accent-purple-500"
                />

                {isID
                  ? "Aktifkan teka-teki"
                  : "Activate this riddle"}
              </label>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-sm text-green-300">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 py-3 font-bold transition"
            >
              {saving
                ? isID
                  ? "Menyimpan..."
                  : "Saving..."
                : isID
                  ? "SIMPAN TEKA-TEKI"
                  : "SAVE RIDDLE"}
            </button>

          </form>
        </section>

        {/* RIDDLE LIST */}

        <section>
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-black">
              {isID ? "Daftar Teka-teki" : "Riddle List"}
            </h2>

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
            <p className="text-center py-10 text-gray-400">
              {isID ? "Memuat teka-teki..." : "Loading riddles..."}
            </p>
          )}

          {!loading && riddles.length === 0 && (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-gray-400">
                {isID
                  ? "Belum ada teka-teki."
                  : "No riddles found."}
              </p>
            </div>
          )}

          {!loading && riddles.map((riddle) => (
            <div
              key={riddle.id}
              className="bg-white/5 border border-purple-500/20 rounded-2xl p-5 mb-4"
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
                    ? isID ? "AKTIF" : "ACTIVE"
                    : isID ? "NONAKTIF" : "INACTIVE"}
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
        </section>

      </div>
    </main>
  );
}
