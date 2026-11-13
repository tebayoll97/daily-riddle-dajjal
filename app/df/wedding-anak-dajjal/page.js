"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useLanguage } from "../../components/LanguageProvider";
import "./wedding.css";

const words = {
  en: {
    eyebrow: "A LITTLE CELEBRATION, A LOT OF LOVE",
    title: "The Royal Wedding",
    invite: "You are warmly invited to celebrate",
    couple: "Anak Dajjal & Malika",
    open: "OPEN INVITATION",
    opened: "THE INVITATION IS OPEN",
    intro: "Two characters, one joyful chapter. Join us for a day filled with smiles, warmth, and treasured memories.",
    reception: "Wedding Reception",
    date: "Date to be announced",
    venue: "Venue to be announced",
    time: "Time to be announced",
    schedule: "The Celebration",
    scheduleText: "Reception details and schedule will be announced soon.",
    rsvp: "Kindly Respond",
    rsvpText: "Let us know if you can join the celebration.",
    name: "Your name",
    guests: "Number of guests",
    attendance: "Will you attend?",
    yes: "Joyfully attending",
    no: "Unable to attend",
    send: "SEND RSVP",
    guestbook: "Guestbook",
    guestbookText: "Leave a kind note for the happy couple.",
    message: "Your message",
    sign: "WRITE A MESSAGE",
    note: "Guestbook messages will appear after admin approval.",
    footer: "ONE FAMILY. ENDLESS STORIES.",
    coming: "This feature is being prepared. Your information has not been sent yet.",
    music: "MUSIC",
    musicSoon: "Piano music will be added before launch.",
    share: "SHARE INVITATION",
    copy: "COPY LINK",
    copied: "Link copied",
    count: "Guests",
    rsvpSuccess: "Thank you. Your RSVP has been received.",
    guestbookSuccess: "Thank you. Your message was sent for approval.",
    submitError: "Something went wrong. Please try again.",
    sending: "SENDING…",
    musicOff: "MUSIC OFF",
    musicOn: "MUSIC ON",
    photoAlt: "Anak Dajjal and Malika",
  },
  id: {
    eyebrow: "SEDIKIT KEMERIAHAN, BANYAK CINTA",
    title: "Pernikahan Kerajaan",
    invite: "Dengan hangat kami mengundang Anda untuk merayakan",
    couple: "Anak Dajjal & Malika",
    open: "BUKA UNDANGAN",
    opened: "UNDANGAN TELAH DIBUKA",
    intro: "Dua karakter, satu babak penuh keceriaan. Mari rayakan hari istimewa dengan senyum, kehangatan, dan kenangan indah.",
    reception: "Resepsi Pernikahan",
    date: "Tanggal akan diumumkan",
    venue: "Lokasi akan diumumkan",
    time: "Waktu akan diumumkan",
    schedule: "Rangkaian Acara",
    scheduleText: "Informasi resepsi dan susunan acara akan diumumkan segera.",
    rsvp: "Konfirmasi Kehadiran",
    rsvpText: "Beri tahu kami apakah Anda dapat hadir di perayaan ini.",
    name: "Nama Anda",
    guests: "Jumlah tamu",
    attendance: "Apakah Anda akan hadir?",
    yes: "Dengan senang hati hadir",
    no: "Maaf, belum bisa hadir",
    send: "KIRIM RSVP",
    guestbook: "Buku Tamu",
    guestbookText: "Tinggalkan pesan manis untuk kedua mempelai.",
    message: "Pesan Anda",
    sign: "TULIS PESAN",
    note: "Pesan buku tamu akan ditampilkan setelah disetujui admin.",
    footer: "SATU KELUARGA. CERITA TANPA BATAS.",
    coming: "Fitur ini sedang disiapkan. Informasi Anda belum dikirim.",
    music: "MUSIK",
    musicSoon: "Musik piano akan ditambahkan sebelum peluncuran.",
    share: "BAGIKAN UNDANGAN",
    copy: "SALIN TAUTAN",
    copied: "Tautan disalin",
    count: "Tamu",
    rsvpSuccess: "Terima kasih. Konfirmasi kehadiran Anda sudah diterima.",
    guestbookSuccess: "Terima kasih. Pesan Anda dikirim untuk ditinjau admin.",
    submitError: "Terjadi kendala. Silakan coba kembali.",
    sending: "MENGIRIM…",
    musicOff: "MUSIK MATI",
    musicOn: "MUSIK NYALA",
    photoAlt: "Anak Dajjal dan Malika",
  },
};

