import Link from "next/link";

const cards = [
  { icon: "♛", title: "The Family", description: "Meet the characters and personalities behind the Dajjal Family universe." },
  { icon: "✧", title: "Gallery", description: "A collection of memorable moments, portraits, and family memories." },
  { icon: "⚔", title: "Games", description: "Explore the games and adventures inside our universe.", href: "/games" },
];

export default function DajjalFamilyHome() {
  return (
    <main className="df-home">
      <section className="df-hero">
        <p className="df-eyebrow">WELCOME TO OUR UNIVERSE</p>
        <h1>DAJJAL FAMILY<span>GAMING UNIVERSE</span></h1>
        <p className="df-hero-copy">
          A place for our characters, games, stories, and unforgettable family moments.
          One universe, many personalities, countless adventures.
        </p>
        <div className="df-hero-actions">
          <Link href="#projects" className="df-button">EXPLORE PROJECTS</Link>
          <Link href="#events" className="df-button df-button-secondary">VIEW EVENTS</Link>
        </div>
      </section>

      <section className="df-section" id="family">
        <h2 className="df-section-heading">Inside the Family</h2>
        <p className="df-section-subtitle">Different characters. One extraordinary universe.</p>
        <div className="df-card-grid">
          {cards.map((card) => {
            const content = (
              <>
                <span className="df-card-icon" aria-hidden="true">{card.icon}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </>
            );
            return card.href ? (
              <Link href={card.href} className="df-card" key={card.title} style={{ textDecoration: "none" }}>{content}</Link>
            ) : (
              <article className="df-card" key={card.title}>{content}</article>
            );
          })}
        </div>
      </section>

      <section className="df-section" id="projects">
        <h2 className="df-section-heading">Featured Projects</h2>
        <p className="df-section-subtitle">A growing collection of experiences from the DF universe.</p>
        <div className="df-card-grid">
          <article className="df-card">
            <span className="df-card-icon" aria-hidden="true">✦</span>
            <h3>DF Digital Experiences</h3>
            <p>Special pages, creative experiments, and interactive family projects.</p>
          </article>
          <article className="df-card">
            <span className="df-card-icon" aria-hidden="true">♜</span>
            <h3>Stories & Characters</h3>
            <p>Discover the personalities and stories that shape our universe.</p>
          </article>
          <article className="df-card">
            <span className="df-card-icon" aria-hidden="true">◇</span>
            <h3>Coming Soon</h3>
            <p>More experiences will be added to the DF universe.</p>
          </article>
        </div>
      </section>

      <section className="df-section" id="games">
        <h2 className="df-section-heading">Games Universe</h2>
        <p className="df-section-subtitle">Continue your adventure in the gaming world.</p>
        <div className="df-event-card">
          <div>
            <h3>Dajjal Family Games</h3>
            <p>Discover the games available in our main universe.</p>
          </div>
          <Link href="/games" className="df-button">ENTER GAMES</Link>
        </div>
      </section>

      <section className="df-section" id="events">
        <h2 className="df-section-heading">Family Events</h2>
        <p className="df-section-subtitle">Special moments deserve their own place.</p>
        <div className="df-event-card">
          <div>
            <h3>The Royal Wedding</h3>
            <p>Anak Dajjal & Malika · Digital Wedding Invitation</p>
          </div>
          <Link href="/df/wedding-anak-dajjal" className="df-button">OPEN INVITATION</Link>
        </div>
      </section>
    </main>
  );
}
