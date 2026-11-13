"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function WeddingDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.is_anonymous) {
        router.replace("/login?next=%2Fdf%2Fwedding%2Fdashboard");
        return;
      }
      try {
        const response = await fetch("/api/wedding/invitations", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load invitations.");
        if (alive) setItems(result.invitations || []);
      } catch (e) { if (alive) setError(e.message); }
      finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [router]);

  return <main className="min-h-screen bg-[#fff8f7] px-4 py-10 text-[#543b49] sm:px-8">
    <div className="mx-auto max-w-5xl">
      <Link href="/df/wedding" className="text-xs font-bold tracking-widest text-[#a66a83]">← WEDDING HOME</Link>
      <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold tracking-[.22em] text-[#b47a91]">YOUR PRIVATE SPACE</p><h1 className="mt-2 font-serif text-4xl text-[#75465e]">My Invitations</h1><p className="mt-2 text-sm text-[#897580]">Manage your wedding invitations in one place.</p></div>
        <Link href="/df/wedding/create" className="rounded-full bg-[#a96582] px-6 py-3 text-center text-sm font-bold text-white">＋ CREATE INVITATION</Link>
      </div>
      <div className="mt-8 rounded-2xl border border-[#f0dce3] bg-white p-5 text-sm text-[#806b75]">You can create up to <strong>3 invitations</strong> with this account. Draft invitations are private until published.</div>
      {loading ? <p className="py-16 text-center text-sm text-[#a18b94]">Loading your invitations…</p> : error ? <p role="alert" className="mt-8 rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error}</p> : items.length === 0 ? <div className="mt-8 rounded-3xl border border-dashed border-[#d9b7c4] bg-white/60 px-6 py-16 text-center"><div className="text-4xl">♡</div><h2 className="mt-4 font-serif text-2xl text-[#75465e]">Your story starts here</h2><p className="mt-2 text-sm text-[#897580]">You have not created an invitation yet.</p><Link href="/df/wedding/create" className="mt-6 inline-block rounded-full bg-[#a96582] px-7 py-3 text-sm font-bold text-white">CREATE YOUR FIRST INVITATION</Link></div> : <div className="mt-8 grid gap-4 sm:grid-cols-2">{items.map(item => <article key={item.id} className="rounded-3xl border border-[#f0dce3] bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.is_active ? "PUBLISHED" : "DRAFT"}</span><span className="text-xs text-[#a18b94]">{new Date(item.created_at).toLocaleDateString()}</span></div><h2 className="mt-5 font-serif text-2xl text-[#75465e]">{item.title}</h2><p className="mt-2 break-all text-xs text-[#a18b94]">/df/wedding={item.slug}</p><a href={`/df/wedding=${encodeURIComponent(item.slug)}`} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-bold text-[#a96582]">Preview invitation ↗</a></article>)}</div>}
    </div>
  </main>;
}
