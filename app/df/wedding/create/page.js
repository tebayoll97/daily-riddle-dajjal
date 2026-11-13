"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";
import WeddingAccountControls from "../WeddingAccountControls";
import "../../wedding-anak-dajjal/wedding.css";

const steps = [
  { en:"Invitation title", id:"Judul undangan", enSub:"Name your wedding project", idSub:"Beri nama proyek undanganmu" },
  { en:"The couple", id:"Kedua mempelai", enSub:"Names and parents", idSub:"Nama pasangan dan orang tua" },
  { en:"Event details", id:"Detail acara", enSub:"Date, time and venue", idSub:"Tanggal, waktu, dan lokasi" },
  { en:"Invitation design", id:"Desain undangan", enSub:"Theme, color and main photo", idSub:"Tema, warna, dan foto utama" },
  { en:"Gallery & music", id:"Galeri & musik", enSub:"Add photos and a soundtrack", idSub:"Tambahkan foto dan musik" },
  { en:"Extra features", id:"Fitur tambahan", enSub:"Story, RSVP, guestbook and gifts", idSub:"Love Story, RSVP, buku tamu, dan hadiah" },
  { en:"Review", id:"Pratinjau", enSub:"Review your invitation details", idSub:"Periksa detail undanganmu" }
];

const initialForm = {
  groom_name:"", bride_name:"", groom_parent_names:"", bride_parent_names:"",
  event_date:"", event_time:"", event_type:"reception", venue:"", address:"", maps_url:"",
  event_schedule:"", theme_name:"royal-romance", theme_color:"dusty-rose", main_photo_url:"",
  music_url:"", gallery_urls:"", love_story:"", rsvp_enabled:false, guestbook_enabled:false, gift_info:""
};

const copy = {
  en: {
    back:"MY INVITATIONS", kicker:"WEDDING INVITATION BUILDER", intro:"Create your invitation in one smooth flow. Move between steps without leaving this page.",
    title:"Project title", titleHint:"This title is private and can be changed later.",
    groom:"Groom’s full name", bride:"Bride’s full name", groomParents:"Groom’s parents (optional)", brideParents:"Bride’s parents (optional)",
    date:"Event date", time:"Event time", type:"Event type", venue:"Venue name", address:"Full address", maps:"Google Maps link",
    reception:"Reception", ceremony:"Ceremony / Akad", both:"Ceremony & reception", schedule:"Event schedule (one item per line)",
    theme:"Invitation theme", color:"Color palette", photo:"Main couple photo URL",
    music:"Music / audio URL", gallery:"Gallery photo URLs (one per line)",
    story:"Love Story", rsvp:"Enable RSVP", guestbook:"Enable guestbook", gifts:"Gift information (optional)",
    save:"SAVE DRAFT", saving:"SAVING…", saved:"Draft saved successfully.", error:"Could not save your draft.",
    previous:"PREVIOUS", next:"NEXT", continue:"CONTINUE SETTINGS", finish:"REVIEW DRAFT", review:"Your invitation draft is ready for review.",
    noTitle:"Enter an invitation title (at least 3 characters).", createError:"Could not create invitation.",
    themeRoyal:"Royal Romance", themeGarden:"Garden Bloom", themeClassic:"Classic Elegance",
    rose:"Dusty Rose", peach:"Peach", mint:"Sage & Mint", lavender:"Lavender",
    helper:"You can save your draft at any stage. Publishing will be a separate action."
  },
  id: {
    back:"UNDANGAN SAYA", kicker:"PEMBUAT UNDANGAN WEDDING", intro:"Buat undangan dalam satu alur. Pindah tahap tanpa meninggalkan halaman ini.",
    title:"Judul undangan", titleHint:"Judul ini bersifat pribadi dan bisa diubah nanti.",
    groom:"Nama lengkap mempelai pria", bride:"Nama lengkap mempelai wanita", groomParents:"Orang tua mempelai pria (opsional)", brideParents:"Orang tua mempelai wanita (opsional)",
    date:"Tanggal acara", time:"Waktu acara", type:"Jenis acara", venue:"Nama tempat", address:"Alamat lengkap", maps:"Tautan Google Maps",
    reception:"Resepsi", ceremony:"Akad / pemberkatan", both:"Akad dan resepsi", schedule:"Susunan acara (satu baris untuk setiap agenda)",
    theme:"Tema undangan", color:"Palet warna", photo:"URL foto utama pasangan",
    music:"URL musik / audio", gallery:"URL foto galeri (satu baris untuk setiap foto)",
    story:"Love Story", rsvp:"Aktifkan RSVP", guestbook:"Aktifkan buku tamu", gifts:"Informasi hadiah (opsional)",
    save:"SIMPAN DRAF", saving:"MENYIMPAN…", saved:"Draf berhasil disimpan.", error:"Draf belum berhasil disimpan.",
    previous:"SEBELUMNYA", next:"BERIKUTNYA", continue:"LANJUT PENGATURAN", finish:"TINJAU DRAF", review:"Draf undangan siap ditinjau.",
    noTitle:"Masukkan judul undangan (minimal 3 karakter).", createError:"Undangan belum berhasil dibuat.",
    themeRoyal:"Royal Romance", themeGarden:"Garden Bloom", themeClassic:"Classic Elegance",
    rose:"Dusty Rose", peach:"Peach", mint:"Sage & Mint", lavender:"Lavender",
    helper:"Kamu bisa menyimpan draf pada tahap mana pun. Publikasi akan menjadi tindakan terpisah."
  }
};

