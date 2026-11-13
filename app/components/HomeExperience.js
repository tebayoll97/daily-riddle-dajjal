"use client";

import Link from "next/link";
import { useState } from "react";

const primary = [
  { href: "/", icon: "⌂", label: "Home" },
  { href: "/games", icon: "▣", label: "Gaming" },
  { href: "/knowledge", icon: "▤", label: "Knowledge" },
  { href: "/blog", icon: "✎", label: "Blog" },
  { href: "/digital-products", icon: "◇", label: "Digital Products" },
  { href: "/business", icon: "↗", label: "Business" },
  { href: "/community", icon: "◎", label: "Community" },
];

const discovery = [
  { href: "#featured", icon: "✦", label: "Featured" },
  { href: "#latest", icon: "◷", label: "Latest Updates" },
  { href: "#categories", icon: "⌕", label: "Explore Categories" },
  { href: "/about", icon: "ⓘ", label: "About Us" },
  { href: "/contact", icon: "✉", label: "Contact" },
];

const categories = [
  { n: "01", title: "Gaming", text: "Games, interactive experiences, player tools, and gaming projects.", href: "/games", icon: "▣", tag: "PLAY & EXPLORE" },
  { n: "02", title: "Knowledge", text: "Useful insights, educational resources, explainers, and practical guides.", href: "/knowledge", icon: "▤", tag: "LEARN SOMETHING" },
  { n: "03", title: "Blog", text: "Stories, ideas, updates, and perspectives from across our universe.", href: "/blog", icon: "✎", tag: "READ & DISCOVER" },
  { n: "04", title: "Digital Products", text: "E-books, templates, creative assets, and useful digital resources.", href: "/digital-products", icon: "◇", tag: "DIGITAL STORE" },
  { n: "05", title: "Business", text: "Our services, ventures, collaborations, and business initiatives.", href: "/business", icon: "↗", tag: "BUILD TOGETHER" },
  { n: "06", title: "Community", text: "A place to connect, share experiences, and grow together.", href: "/community", icon: "◎", tag: "JOIN THE COMMUNITY" },
];

