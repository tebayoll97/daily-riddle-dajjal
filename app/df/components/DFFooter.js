import Link from "next/link";

export default function DFFooter() {
  return (
    <footer className="df-footer">
      <div className="df-footer-crest" aria-hidden="true">♛</div>
      <p className="df-footer-name">DAJJAL FAMILY</p>
      <p className="df-footer-tagline">A ROYAL FAMILY. A DARK UNIVERSE.</p>
      <div className="df-footer-links">
        <Link href="/df">DF Home</Link>
        <Link href="/games">Games</Link>
      </div>
      <small>© {new Date().getFullYear()} Dajjal Family. All rights reserved.</small>
    </footer>
  );
}
