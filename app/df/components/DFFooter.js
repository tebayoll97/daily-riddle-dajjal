import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";

export default function DFFooter() {
  const { language } = useLanguage();
  const isId = language === "id";

  return (
    <footer className="df-footer">
      <div className="df-footer-crest" aria-hidden="true">♛</div>
      <p className="df-footer-name">DAJJAL FAMILY UNIVERSE</p>
      <p className="df-footer-tagline">{isId ? "SATU KELUARGA. CERITA TANPA BATAS." : "ONE FAMILY. ENDLESS STORIES."}</p>
      <div className="df-footer-links">
        <Link href="/df">{isId ? "Beranda DF" : "DF Home"}</Link>
        <Link href="/games">{isId ? "Game" : "Games"}</Link>
      </div>
      <small>© {new Date().getFullYear()} Dajjal Family. {isId ? "Hak cipta dilindungi." : "All rights reserved."}</small>
    </footer>
  );
}