function NavLinks({ items, onNavigate }) {
  return <>{items.map((item) => <Link key={item.href} href={item.href} onClick={onNavigate} className="df-nav-link"><span className="df-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></Link>)}</>;
}

function Sidebar({ right = false }) {
  return <aside className={right ? "df-sidebar df-sidebar-right" : "df-sidebar df-sidebar-left"}>
    {right ? <>
      <div className="df-side-heading">DISCOVER</div>
      <nav className="df-nav-list" aria-label="Discovery navigation"><NavLinks items={discovery}/></nav>
      <div className="df-side-card df-side-highlight"><span className="df-mini-label">THE DF PROMISE</span><strong>One Family.<br/>Many Possibilities.</strong><p>A growing digital universe built around ideas, experiences, and people.</p></div>
      <div className="df-side-card"><span className="df-mini-label">OUR UNIVERSE</span><p>Gaming · Knowledge · Creativity · Products · Business · Community</p></div>
      <div className="df-side-footer"><Link href="/about">Learn about Dajjal Family ↗</Link></div>
    </> : <>
      <Link href="/" className="df-brand"><span className="df-brand-mark">DF</span><span><strong>DAJJAL FAMILY</strong><small>ONE FAMILY. MANY POSSIBILITIES.</small></span></Link>
      <div className="df-side-heading">MAIN MENU</div>
      <nav className="df-nav-list" aria-label="Main navigation"><NavLinks items={primary}/></nav>
      <div className="df-side-bottom"><div className="df-side-card"><span className="df-mini-label">A WORLD OF POSSIBILITIES</span><p>Explore ideas, experiences, and projects made to grow.</p></div><span className="df-version">DAJJALFAMILY.COM</span></div>
    </>}
  </aside>;
}

export default function HomeExperience() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return <div className="df-home-app">
    <div className="df-mobile-topbar">
      <button className="df-menu-toggle" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">☰</button>
      <Link href="/" className="df-mobile-brand"><span className="df-brand-mark">DF</span><strong>DAJJAL FAMILY</strong></Link>
      <Link href="/about" className="df-mobile-about" aria-label="About Dajjal Family">ⓘ</Link>
    </div>
    {drawerOpen && <div className="df-drawer-layer" onClick={() => setDrawerOpen(false)}>
      <div className="df-mobile-drawer" onClick={(event) => event.stopPropagation()}>
        <button className="df-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation">×</button>
        <Sidebar/>
      </div>
    </div>}
    <div className="df-app-layout">
      <Sidebar/>
      <main className="df-main-content">
        <header className="df-content-topbar"><div><span className="df-breadcrumb">DAJJAL FAMILY <span>/</span> HOME</span><p>Explore our growing digital universe.</p></div><Link href="/contact" className="df-topbar-link">Get in touch <span>↗</span></Link></header>
        <section className="df-welcome" aria-labelledby="home-title">
          <div className="df-welcome-glow"/>
          <div className="df-welcome-copy"><span className="df-eyebrow">WELCOME TO OUR UNIVERSE</span><h1 id="home-title" className="welcome-title">One Family.<br/><em>Many Possibilities.</em></h1><p>Dajjal Family is a growing digital ecosystem bringing together gaming, knowledge, creativity, digital products, and new business ideas.</p><div className="df-hero-actions"><Link href="#categories" className="df-primary-button">EXPLORE THE UNIVERSE <span>↗</span></Link><Link href="/about" className="df-secondary-button">OUR STORY</Link></div></div>
          <div className="df-orbit-art" aria-hidden="true"><div className="df-orbit orbit-one"/><div className="df-orbit orbit-two"/><div className="df-orbit-core">DF</div><span className="df-orbit-dot dot-one"/><span className="df-orbit-dot dot-two"/><span className="df-orbit-dot dot-three"/></div>
          <span className="df-hero-index">01 / A NEW BEGINNING</span>
        </section>
        <section className="df-section-block" id="categories">
          <div className="df-section-heading"><div><span className="df-eyebrow">EXPLORE WHAT WE DO</span><h2>Discover our universe</h2><p>Different worlds, connected by one family.</p></div><span className="df-section-count">06 CATEGORIES</span></div>
          <div className="df-category-grid">{categories.map((item) => <Link href={item.href} className="df-category-card" key={item.n}><div className="df-category-top"><span className="df-category-icon">{item.icon}</span><span className="df-category-number">{item.n}</span></div><span className="df-category-tag">{item.tag}</span><h3>{item.title}</h3><p>{item.text}</p><span className="df-card-arrow">Explore <b>↗</b></span></Link>)}</div>
        </section>
        <section className="df-feature-strip" id="featured"><div><span className="df-eyebrow">THE IDEA BEHIND THE BRAND</span><h2>More than a website.<br/><em>A universe in progress.</em></h2><p>We are building a home for digital experiences and projects that can evolve over time. Start exploring and grow with us.</p></div><div className="df-feature-symbol" aria-hidden="true">✳</div></section>
        <section className="df-latest" id="latest"><div><span className="df-eyebrow">WHAT'S NEXT</span><h2>New experiences are taking shape.</h2><p>We are preparing new content, products, and community experiences. This space will grow as each part of the universe becomes ready.</p></div><Link href="/about" className="df-secondary-button">DISCOVER DAJJAL FAMILY ↗</Link></section>
        <footer className="df-home-footer"><div><strong>DAJJAL FAMILY</strong><span>One Family. Many Possibilities.</span></div><nav><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav><small>© {new Date().getFullYear()} Dajjal Family. All rights reserved.</small></footer>
      </main>
      <Sidebar right/>
    </div>
  </div>;
}
