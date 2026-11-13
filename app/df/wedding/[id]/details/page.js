"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";
import "../../../wedding-anak-dajjal/wedding.css";

const copy = {
  en: {
    back:"MY INVITATIONS", step:"WEDDING BUILDER · STEP 2 OF 5", title:"Meet the couple",
    intro:"Add the names that will take center stage on your invitation. Parents’ names are optional.",
    groom:"Groom’s full name", bride:"Bride’s full name", groomParents:"Groom’s parents (optional)", brideParents:"Bride’s parents (optional)",
    groomPlaceholder:"Enter groom’s name", bridePlaceholder:"Enter bride’s name", parentsPlaceholder:"e.g. Mr. and Mrs. …",
    save:"SAVE & CONTINUE", saving:"SAVING…", saved:"Couple details saved.", error:"Could not save your details. Please try again.",
    required:"Both names are required.", note:"You can return and edit these details later."
  },
  id: {
    back:"UNDANGAN SAYA", step:"WEDDING BUILDER · LANGKAH 2 DARI 5", title:"Kenali kedua mempelai",
    intro:"Masukkan nama yang akan menjadi pusat perhatian dalam undangan. Nama orang tua bersifat opsional.",
    groom:"Nama lengkap mempelai pria", bride:"Nama lengkap mempelai wanita", groomParents:"Nama orang tua mempelai pria (opsional)", brideParents:"Nama orang tua mempelai wanita (opsional)",
    groomPlaceholder:"Masukkan nama mempelai pria", bridePlaceholder:"Masukkan nama mempelai wanita", parentsPlaceholder:"Contoh: Bapak dan Ibu …",
    save:"SIMPAN & LANJUTKAN", saving:"MENYIMPAN…", saved:"Detail mempelai berhasil disimpan.", error:"Detail belum berhasil disimpan. Silakan coba lagi.",
    required:"Nama kedua mempelai wajib diisi.", note:"Kamu bisa kembali dan mengubah detail ini nanti."
  }
};

export default function WeddingCoupleDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const t = copy[language] || copy.en;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ groom_name:"", bride_name:"", groom_parent_names:"", bride_parent_names:"" });

  useEffect(() => {
    let alive = true;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.is_anonymous) { router.replace(`/login?next=${encodeURIComponent(`/df/wedding/${id}/details`)}`); return; }
      try {
        const response = await fetch(`/api/wedding/invitations/${id}`, { headers:{ Authorization:`Bearer ${session.access_token}` }, cache:"no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || t.error);
        if (alive) setForm({ groom_name:result.profile.groom_name || "", bride_name:result.profile.bride_name || "", groom_parent_names:result.profile.groom_parent_names || "", bride_parent_names:result.profile.bride_parent_names || "" });
      } catch (e) { if (alive) setError(e.message || t.error); }
      finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [id, router, t.error]);

  function update(field, value) { setForm(current => ({ ...current, [field]:value })); setNotice(""); }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    if (!form.groom_name.trim() || !form.bride_name.trim()) { setError(t.required); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error(t.error);
      const response = await fetch(`/api/wedding/invitations/${id}`, { method:"PATCH", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${session.access_token}` }, body:JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t.error);
      setNotice(t.saved);
      router.push(`/df/wedding/${id}/event`);
    } catch (e) { setError(e.message || t.error); setSaving(false); }
  }

  const fields = [
    ["groom_name", t.groom, t.groomPlaceholder, true],
    ["bride_name", t.bride, t.bridePlaceholder, true],
    ["groom_parent_names", t.groomParents, t.parentsPlaceholder, false],
    ["bride_parent_names", t.brideParents, t.parentsPlaceholder, false]
  ];

  return <div className="df-main"><main className="wedding-page wedding-platform">
    <header className="wedding-topbar"><Link href="/df/wedding/dashboard" className="wedding-back">← <span>{t.back}</span></Link><div className="wedding-lang"><button type="button" onClick={()=>setLanguage("en")} aria-pressed={language==="en"}>EN</button><button type="button" onClick={()=>setLanguage("id")} aria-pressed={language==="id"}>ID</button></div></header>
    <div className="wedding-content wedding-platform-content">
      <section className="wedding-hero wedding-platform-heading"><p className="wedding-kicker">{t.step}</p><h1>{t.title}</h1><p className="wedding-intro">{t.intro}</p></section>
      <section className="wedding-section wedding-platform-form">
        {loading ? <p className="wedding-platform-state">{language==="id"?"Memuat data…":"Loading your details…"}</p> : <form className="wedding-form" onSubmit={submit}>
          {fields.map(([name,label,placeholder,required])=><label key={name} htmlFor={name}>{label}<input id={name} name={name} value={form[name]} onChange={e=>update(name,e.target.value)} placeholder={placeholder} maxLength={name.includes("parent")?180:80} required={required}/></label>)}
          <p className="wedding-platform-hint">{t.note}</p>
          {error && <p role="alert" className="wedding-platform-error">{error}</p>}
          {notice && <p role="status" className="wedding-platform-state">{notice}</p>}
          <button className="wedding-primary" type="submit" disabled={saving || loading}>{saving?t.saving:t.save}</button>
        </form>}
      </section>
    </div>
    <footer className="wedding-footer"><strong>DAJJAL FAMILY · WEDDING EXPERIENCES</strong></footer>
  </main></div>;
}
