"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/components/LanguageProvider";
import WeddingAccountControls from "../WeddingAccountControls";
import "../../wedding-anak-dajjal/wedding.css";

const copy = {
  en: { home:"WEDDING HOME", kicker:"YOUR PRIVATE SPACE", title:"My Invitations", intro:"Manage your wedding invitations in one place.", create:"＋ CREATE INVITATION", limit:"You can create up to 3 invitations with this account. Draft invitations are private until published.", loading:"Loading your invitations…", empty:"Your story starts here", emptyText:"You have not created an invitation yet.", first:"CREATE YOUR FIRST INVITATION", published:"PUBLISHED", draft:"DRAFT", preview:"Preview invitation ↗", error:"Unable to load your invitations." },
  id: { home:"BERANDA WEDDING", kicker:"RUANG PRIBADIMU", title:"Undangan Saya", intro:"Kelola semua undangan pernikahanmu di satu tempat.", create:"＋ BUAT UNDANGAN", limit:"Kamu dapat membuat maksimal 3 undangan dengan akun ini. Undangan Draft bersifat pribadi sampai dipublikasikan.", loading:"Memuat undangan…", empty:"Kisahmu dimulai di sini", emptyText:"Kamu belum membuat undangan.", first:"BUAT UNDANGAN PERTAMAMU", published:"DIPUBLIKASIKAN", draft:"DRAFT", preview:"Pratinjau undangan ↗", error:"Undangan tidak dapat dimuat." }
};

export default function WeddingDashboardPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const t = copy[language] || copy.en;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.is_anonymous) { router.replace("/login?next=%2Fdf%2Fwedding%2Fdashboard"); return; }
      try {
        const response = await fetch("/api/wedding/invitations", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || t.error);
        if (alive) setItems(result.invitations || []);
      } catch (e) { if (alive) setError(e.message || t.error); }
      finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [router, t.error]);

  return <div className="df-main"><main className="wedding-page wedding-platform">
    <header className="wedding-topbar">
      <Link href="/df/wedding" className="wedding-back">← <span>{t.home}</span></Link>
      <div className="wedding-topbar-account"><WeddingAccountControls /><div className="wedding-lang"><button type="button" onClick={()=>setLanguage("en")} aria-pressed={language==="en"}>EN</button><button type="button" onClick={()=>setLanguage("id")} aria-pressed={language==="id"}>ID</button></div>
    </header>
    <div className="wedding-content wedding-platform-content">
      <section className="wedding-hero wedding-platform-heading">
        <p className="wedding-kicker">{t.kicker}</p><h1>{t.title}</h1><p className="wedding-intro">{t.intro}</p>
        <Link href="/df/wedding/create" className="wedding-primary">{t.create}</Link>
      </section>
      <section className="wedding-section wedding-platform-limit"><p>{t.limit}</p></section>
      {loading ? <p className="wedding-platform-state">{t.loading}</p> : error ? <p role="alert" className="wedding-platform-error">{error}</p> : items.length === 0 ?
        <section className="wedding-section wedding-platform-empty"><span className="wedding-platform-heart">♡</span><h2 className="wedding-section-heading">{t.empty}</h2><p className="section-copy">{t.emptyText}</p><Link href="/df/wedding/create" className="wedding-primary">{t.first}</Link></section> :
        <section className="wedding-platform-list">{items.map(item=><article key={item.id} className="wedding-section wedding-platform-invitation">
          <div className="wedding-platform-meta"><span className={item.is_active?"wedding-status-published":"wedding-status-draft"}>{item.is_active?t.published:t.draft}</span><time>{new Date(item.created_at).toLocaleDateString(language==="id"?"id-ID":"en-US")}</time></div>
          <h2>{item.title}</h2><p className="wedding-platform-slug">/df/wedding={item.slug}</p>
          <div className="wedding-platform-card-actions"><Link href={`/df/wedding/create?id=${item.id}`} className="wedding-platform-link">{language==="id"?"Lanjutkan pengaturan →":"Continue editing →"}</Link><Link href={`/df/wedding=${encodeURIComponent(item.slug)}`} className="wedding-platform-link">{t.preview}</Link></div>
        </article>)}</section>}
    </div>
    <footer className="wedding-footer"><strong>DAJJAL FAMILY · WEDDING EXPERIENCES</strong></footer>
  </main></div>;
}
