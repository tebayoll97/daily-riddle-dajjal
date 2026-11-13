import Link from "next/link";

const navItems = [
  { href: "/df", label: "Home" },
  { href: "/df#family", label: "Family" },
  { href: "/df#projects", label: "Projects" },
  { href: "/df#games", label: "Games" },
  { href: "/df#events", label: "Events" },
];

export default function DFHeader() {
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
        <nav className="df-nav" aria-label="Dajjal Family navigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
