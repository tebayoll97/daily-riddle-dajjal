"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CreateWeddingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.is_anonymous) {
        router.replace("/login?next=%2Fdf%2Fwedding%2Fcreate");
        return;
      }
      const response = await fetch("/api/wedding/invitations", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ title }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create invitation.");
      router.push("/df/wedding/dashboard");
    } catch (e) { setError(e.message); setBusy(false); }
  }

  return <main className="min-h-screen bg-[#fff8f7] px-4 py-10 text-[#543b49] sm:px-8"><div className="mx-auto max-w-2xl"><Link href="/df/wedding/dashboard" className="text-xs font-bold tracking-widest text-[#a66a83]">← MY INVITATIONS</Link><p className="mt-10 text-xs font-bold tracking-[.22em] text-[#b47a91]">NEW WEDDING PROJECT · STEP 1 OF 5</p><h1 className="mt-3 font-serif text-4xl text-[#75465e]">Start your invitation</h1><p className="mt-3 text-sm leading-7 text-[#897580]">First, give this invitation a title. You can add the couple’s names, event details, photos, and design in the next builder steps.</p>
  <form onSubmit={submit} className="mt-8 rounded-3xl border border-[#f0dce3] bg-white p-6 shadow-sm sm:p-8"><label htmlFor="invitation-title" className="block text-sm font-bold text-[#75465e]">Invitation title</label><input id="invitation-title" value={title} onChange={e=>setTitle(e.target.value)} required minLength={3} maxLength={100} placeholder="e.g. The Wedding of Alex & Maya" className="mt-3 w-full rounded-xl border border-[#e7ccd6] bg-[#fffafb] px-4 py-3 text-sm text-[#543b49] outline-none focus:border-[#b77a93]" /><p className="mt-2 text-xs text-[#a18b94]">This will be used as the private project title for now.</p>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy || title.trim().length<3} className="mt-7 w-full rounded-full bg-[#a96582] px-6 py-4 text-sm font-bold text-white disabled:opacity-50">{busy ? "CREATING…" : "CREATE DRAFT INVITATION"}</button></form></div></main>;
}