const splitLines = value => String(value || "").split("\n").map(v=>v.trim()).filter(Boolean);

export default function CreateWeddingPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const t = copy[language] || copy.en;
  const [invitationId, setInvitationId] = useState("");
  const [invitationTitle, setInvitationTitle] = useState("");
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function init() {
      const { data:{ session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.is_anonymous) {
        router.replace("/login?next=%2Fdf%2Fwedding%2Fcreate");
        return;
      }
      const existingId = new URLSearchParams(window.location.search).get("id");
      if (existingId) {
        try {
          const response = await fetch(`/api/wedding/invitations/${existingId}`, { headers:{ Authorization:`Bearer ${session.access_token}` }, cache:"no-store" });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || t.error);
          if (alive) {
            const p = result.profile || {};
            setInvitationId(existingId);
            setInvitationTitle(result.invitation?.title || "");
            setForm({
              ...initialForm, ...p,
              event_schedule:Array.isArray(p.event_schedule)?p.event_schedule.join("\n"):"",
              gallery_urls:Array.isArray(p.gallery_urls)?p.gallery_urls.join("\n"):""
            });
            setStep(Number(p.draft_step || 0));
          }
        } catch (e) { if (alive) setError(e.message || t.error); }
      }
      if (alive) setLoading(false);
    }
    init();
    return () => { alive = false; };
  }, [router, t.error]);

  function update(field, value) {
    setForm(current=>({...current,[field]:value}));
    setNotice("");
  }

  async function getSession() {
    const { data:{ session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error(t.error);
    return session;
  }

  async function ensureInvitation(session) {
    if (invitationId) return invitationId;
    const title = invitationTitle.trim();
    if (title.length < 3) throw new Error(t.noTitle);
    const response = await fetch("/api/wedding/invitations", {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${session.access_token}` },
      body:JSON.stringify({ title })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || t.createError);
    const id = result.invitation.id;
    setInvitationId(id);
    window.history.replaceState({}, "", `/df/wedding/create?id=${id}`);
    return id;
  }

  async function saveDraft(targetStep = step) {
    if (saving) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const session = await getSession();
      const id = await ensureInvitation(session);
      const payload = {
        ...form,
        event_schedule:splitLines(form.event_schedule),
        gallery_urls:splitLines(form.gallery_urls),
        draft_step:targetStep
      };
      const response = await fetch(`/api/wedding/invitations/${id}`, {
        method:"PATCH",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${session.access_token}` },
        body:JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t.error);
      setNotice(t.saved);
      return true;
    } catch (e) {
      setError(e.message || t.error);
      return false;
    } finally { setSaving(false); }
  }

  async function nextStep() {
    if (step === 0 && invitationTitle.trim().length < 3) {
      setError(t.noTitle);
      return;
    }
    const ok = await saveDraft(Math.min(step + 1, 6));
    if (ok) { setStep(current=>Math.min(current+1,6)); setError(""); }
  }

  function previousStep() {
    setStep(current=>Math.max(0,current-1));
    setError(""); setNotice("");
  }

  const field = (name,label,placeholder="",type="text") => (
    <label key={name} htmlFor={name}>{label}
      <input id={name} type={type} value={form[name] ?? ""} onChange={e=>update(name,e.target.value)} placeholder={placeholder}/>
    </label>
  );
  const area = (name,label,placeholder="") => (
    <label key={name} htmlFor={name}>{label}
      <textarea id={name} rows={5} value={form[name] ?? ""} onChange={e=>update(name,e.target.value)} placeholder={placeholder}/>
    </label>
  );

  return <div className="df-main"><main className="wedding-page wedding-platform wedding-builder-page">
    <header className="wedding-topbar">
      <Link href="/df/wedding/dashboard" className="wedding-back">← <span>{t.back}</span></Link>
      <div className="wedding-topbar-account"><WeddingAccountControls /><div className="wedding-lang"><button type="button" onClick={()=>setLanguage("en")} aria-pressed={language==="en"}>EN</button><button type="button" onClick={()=>setLanguage("id")} aria-pressed={language==="id"}>ID</button></div>
    </header>
    <div className="wedding-content wedding-platform-content">
      <section className="wedding-hero wedding-platform-heading">
        <p className="wedding-kicker">{t.kicker}</p>
        <h1>{language==="id"?"Rancang hari istimewamu":"Design your special day"}</h1>
        <p className="wedding-intro">{t.intro}</p>
      </section>
      {loading ? <p className="wedding-platform-state">{language==="id"?"Memuat builder…":"Loading builder…"}</p> : <>
        <section className="wedding-builder-progress wedding-section">
          <div className="wedding-builder-progress-top"><span>{language==="id"?"TAHAP":"STEP"} {step+1} / 7</span><strong>{language==="id"?steps[step].id:steps[step].en}</strong></div>
          <div className="wedding-builder-progress-track">{steps.map((item,index)=><button key={index} type="button" aria-label={language==="id"?item.id:item.en} aria-current={step===index?"step":undefined} className={index<=step?"is-done":""} onClick={()=>setStep(index)} />)}</div>
          <p>{language==="id"?steps[step].idSub:steps[step].enSub}</p>
        </section>

        <section className="wedding-section wedding-platform-form wedding-builder-panel">
          <form className="wedding-form" onSubmit={e=>e.preventDefault()}>
            {step===0 && <><label htmlFor="invitationTitle">{t.title}<input id="invitationTitle" value={invitationTitle} onChange={e=>{setInvitationTitle(e.target.value);setNotice("");}} placeholder="Contoh: Pernikahan Alex & Maya" maxLength={100}/></label><p className="wedding-platform-hint">{t.titleHint}</p></>}
            {step===1 && <div className="wedding-builder-grid">
              {field("groom_name",t.groom)}{field("bride_name",t.bride)}
              {field("groom_parent_names",t.groomParents)}{field("bride_parent_names",t.brideParents)}
            </div>}
            {step===2 && <div className="wedding-builder-grid">
              {field("event_date",t.date,"","date")}{field("event_time",t.time,"","time")}
              <label htmlFor="event_type">{t.type}<select id="event_type" value={form.event_type} onChange={e=>update("event_type",e.target.value)}><option value="reception">{t.reception}</option><option value="ceremony">{t.ceremony}</option><option value="both">{t.both}</option></select></label>
              {field("venue",t.venue)}{field("address",t.address)}{field("maps_url",t.maps,"https://maps.google.com/...")}
              <div className="wedding-builder-full">{area("event_schedule",t.schedule,"09.00 — Guest arrival\n10.00 — Main event")}</div>
            </div>}
            {step===3 && <div className="wedding-builder-grid">
              <label htmlFor="theme_name">{t.theme}<select id="theme_name" value={form.theme_name} onChange={e=>update("theme_name",e.target.value)}><option value="royal-romance">{t.themeRoyal}</option><option value="garden-bloom">{t.themeGarden}</option><option value="classic-elegance">{t.themeClassic}</option></select></label>
              <label htmlFor="theme_color">{t.color}<select id="theme_color" value={form.theme_color} onChange={e=>update("theme_color",e.target.value)}><option value="dusty-rose">{t.rose}</option><option value="peach">{t.peach}</option><option value="sage-mint">{t.mint}</option><option value="lavender">{t.lavender}</option></select></label>
              <div className="wedding-builder-full">{field("main_photo_url",t.photo,"https://...")}</div>
            </div>}
            {step===4 && <div className="wedding-builder-grid">
              {field("music_url",t.music,"https://...")}
              <div className="wedding-builder-full">{area("gallery_urls",t.gallery,"https://photo-1...\nhttps://photo-2...")}</div>
            </div>}
            {step===5 && <div className="wedding-builder-grid">
              <div className="wedding-builder-full">{area("love_story",t.story)}</div>
              <label className="wedding-builder-toggle"><input type="checkbox" checked={form.rsvp_enabled} onChange={e=>update("rsvp_enabled",e.target.checked)}/><span>{t.rsvp}</span></label>
              <label className="wedding-builder-toggle"><input type="checkbox" checked={form.guestbook_enabled} onChange={e=>update("guestbook_enabled",e.target.checked)}/><span>{t.guestbook}</span></label>
              <div className="wedding-builder-full">{area("gift_info",t.gifts)}</div>
            </div>}
            {step===6 && <div className="wedding-builder-review">
              <h2>{invitationTitle || (language==="id"?"Undangan baru":"New invitation")}</h2>
              <p><strong>{form.groom_name || "—"} & {form.bride_name || "—"}</strong></p>
              <p>{form.event_date || "—"} · {form.event_time || "—"}</p>
              <p>{form.venue || "—"} · {form.address || "—"}</p>
              <p>{t.review}</p>
              <p className="wedding-platform-hint">{t.helper}</p>
            </div>}
            {error && <p role="alert" className="wedding-platform-error">{error}</p>}
            {notice && <p role="status" className="wedding-platform-state">{notice}</p>}
          </form>
        </section>
        <div className="wedding-builder-navigation">
          <button type="button" className="wedding-builder-secondary" onClick={previousStep} disabled={step===0}>{t.previous}</button>
          {step<6 ? <button type="button" className="wedding-primary" onClick={nextStep} disabled={saving}>{step===0?t.continue:t.next} →</button> : <button type="button" className="wedding-primary" onClick={()=>saveDraft(6)} disabled={saving}>{t.finish}</button>}
        </div>
      </>}
    </div>
    <footer className="wedding-footer"><strong>DAJJAL FAMILY · WEDDING EXPERIENCES</strong></footer>
    {!loading && <button type="button" className="wedding-builder-save-float" onClick={()=>saveDraft(step)} disabled={saving}><span>♡</span>{saving?t.saving:t.save}</button>}
  </main></div>;
}
