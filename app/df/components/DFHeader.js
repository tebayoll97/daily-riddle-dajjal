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
        <Link href="/df" className="df-brand" aria-label="Dajjal Family home">
          <span className="df-brand-crest" aria-hidden="true">♛</span>
          <span className="df-brand-copy">
            <strong>DAJJAL FAMILY</strong>
            <small>GAMING UNIVERSE</small>
          </span>
        </Link>
        <div className="df-header-tools">
          <nav className="df-nav" aria-label="Dajjal Family navigation">
            {navItems.map((item) => (
              <Link href={item.href} key={item.key}>{t[item.key]}</Link>
            ))}
          </nav>
          <div className="df-language-switch" aria-label="Choose language">
            <button type="button" onClick={() => setLanguage("id")} aria-pressed={language === "id"}>ID</button>
            <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
          </div>
        </div>
      </div>
    </header>
  );
}
