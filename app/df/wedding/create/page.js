"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";
import "../../wedding-anak-dajjal/wedding.css";

const copy = {
  en: { back:"← MY INVITATIONS", step:"NEW WEDDING PROJECT · STEP 1 OF 5", title:"Start your invitation", intro:"First, give this invitation a title. You can add the couple’s names, event details, photos, and design in the next builder steps.", label:"Invitation title", placeholder:"e.g. The Wedding of Alex & Maya", hint:"This is your private project title for now.", submit:"CREATE DRAFT INVITATION", busy:"CREATING…", error:"Could not create invitation." },
  id: { back:"← UNDANGAN SAYA", step:"PROYEK WEDDING BARU · LANGKAH 1 DARI 5", title:"Mulai undanganmu", intro:"Pertama, berikan judul untuk undangan ini. Nama pasangan, detail acara, foto, dan desain dapat ditambahkan pada langkah builder berikutnya.", label:"Judul undangan", placeholder:"Contoh: Pernikahan Alex & Maya", hint:"Untuk saat ini, judul ini digunakan sebagai nama proyek pribadimu.", submit:"BUAT UNDANGAN DRAFT", busy:"MEMBUAT…", error:"Undangan tidak dapat dibuat." }
};

export default function CreateWeddingPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const t = copy[language] || copy.en;
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.is_anonymous) { router.replace("/login?next=%2Fdf%2Fwedding%2Fcreate"); return; }
      const response = await fetch("/api/wedding/invitations", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${session.access_token}` }, body:JSON.stringify({ title }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t.error);
      router.push("/df/wedding/dashboard");
    } catch (e) { setError(e.message || t.error); setBusy(false); }
  }

  return <div className="df-main"><main className="wedding-page wedding-platform">
    <header className="wedding-topbar"><Link href="/df/wedding/dashboard" className="wedding-back">{t.back}</Link><div className="wedding-lang"><button type="button" onClick={()=>setLanguage("en")} aria-pressed={language==="en"}>EN</button><button type="button" onClick={()=>setLanguage("id")} aria-pressed={language==="id"}>ID</button></div></header>
    <div className="wedding-content wedding-platform-content">
      <section className="wedding-hero wedding-platform-heading"><p className="wedding-kicker">{t.step}</p><h1>{t.title}</h1><p className="wedding-intro">{t.intro}</p></section>
      <section className="wedding-section wedding-platform-form">
        <form className="wedding-form" onSubmit={submit}>
          <label htmlFor="invitation-title">{t.label}<input id="invitation-title" value={title} onChange={e=>setTitle(e.target.value)} required minLength={3} maxLength={100} placeholder={t.placeholder}/></label>
          <p className="wedding-platform-hint">{t.hint}</p>
          {error && <p role="alert" className="wedding-platform-error">{error}</p>}
          <button className="wedding-primary" type="submit" disabled={busy || title.trim().length<3}>{busy?t.busy:t.submit}</button>
        </form>
      </section>
    </div>
    <footer className="wedding-footer"><strong>DAJJAL FAMILY · WEDDING EXPERIENCES</strong></footer>
  </main></div>;
}
