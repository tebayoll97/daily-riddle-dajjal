"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";

const BUCKET = "df-wedding-gallery";

export default function WeddingGalleryAdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState([]);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("Wedding");
  const [description, setDescription] = useState("");
  const [publishOnUpload, setPublishOnUpload] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    const { data, error: queryError } = await supabaseAdminClient
      .from("df_gallery_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (queryError) throw queryError;
    setItems(data || []);
  }, []);

  useEffect(() => {
    let active = true;
    async function verify() {
      try {
        const { data, error: sessionError } = await supabaseAdminClient.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data?.session) {
          router.replace("/admin/login");
          return;
        }
        const response = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
          cache: "no-store",
        });
        if (!response.ok) {
          router.replace("/admin/login");
          return;
        }
        if (active) await loadItems();
      } catch (e) {
        if (active) setError(e.message || "Tidak dapat memuat galeri.");
      } finally {
        if (active) setChecking(false);
      }
    }
    verify();
    return () => { active = false; };
  }, [router, loadItems]);

  async function uploadImages(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!files.length) {
      setError("Pilih minimal satu foto terlebih dahulu.");
      return;
    }
    if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      setError("Format yang didukung hanya JPG, PNG, dan WEBP.");
      return;
    }
    if (files.some((file) => file.size > 12 * 1024 * 1024)) {
      setError("Ukuran setiap foto maksimal 12 MB.");
      return;
    }

    setBusy(true);
    let completed = 0;
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const { error: storageError } = await supabaseAdminClient.storage.from(BUCKET).upload(path, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });
        if (storageError) throw storageError;

        const { data: publicData } = supabaseAdminClient.storage.from(BUCKET).getPublicUrl(path);
        const { error: insertError } = await supabaseAdminClient.from("df_gallery_items").insert({
          title: title.trim() || file.name.replace(/\\.[^.]+$/, ""),
          description: description.trim(),
          album: album.trim() || "Wedding",
          image_url: publicData.publicUrl,
          storage_path: path,
          is_published: publishOnUpload,
          sort_order: items.length + completed,
        });
        if (insertError) {
          await supabaseAdminClient.storage.from(BUCKET).remove([path]);
          throw insertError;
        }
        completed += 1;
      }
      setMessage(`${completed} foto berhasil diunggah.`);
      setFiles([]);
      setTitle("");
      setDescription("");
      const picker = document.getElementById("gallery-files");
      if (picker) picker.value = "";
      await loadItems();
    } catch (e) {
      setError(e.message || "Upload gagal. Periksa koneksi dan coba lagi.");
      if (completed) await loadItems();
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(item) {
    setError("");
    const { error: updateError } = await supabaseAdminClient
      .from("df_gallery_items")
      .update({ is_published: !item.is_published })
      .eq("id", item.id);
    if (updateError) setError(updateError.message);
    else await loadItems();
  }

  async function deleteItem(item) {
    if (!window.confirm("Hapus foto ini dari galeri secara permanen?")) return;
    setError("");
    setBusy(true);
    try {
      const { error: deleteError } = await supabaseAdminClient
        .from("df_gallery_items").delete().eq("id", item.id);
      if (deleteError) throw deleteError;
      const { error: storageError } = await supabaseAdminClient.storage.from(BUCKET).remove([item.storage_path]);
      if (storageError) throw storageError;
      await loadItems();
      setMessage("Foto berhasil dihapus.");
    } catch (e) {
      setError(e.message || "Foto gagal dihapus.");
    } finally {
      setBusy(false);
    }
  }

  if (checking) return <main className="min-h-screen bg-[#080711] text-purple-200 grid place-items-center"><p className="animate-pulse text-xs font-bold tracking-[.2em]">MEMVERIFIKASI ADMIN...</p></main>;

  return (
    <main className="min-h-screen bg-[#080711] px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="inline-flex rounded-lg border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-200 hover:bg-purple-500/20">← KEMBALI KE DASHBOARD</Link>
        <header className="mt-7">
          <p className="text-[10px] font-extrabold tracking-[.22em] text-pink-300">DAJJAL FAMILY · WEDDING MANAGEMENT</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">WEDDING <span className="bg-gradient-to-r from-pink-300 to-rose-400 bg-clip-text text-transparent">GALLERY</span></h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400">Unggah foto dari HP, kelompokkan berdasarkan album, lalu pilih foto mana yang boleh tampil di halaman undangan.</p>
        </header>

        <section className="mt-8 rounded-2xl border border-pink-400/20 bg-[#15111f] p-5 shadow-xl shadow-black/20 sm:p-7">
          <div className="mb-5 flex items-center gap-3"><span className="text-2xl">📤</span><div><h2 className="text-lg font-extrabold">Upload foto baru</h2><p className="text-xs text-gray-400">JPG, PNG, WEBP · Maksimal 12 MB per foto</p></div></div>
          <form onSubmit={uploadImages} className="space-y-4">
            <label className="block text-xs font-bold text-gray-300">Pilih foto (bisa lebih dari satu)
              <input id="gallery-files" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="mt-2 block w-full rounded-xl border border-dashed border-pink-300/30 bg-black/20 p-4 text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-pink-500/20 file:px-3 file:py-2 file:text-xs file:font-bold file:text-pink-200" />
            </label>
            {files.length > 0 && <p className="text-xs text-cyan-200">{files.length} foto dipilih · {(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)} MB total</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-gray-300">Judul foto (opsional)
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: The Royal Wedding" className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-pink-400/60" />
              </label>
              <label className="block text-xs font-bold text-gray-300">Nama album
                <input value={album} onChange={(e) => setAlbum(e.target.value)} placeholder="Wedding" className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-pink-400/60" />
              </label>
            </div>
            <label className="block text-xs font-bold text-gray-300">Keterangan (opsional)
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Tambahkan cerita singkat tentang foto..." className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-pink-400/60" />
            </label>
            <label className="flex items-center gap-3 text-sm text-gray-300"><input type="checkbox" checked={publishOnUpload} onChange={(e) => setPublishOnUpload(e.target.checked)} className="h-4 w-4 accent-pink-500" /> Langsung tampil di halaman undangan setelah upload</label>
            <button disabled={busy || !files.length} className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-pink-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{busy ? "SEDANG MENGUNGGAH..." : `UPLOAD ${files.length || ""} FOTO`}</button>
          </form>
          {message && <p role="status" className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{message}</p>}
          {error && <p role="alert" className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-3"><div><p className="text-[10px] font-extrabold tracking-[.2em] text-pink-300">PHOTO LIBRARY</p><h2 className="mt-1 text-xl font-black">Kelola galeri <span className="text-pink-300">({items.length})</span></h2></div><button onClick={() => loadItems().catch((e) => setError(e.message))} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-gray-300 hover:bg-white/5">↻ Refresh</button></div>
          {items.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 bg-white/[.02] p-10 text-center text-sm text-gray-500">Belum ada foto. Unggah foto pertama di atas.</div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => <article key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#15111f]">
              <div className="relative aspect-[4/3] bg-black/30"><img src={item.image_url} alt={item.title || "Wedding gallery"} className="h-full w-full object-cover" /><span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[9px] font-extrabold ${item.is_published ? "bg-emerald-500/90 text-white" : "bg-amber-400/90 text-black"}`}>{item.is_published ? "PUBLISHED" : "DRAFT"}</span></div>
              <div className="p-3"><p className="truncate text-xs font-bold text-white">{item.title || "Untitled photo"}</p><p className="mt-1 truncate text-[10px] text-gray-500">{item.album}</p><div className="mt-3 grid grid-cols-2 gap-2"><button disabled={busy} onClick={() => togglePublished(item)} className="rounded-lg border border-pink-300/20 bg-pink-400/10 px-2 py-2 text-[10px] font-bold text-pink-200">{item.is_published ? "Sembunyikan" : "Publikasikan"}</button><button disabled={busy} onClick={() => deleteItem(item)} className="rounded-lg border border-red-400/20 bg-red-500/10 px-2 py-2 text-[10px] font-bold text-red-200">Hapus</button></div></div>
            </article>)}
          </div>}
        </section>
      </div>
    </main>
  );
}
