"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WeddingHomePage() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) setSignedIn(!!data.session?.user && !data.session.user.is_anonymous); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session?.user && !session.user.is_anonymous));
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff8f7] text-[#543b49]">
      <section className="relative isolate px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,#f7dce5_0%,transparent_62%)]" />
        <div className="mx-auto max-w-5xl text-center">
          <Link href="/df" className="text-xs font-bold tracking-[.24em] text-[#a66a83]">DAJJAL FAMILY UNIVERSE</Link>
          <p className="mt-12 text-xs font-bold tracking-[.28em] text-[#b47a91]">A BEAUTIFUL WAY TO CELEBRATE LOVE</p>
          <h1 className="mx-auto mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.08] text-[#75465e] sm:text-7xl">Your story deserves<br/><span className="italic text-[#c17c98]">a beautiful invitation.</span></h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#806b75] sm:text-lg">Create a personal digital wedding invitation, share it with the people you love, and keep every special moment in one place.</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={signedIn ? "/df/wedding/dashboard" : "/login?next=%2Fdf%2Fwedding%2Fdashboard"} className="rounded-full bg-[#a96582] px-8 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#a96582]/20 transition hover:-translate-y-0.5 hover:bg-[#945570]"> {signedIn ? "MY WEDDING DASHBOARD" : "CREATE YOUR INVITATION"} </Link>
            <Link href="/df/wedding=anak-dajjal-malika" className="rounded-full border border-[#d9b7c4] bg-white/70 px-8 py-4 text-sm font-bold text-[#8a5b70] transition hover:bg-white">VIEW SAMPLE INVITATION</Link>
          </div>
          <p className="mt-5 text-xs text-[#a18b94]">One Dajjal Family account · Up to 3 invitations per account</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-5 pb-20 sm:grid-cols-3 sm:px-8">
        {[
          ["01", "Choose your style", "Start with a visual theme and colors that reflect your celebration."],
          ["02", "Tell your story", "Add the couple, event details, photos, music, and personal touches."],
          ["03", "Share the moment", "Preview your invitation, publish it, and share its unique link."],
        ].map(([n, title, desc]) => <article key={n} className="rounded-3xl border border-[#f0dce3] bg-white/80 p-7 shadow-[0_12px_35px_rgba(125,75,96,.06)]"><span className="font-serif text-3xl italic text-[#c58ca2]">{n}</span><h2 className="mt-5 font-serif text-2xl text-[#75465e]">{title}</h2><p className="mt-3 text-sm leading-7 text-[#897580]">{desc}</p></article>)}
      </section>
      <footer className="border-t border-[#f0dce3] px-5 py-8 text-center text-xs tracking-[.18em] text-[#a18b94]">DAJJAL FAMILY · WEDDING EXPERIENCES</footer>
    </main>
  );
}