export default function WeddingInvitationPage() {
  const { language, setLanguage } = useLanguage();
  const t = words[language] || words.en;
  const [opened, setOpened] = useState(false);
  const [musicNotice, setMusicNotice] = useState(false);
  const [formNotice, setFormNotice] = useState(false);
  const [copied, setCopied] = useState(false);

  const guestName = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("to") || "";
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const shareInvite = () => {
    const text = encodeURIComponent(
      language === "id"
        ? "Dengan hangat, kami mengundang Anda ke perayaan Anak Dajjal & Malika."
        : "You are warmly invited to celebrate Anak Dajjal & Malika."
    );
    window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(window.location.href)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="wedding-page">
      <div className="wedding-topbar">
        <a className="wedding-back" href="/df">♛ <span>DAJJAL FAMILY UNIVERSE</span></a>
        <div className="wedding-tools">
          <div className="wedding-lang" role="group" aria-label="Choose language">
            <button type="button" onClick={() => setLanguage("id")} aria-pressed={language === "id"}>🇮🇩 ID</button>
            <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>🇬🇧 EN</button>
          </div>
          <button className="wedding-music" type="button" onClick={toggleMusic} disabled={!eventInfo?.music_url} aria-pressed={musicOn}>{musicOn ? t.musicOn : t.musicOff} ♫</button>
        </div>
      </div>

      {!opened && (
        <section className="wedding-opening">
          <div className="opening-sparkle">✦　❧　✦</div>
          <p className="wedding-kicker">{t.eyebrow}</p>
          <div className="envelope" aria-hidden="true">
            <div className="envelope-card"><span>♛</span><small>YOU ARE INVITED</small><strong>A & M</strong></div>
            <div className="envelope-flap" />
          </div>
          <p className="opening-invite">{t.invite}</p>
          <h1>{t.couple}</h1>
          {guestName && <p className="guest-name">{language === "id" ? "Kepada Yth." : "Dear"} {guestName}</p>}
          <button className="wedding-primary" type="button" onClick={() => { setOpened(true); if (eventInfo?.music_url && audioRef.current) audioRef.current.play().then(() => setMusicOn(true)).catch(() => setMusicOn(false)); }}>{t.open} <span>✧</span></button>
          <p className="opening-footnote">ROYAL PLAYFUL EDITION</p>
        </section>
      )}

      {opened && (
        <div className="wedding-content">
          <section className="wedding-hero">
            <div className="wedding-ornament">✦ ❧ ✦</div>
            <p className="wedding-kicker">{t.opened}</p>
            <h1>{t.title}</h1>
            <p className="wedding-intro">{t.intro}</p>
            <div className="couple-frame">
              <div className="couple-placeholder">
                <span className="placeholder-crown">♛</span>
                <strong>ANAK DAJJAL</strong>
                <span className="placeholder-amp">&</span>
                <strong>MALIKA</strong>
                <small>THE COUPLE&apos;S PHOTO WILL APPEAR HERE</small>
              </div>
              <span className="frame-corner frame-tl">✦</span><span className="frame-corner frame-tr">✦</span>
              <span className="frame-corner frame-bl">✦</span><span className="frame-corner frame-br">✦</span>
            </div>
            <h2 className="couple-names">{t.couple}</h2>
            <p className="couple-subtitle">MALIKA — KEDELAI HITAM PILIHAN</p>
          </section>

          <section className="wedding-section">
            <p className="wedding-kicker">SAVE THE CELEBRATION</p>
            <h2>{t.reception}</h2>
            <div className="detail-grid">
              <article><span>◷</span><h3>{eventInfo?.event_date ? new Date(`${eventInfo.event_date}T00:00:00`).toLocaleDateString(language === "id" ? "id-ID" : "en-US", { dateStyle: "long" }) : t.date}</h3><p>DATE</p></article>
              <article><span>⌖</span><h3>{eventInfo?.venue || t.venue}</h3><p>LOCATION</p></article>
              <article><span>♧</span><h3>{eventInfo?.event_time || t.time}</h3><p>TIME</p></article>
            </div>
            <div className="wedding-note">{t.schedule}<p>{eventInfo?.schedule || t.scheduleText}</p></div>
          </section>

          <section className="wedding-section wedding-form-section">
            <p className="wedding-kicker">WE HOPE YOU CAN JOIN</p>
            <h2>{t.rsvp}</h2>
            <p className="section-copy">{t.rsvpText}</p>
            <form className="wedding-form" onSubmit={submitRsvp}>
              <label>{t.name}<input required name="guest_name" placeholder={t.name} maxLength={100} /></label>
              <label>{t.guests}<input required name="guest_count" type="number" min="1" step="1" defaultValue="1" /></label>
              <label>{t.attendance}<select name="attendance" defaultValue="yes"><option value="yes">{t.yes}</option><option value="no">{t.no}</option></select></label>
              <button className="wedding-primary" type="submit">{t.send}</button>
              {formNotice && <p className="form-notice" role="status">{t.coming}</p>}
            </form>
          </section>

          <section className="wedding-section wedding-guestbook">
            <p className="wedding-kicker">WORDS FROM THE HEART</p>
            <h2>{t.guestbook}</h2>
            <p className="section-copy">{t.guestbookText}</p>
            <form className="wedding-form" onSubmit={submitGuestbook}>
              <label>{t.name}<input required name="guestbook_name" maxLength="100" placeholder={t.name} /></label>
              <label>{t.message}<textarea required name="guestbook_message" rows="4" maxLength="500" placeholder={t.message} /></label>
              <button className="wedding-primary" type="submit" disabled={guestbookLoading}>{guestbookLoading ? t.sending : t.sign}</button>\n              {guestbookStatus && <p className="form-notice" role="status">{guestbookStatus === "success" ? t.guestbookSuccess : t.submitError}</p>}
            </form>
            <p className="guestbook-note">✧ {t.note}</p>\n            {guestbookEntries.length > 0 && <div className="approved-messages">{guestbookEntries.map((entry) => <article key={entry.id}><strong>{entry.guest_name}</strong><p>{entry.message}</p></article>)}</div>}
          </section>

          <section className="wedding-share">
            <p className="wedding-kicker">SPREAD THE JOY</p>
            <h2>{t.couple}</h2>
            <div className="share-actions">
              <button type="button" onClick={shareInvite}>{t.share}</button>
              <button type="button" onClick={copyLink}>{copied ? t.copied : t.copy}</button>
            </div>
          </section>
        </div>
      )}

      <footer className="wedding-footer">
        <span>♛</span>
        <strong>DAJJAL FAMILY UNIVERSE</strong>
        <small>{t.footer}</small>
      </footer>

      {eventInfo?.music_url && <audio ref={audioRef} src={eventInfo.music_url} loop preload="none" /> }
    </main>
  );
}
