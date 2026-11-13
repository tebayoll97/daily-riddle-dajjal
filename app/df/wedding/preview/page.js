"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter,useSearchParams} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {useLanguage} from "@/app/components/LanguageProvider";
import WeddingAccountControls from "../WeddingAccountControls";
import "../../wedding-anak-dajjal/wedding.css";

export default function WeddingPreviewPage(){
 const router=useRouter(); const params=useSearchParams(); const id=params.get("id");
 const {language}=useLanguage(); const idLang=language==="id";
 const [data,setData]=useState(null); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 useEffect(()=>{let alive=true;(async()=>{const {data:{session}}=await supabase.auth.getSession();if(!session?.user||session.user.is_anonymous){router.replace("/login?next="+encodeURIComponent("/df/wedding/preview?id="+id));return;}const res=await fetch("/api/wedding/invitations/"+id,{headers:{Authorization:"Bearer "+session.access_token},cache:"no-store"});const json=await res.json();if(!res.ok){setError(json.error||"Gagal memuat undangan");return;}if(alive)setData(json);})();return()=>{alive=false};},[id,router]);
 async function publish(){setBusy(true);setError("");try{const {data:{session}}=await supabase.auth.getSession();const res=await fetch("/api/wedding/invitations/"+id+"/publish",{method:"POST",headers:{Authorization:"Bearer "+session.access_token}});const json=await res.json();if(!res.ok)throw new Error(json.error||"Publikasi gagal");router.replace("/df/wedding="+encodeURIComponent(json.invitation.slug));}catch(e){setError(e.message)}finally{setBusy(false)}}
 const p=data?.profile||{}, inv=data?.invitation||{};
 return <div className="df-main"><main className="wedding-page wedding-platform wedding-review-page">
 <header className="wedding-topbar"><Link href={"/df/wedding/create?id="+id} className="wedding-back">← <span>{idLang?"KEMBALI KE BUILDER":"BACK TO BUILDER"}</span></Link><div className="wedding-topbar-account"><WeddingAccountControls/></div></header>
 <div className="wedding-content wedding-platform-content">
 <section className="wedding-hero wedding-platform-heading"><p className="wedding-kicker">{idLang?"PRATINJAU UNDANGAN":"INVITATION PREVIEW"}</p><h1>{inv.title||"Wedding Invitation"}</h1><p className="wedding-intro">{idLang?"Inilah tampilan undangan yang akan dilihat oleh para tamu.":"This is how your guests will see the invitation."}</p></section>
 {!data?<p className="wedding-platform-state">{error|| (idLang?"Memuat pratinjau…":"Loading preview…")}</p>:<section className="wedding-live-preview">
 <div className="wedding-live-cover"><span>✦　❧　✦</span><p>{idLang?"DENGAN PENUH KEBAHAGIAAN":"WITH GREAT JOY"}</p><h2>{p.groom_name||"Mempelai Pria"} <i>&</i> {p.bride_name||"Mempelai Wanita"}</h2>{p.main_photo_url&&<img src={p.main_photo_url} alt="Foto pasangan"/>}<p>{p.event_date?new Date(p.event_date+"T00:00:00").toLocaleDateString(idLang?"id-ID":"en-US",{dateStyle:"long"}):"Tanggal acara"} {p.event_time?" · "+p.event_time:""}</p><p>{p.venue||"Nama tempat acara"}</p>{p.address&&<p>{p.address}</p>}</div>
 <div className="wedding-live-details"><h3>{idLang?"RANGKAIAN ACARA":"EVENT DETAILS"}</h3>{(p.event_schedule||[]).length?(p.event_schedule||[]).map((v,i)=><p key={i}>{v}</p>):<p>{idLang?"Susunan acara belum diisi.":"Event schedule has not been added."}</p>}{p.love_story&&<><h3>LOVE STORY</h3><p>{p.love_story}</p></>}{(p.gallery_urls||[]).length>0&&<><h3>{idLang?"GALERI":"GALLERY"}</h3><div className="wedding-live-gallery">{p.gallery_urls.map((url,i)=><img src={url} key={i} alt={"Wedding gallery "+(i+1)}/>)}</div></>}</div>
 </section>}
 {error&&<p className="wedding-platform-error" role="alert">{error}</p>}
 {data&&<div className="wedding-review-actions"><button className="wedding-builder-secondary" onClick={()=>router.push("/df/wedding/create?id="+id)}>{idLang?"KEMBALI EDIT":"BACK TO EDIT"}</button><button className="wedding-primary" onClick={publish} disabled={busy}>{busy?(idLang?"MEMPUBLIKASIKAN…":"PUBLISHING…"):(idLang?"PUBLISIKAN UNDANGAN":"PUBLISH INVITATION")} →</button></div>}
 </div></main></div>;
}