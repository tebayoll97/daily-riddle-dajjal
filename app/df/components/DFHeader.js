"use client";

import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";

const labels = {
  en: { home: "Home", family: "Family", projects: "Projects", games: "Games", events: "Events" },
  id: { home: "Beranda", family: "Keluarga", projects: "Proyek", games: "Game", events: "Acara" },
};

const navItems = [
  { href: "/df", key: "home" },
  { href: "/df#family", key: "family" },
  { href: "/df#projects", key: "projects" },
  { href: "/df#games", key: "games" },
  { href: "/df#events", key: "events" },
];

export default function DFHeader() {
  const { language, setLanguage } = useLanguage();
  const t = labels[language] || labels.en;

  return (
    <header className="df-header">
      <div className="df-header-inner">
        <Link href="/df" className="df-brand" aria-label="Dajjal Family Universe home">
          <span className="df-brand-crest" aria-hidden="true">♛</span>
          <span className="df-brand-copy">
            <strong>DAJJAL FAMILY</strong>
            <small>UNIVERSE</small>
          </span>
        </Link>
        <div className="df-header-tools">
          <nav className="df-nav" aria-label="Dajjal Family navigation">
            {navItems.map((item) => (
              <Link href={item.href} key={item.key}>{t[item.key]}</Link>
            ))}
          </nav>
          <div className="df-language-control" role="group" aria-label={language === "id" ? "Pilih bahasa" : "Choose language"}>
            <span className="df-language-label">{language === "id" ? "BAHASA" : "LANGUAGE"}</span>
            <div className="df-language-switch">
              <button type="button" onClick={() => setLanguage("id")} aria-pressed={language === "id"} aria-label="Bahasa Indonesia">
                <span aria-hidden="true">🇮🇩</span><span>ID</span>
              </button>
              <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"} aria-label="English">
                <span aria-hidden="true">🇬🇧</span><span>EN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
