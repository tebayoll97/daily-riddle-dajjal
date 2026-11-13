"use client";

// Keep this route explicitly on the client: it reads the shared language context.

import Link from "next/link";

const copy = {
  en: {
    eyebrow: "WELCOME TO OUR UNIVERSE",
    title: "DAJJAL FAMILY",
    subtitle: "UNIVERSE",
    intro: "A home for our family, characters, games, stories, creative projects, and unforgettable moments. One family, endless stories.",
    explore: "EXPLORE PROJECTS",
    viewEvents: "VIEW EVENTS",
    family: "Inside the Family",
    familySub: "Different characters. One extraordinary universe.",
    cards: [
      ["The Family", "Meet the characters and personalities behind the Dajjal Family universe."],
      ["Gallery", "A collection of memorable moments, portraits, and family memories."],
      ["Games", "Explore the games and adventures inside our universe."],
    ],
    projects: "Featured Projects",
    projectsSub: "A growing collection of experiences from the DF universe.",
    projectCards: [
      ["DF Digital Experiences", "Special pages, creative experiments, and interactive family projects."],
      ["Stories & Characters", "Discover the personalities and stories that shape our universe."],
      ["Coming Soon", "More experiences will be added to the DF universe."],
    ],
    games: "Games",
    gamesSub: "A playful corner of the Dajjal Family universe.",
    gamesTitle: "Dajjal Family Games",
    gamesText: "Discover the games available in our family universe.",
    enterGames: "ENTER GAMES",
    events: "Family Events",
    eventsSub: "Special moments deserve their own place.",
    wedding: "The Royal Wedding",
    weddingText: "Anak Dajjal & Malika · Digital Wedding Invitation",
    openInvite: "OPEN INVITATION",
  },
  id: {
    eyebrow: "SELAMAT DATANG DI UNIVERSE KAMI",
    title: "DAJJAL FAMILY",
    subtitle: "UNIVERSE",
    intro: "Rumah bagi keluarga, karakter, game, cerita, proyek kreatif, dan momen tak terlupakan. Satu keluarga, cerita tanpa batas.",
    explore: "JELAJAHI PROYEK",
    viewEvents: "LIHAT ACARA",
    family: "Di Dalam Keluarga",
    familySub: "Karakter yang berbeda. Satu universe yang luar biasa.",
    cards: [
      ["Keluarga", "Kenali karakter dan kepribadian di balik universe Dajjal Family."],
      ["Galeri", "Kumpulan momen berkesan, potret, dan kenangan keluarga."],
      ["Game", "Jelajahi game dan petualangan di dalam universe kami."],
    ],
    projects: "Proyek Unggulan",
    projectsSub: "Kumpulan pengalaman yang terus berkembang dari universe DF.",
    projectCards: [
      ["Pengalaman Digital DF", "Halaman khusus, eksperimen kreatif, dan proyek keluarga interaktif."],
      ["Cerita & Karakter", "Kenali kepribadian dan cerita yang membentuk universe kami."],
      ["Segera Hadir", "Lebih banyak pengalaman akan ditambahkan ke universe DF."],
    ],
    games: "Game",
    gamesSub: "Sudut penuh keseruan di dalam universe Dajjal Family.",
    gamesTitle: "Game Dajjal Family",
    gamesText: "Jelajahi berbagai game di dalam universe keluarga kami.",
    enterGames: "MASUK KE GAME",
    events: "Acara Keluarga",
    eventsSub: "Momen istimewa layak memiliki tempatnya sendiri.",
    wedding: "Pernikahan Kerajaan",
    weddingText: "Anak Dajjal & Malika · Undangan Pernikahan Digital",
    openInvite: "BUKA UNDANGAN",
  },
};

export default function DajjalFamilyHome() {
  const t = copy.en;

  return (
    <main className="df-home">
      <section className="df-hero">
        <p className="df-eyebrow">{t.eyebrow}</p>
        <h1>{t.title}<span>{t.subtitle}</span></h1>
        <p className="df-hero-copy">{t.intro}</p>
        <div className="df-hero-actions">
          <Link href="#projects" className="df-button">{t.explore}</Link>
          <Link href="#events" className="df-button df-button-secondary">{t.viewEvents}</Link>
        </div>
      </section>

      <section className="df-section" id="family">
        <h2 className="df-section-heading">{t.family}</h2>
        <p className="df-section-subtitle">{t.familySub}</p>
        <div className="df-card-grid">
          {t.cards.map((card, index) => (
            <article className="df-card" key={card[0]}>
              <span className="df-card-icon" aria-hidden="true">{["♛", "✧", "⚔"][index]}</span>
              <h3>{card[0]}</h3><p>{card[1]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="df-section" id="projects">
        <h2 className="df-section-heading">{t.projects}</h2>
        <p className="df-section-subtitle">{t.projectsSub}</p>
        <div className="df-card-grid">
          {t.projectCards.map((card, index) => (
            <article className="df-card" key={card[0]}>
              <span className="df-card-icon" aria-hidden="true">{["✦", "♜", "◇"][index]}</span>
              <h3>{card[0]}</h3><p>{card[1]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="df-section" id="games">
        <h2 className="df-section-heading">{t.games}</h2>
        <p className="df-section-subtitle">{t.gamesSub}</p>
        <div className="df-event-card">
          <div><h3>{t.gamesTitle}</h3><p>{t.gamesText}</p></div>
          <Link href="/games" className="df-button">{t.enterGames}</Link>
        </div>
      </section>

      <section className="df-section" id="events">
        <h2 className="df-section-heading">{t.events}</h2>
        <p className="df-section-subtitle">{t.eventsSub}</p>
        <div className="df-event-card">
          <div><h3>{t.wedding}</h3><p>{t.weddingText}</p></div>
          <Link href="/df/wedding-anak-dajjal" className="df-button">{t.openInvite}</Link>
        </div>
      </section>
    </main>
  );
}
