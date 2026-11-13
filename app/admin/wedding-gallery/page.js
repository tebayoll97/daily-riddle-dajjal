"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseAdminClient } from "@/lib/supabaseAdminClient";

const SLUG = "anak-dajjal-malika";
const input = "mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-pink-400/60";
const label = "block text-xs font-bold text-gray-300";
function driveUrl(value) {
  try {
    const u = new URL(String(value || "").trim());
    if (u.hostname.endsWith("drive.google.com")) {
      const id = u.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || u.searchParams.get("id");
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
    }
    return u.protocol === "https:" ? u.href : "";
  } catch { return ""; }
}
function Panel({ title, subtitle, open, onClick, children }) {
  return <section className="overflow-hidden rounded-2xl border border-pink-300/20 bg-[#15111f]">
    <button type="button" onClick={onClick} aria-expanded={open} className="flex w-full items-center justify-between gap-4 p-5 text-left">
      <span><strong className="block font-extrabold">{title}</strong><small className="mt-1 block text-gray-400">{subtitle}</small></span><b className="text-xl text-pink-300">{open ? "−" : "+"}</b>
    </button>{open && <div className="border-t border-white/10 p-5">{children}</div>}
  </section>;
}
export default function WeddingGalleryAdminPage() {
  const router = useRouter();
  const [checking,setChecking]=useState(true), [invite,setInvite]=useState(null), [items,setItems]=useState([]);
  const [event,setEvent]=useState({event_title:"The Royal Wedding — Anak Dajjal & Malika",event_date:"",event_time:"",venue:"",schedule:"",music_url:"",couple_photo_url:""});
  const [cover,setCover]=useState(""), [urls,setUrls]=useState(""), [album,setAlbum]=useState("Prewedding"), [description,setDescription]=useState("");
  const [panel,setPanel]=useState("cover"), [busy,setBusy]=useState(false), [toast,setToast]=useState(""), [error,setError]=useState("");
  const notify=(s)=>{setToast(s);window.setTimeout(()=>setToast(""),3200);};
  const load=useCallback(async()=>{
    const {data:i,error:ie}=await supabaseAdminClient.from("df_invitations").select("*").eq("slug",SLUG).single(); if(ie) throw ie;
    const [{data:s,error:se},{data:g,error:ge}]=await Promise.all([
      supabaseAdminClient.from("df_event_settings").select("*").eq("invitation_id",i.id).maybeSingle(),
      supabaseAdminClient.from("df_gallery_items").select("*").eq("invitation_id",i.id).order("sort_order").order("created_at",{ascending:false})
    ]);
    if(se) throw se;if(ge) throw ge;setInvite(i);if(s){setEvent({...event,...s,event_date:s.event_date||""});setCover(s.couple_photo_url||"");}setItems(g||[]);
  },[]);
  useEffect(()=>{let active=true;(async()=>{try{const {data,error:e}=await supabaseAdminClient.auth.getSession();if(e)throw e;if(!data?.session){router.replace("/admin/login");return;}const r=await fetch("/api/admin/me",{headers:{Authorization:`Bearer ${data.session.access_token}`},cache:"no-store"});if(!r.ok){router.replace("/admin/login");return;}if(active)await load();}catch(e){if(active)setError(e.message);}finally{if(active)setChecking(false);}})();return()=>{active=false;};},[router,load]);
  async function saveCover(e){e.preventDefault();setBusy(true);setError("");const url=driveUrl(cover);if(!url){setError("Masukkan URL HTTPS atau link Google Drive yang valid.");setBusy(false);return;}try{const {error:e}=await supabaseAdminClient.from("df_event_settings").upsert({invitation_id:invite.id,event_title:event.event_title,couple_photo_url:url},{onConflict:"invitation_id"});if(e)throw e;setCover(url);setEvent(v=>({...v,couple_photo_url:url}));notify("Foto utama berhasil diperbarui.");}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function saveDetails(e){e.preventDefault();setBusy(true);setError("");try{const {error:e}=await supabaseAdminClient.from("df_event_settings").upsert({invitation_id:invite.id,event_title:event.event_title||"Wedding Invitation",event_date:event.event_date||null,event_time:event.event_time||null,venue:event.venue||null,schedule:event.schedule||null,music_url:event.music_url||null,couple_photo_url:event.couple_photo_url||null},{onConflict:"invitation_id"});if(e)throw e;notify("Detail undangan berhasil disimpan.");}catch(e){setError(e.message);}finally{setBusy(false);}}
  const testImage=(url)=>new Promise(resolve=>{const im=new Image();let done=false;const finish=v=>{if(!done){done=true;resolve(v);}};im.onload=()=>finish(true);im.onerror=()=>finish(false);im.src=url;window.setTimeout(()=>finish(false),8000);});
  async function saveBatch(e){e.preventDefault();setBusy(true);setError("");let saved=0,skipped=0;try{const lines=urls.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(!lines.length)throw new Error("Masukkan minimal satu URL.");const normalized=lines.map(driveUrl);skipped+=normalized.filter(x=>!x).length;const unique=[...new Set(normalized.filter(Boolean))];const existing=new Set(items.map(x=>x.image_url));let order=items.length;for(const url of unique){if(existing.has(url)||!(await testImage(url))){skipped++;continue;}const {error:e}=await supabaseAdminClient.from("df_gallery_items").insert({invitation_id:invite.id,title:`Wedding Photo ${String(order+1).padStart(3,"0")}`,description:description.trim(),album:album.trim()||"Wedding",image_url:url,storage_path:null,is_published:true,sort_order:order});if(e)throw e;existing.add(url);order++;saved++;}await load();setUrls("");notify(`${saved} foto dipublikasikan.${skipped? ` ${skipped} URL dilewati.`:""}`);}catch(e){setError(e.message||"Gagal menyimpan foto.");await load();}finally{setBusy(false);}}
  async function toggle(item){setBusy(true);try{const {error:e}=await supabaseAdminClient.from("df_gallery_items").update({is_published:!item.is_published}).eq("id",item.id);if(e)throw e;await load();notify(item.is_published?"Foto disembunyikan.":"Foto dipublikasikan.");}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function remove(item){if(!window.confirm("Hapus foto ini?"))return;setBusy(true);try{const {error:e}=await supabaseAdminClient.from("df_gallery_items").delete().eq("id",item.id);if(e)throw e;if(item.storage_path)await supabaseAdminClient.storage.from("df-wedding-gallery").remove([item.storage_path]);await load();notify("Foto berhasil dihapus.");}catch(e){setError(e.message);}finally{setBusy(false);}}
  if(checking)return <main className="min-h-screen bg-[#080711] text-purple-200 grid place-items-center">MEMVERIFIKASI ADMIN...</main>;
  return <main className="min-h-screen bg-[#080711] px-4 py-8 text-white sm:px-6"><div className="mx-auto max-w-5xl">
    <Link href="/admin" className="inline-flex rounded-lg border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-200">← KEMBALI KE DASHBOARD</Link>
    <header className="my-7"><p className="text-[10px] font-extrabold tracking-[.22em] text-pink-300">DAJJAL FAMILY · WEDDING MANAGEMENT</p><h1 className="mt-2 text-3xl font-black">WEDDING <span className="text-pink-300">MANAGER</span></h1><p className="mt-2 text-sm text-gray-400">{invite?.title}</p><p className="text-xs text-cyan-200">URL: /df/wedding={invite?.slug}</p></header>
    {error&&<p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
    <div className="space-y-4">
      <Panel title="01 · Foto Utama Pasangan" subtitle="Foto yang tampil di panel pembuka undangan." open={panel==="cover"} onClick={()=>setPanel(panel==="cover"?"":"cover")}><form onSubmit={saveCover} className="space-y-4"><label className={label}>URL foto Google Drive / HTTPS<input className={input} value={cover} onChange={e=>setCover(e.target.value)} placeholder="Tempel link foto di sini"/></label>{event.couple_photo_url&&<img src={event.couple_photo_url} alt="Foto utama" className="max-h-64 w-full rounded-xl object-contain"/>}<button disabled={busy} className="rounded-xl bg-pink-600 px-5 py-3 text-sm font-bold">{busy?"MENYIMPAN...":"SIMPAN FOTO UTAMA"}</button></form></Panel>
      <Panel title="02 · Album Prewedding / Wedding" subtitle="Banyak URL sekaligus, satu URL per baris. Foto valid langsung Published." open={panel==="album"} onClick={()=>setPanel(panel==="album"?"":"album")}><form onSubmit={saveBatch} className="space-y-4"><label className={label}>Daftar URL<textarea className={input} rows={6} value={urls} onChange={e=>setUrls(e.target.value)} placeholder={"https://drive.google.com/file/d/ID1/view\nhttps://drive.google.com/file/d/ID2/view"}/></label><div className="grid gap-4 sm:grid-cols-2"><label className={label}>Album<input className={input} value={album} onChange={e=>setAlbum(e.target.value)}/></label><label className={label}>Deskripsi umum<input className={input} value={description} onChange={e=>setDescription(e.target.value)}/></label></div><button disabled={busy||!urls.trim()} className="rounded-xl bg-pink-600 px-5 py-3 text-sm font-bold">{busy?"MEMERIKSA FOTO...":"SIMPAN & PUBLISH FOTO"}</button></form><h3 className="mb-3 mt-7 font-bold">Foto tersimpan ({items.length})</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{items.map(item=><article key={item.id} className="overflow-hidden rounded-xl border border-white/10"><img src={item.image_url} alt={item.title} className="aspect-[4/3] w-full object-cover"/><div className="p-3"><p className="truncate text-xs font-bold">{item.title}</p><p className="text-[10px] text-gray-400">{item.album}</p><div className="mt-2 flex gap-2"><button disabled={busy} onClick={()=>toggle(item)} className="flex-1 rounded border border-pink-300/20 p-2 text-[10px]">{item.is_published?"Sembunyikan":"Publish"}</button><button disabled={busy} onClick={()=>remove(item)} className="rounded border border-red-400/20 p-2 text-[10px] text-red-200">Hapus</button></div></div></article>)}</div></Panel>
      <Panel title="03 · Tanggal & Detail Acara" subtitle="Atur tanggal, waktu, lokasi, susunan acara, dan musik." open={panel==="details"} onClick={()=>setPanel(panel==="details"?"":"details")}><form onSubmit={saveDetails} className="space-y-4"><label className={label}>Judul undangan<input className={input} value={event.event_title||""} onChange={e=>setEvent({...event,event_title:e.target.value})}/></label><div className="grid gap-4 sm:grid-cols-2"><label className={label}>Tanggal<input type="date" className={input} value={event.event_date||""} onChange={e=>setEvent({...event,event_date:e.target.value})}/></label><label className={label}>Waktu<input className={input} value={event.event_time||""} onChange={e=>setEvent({...event,event_time:e.target.value})} placeholder="18.00 WIB"/></label></div><label className={label}>Lokasi<input className={input} value={event.venue||""} onChange={e=>setEvent({...event,venue:e.target.value})}/></label><label className={label}>Susunan acara<textarea rows={3} className={input} value={event.schedule||""} onChange={e=>setEvent({...event,schedule:e.target.value})}/></label><label className={label}>URL musik<input className={input} value={event.music_url||""} onChange={e=>setEvent({...event,music_url:e.target.value})}/></label><button disabled={busy} className="rounded-xl bg-pink-600 px-5 py-3 text-sm font-bold">{busy?"MENYIMPAN...":"SIMPAN DETAIL UNDANGAN"}</button></form></Panel>
    </div>{toast&&<div role="status" className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-300/30 bg-[#123329] p-4 text-center text-sm font-bold text-emerald-100 shadow-2xl">{toast}</div>}
  </div></main>;
}
