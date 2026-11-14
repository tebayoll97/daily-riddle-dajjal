import Link from "next/link";
import { notFound } from "next/navigation";
import SectionExperience from "../components/SectionExperience";

const sections = {
  knowledge: {
    title: "Knowledge",
    eyebrow: "LEARN & DISCOVER",
    description: "A growing library of useful insights, educational resources, explainers, and practical guides.",
    detail: "We are preparing thoughtful resources and learning materials for this section. Check back as the Knowledge library takes shape.",
  },
  blog: {
    title: "Blog",
    eyebrow: "IDEAS & STORIES",
    description: "Stories, ideas, updates, and perspectives from across the Dajjal Family universe.",
    detail: "The editorial space is being prepared. Articles and updates will appear here as they are ready.",
  },
  "digital-products": {
    title: "Digital Products",
    eyebrow: "TOOLS FOR YOUR NEXT IDEA",
    description: "A future collection of e-books, templates, creative assets, and useful digital resources.",
    detail: "We are preparing our first digital releases. Product information and availability will be published here.",
  },
  business: {
    title: "Business",
    eyebrow: "BUILD & COLLABORATE",
    description: "Discover the services, ventures, collaborations, and business initiatives connected to Dajjal Family.",
    detail: "This area will introduce our business projects and collaboration opportunities as they become available.",
  },
  community: {
    title: "Community",
    eyebrow: "CONNECT & GROW",
    description: "A place for people to connect, share experiences, and grow around common interests.",
    detail: "We are shaping the community experience. More information about participation and community features will follow.",
  },
  about: {
    title: "About Dajjal Family",
    eyebrow: "ONE FAMILY. MANY POSSIBILITIES.",
    description: "Dajjal Family is a growing digital ecosystem connecting gaming, knowledge, creativity, digital products, business, and community.",
    detail: "Our vision is to bring different digital experiences together under one identity, while allowing each project and category to grow in its own direction.",
  },
  contact: {
    title: "Contact",
    eyebrow: "LET'S CONNECT",
    description: "Have a question, an idea, or a potential collaboration? Dajjal Family welcomes thoughtful conversations.",
    detail: "Our contact channels are being organized. Please check back soon for the official ways to reach our team.",
  },
};

export async function generateMetadata({ params }) {
  const { section } = await params;
  const item = sections[section];
  if (!item) return {};
  return {
    title: item.title,
    description: item.description,
    robots: { index: false, follow: true },
    alternates: { canonical: `https://dajjalfamily.com/${section}/` },
  };
}

export default async function SectionPage({ params }) {
  const { section } = await params;
  const item = sections[section];
  if (!item) notFound();

  return (
    <main className="df-section-page">
      <span className="df-eyebrow">{item.eyebrow}</span>
      <h1 className="welcome-title">{item.title}</h1>
      <p className="df-section-page-intro">{item.description}</p>
      <div className="df-section-page-panel">
        <span className="df-coming-soon">IN DEVELOPMENT</span>
        <h2>Something meaningful is taking shape.</h2>
        <p>{item.detail}</p>
        <Link href="/" className="df-primary-button">BACK TO HOME <span>↗</span></Link>
      </div>
    </main>
  );
}  return <SectionExperience section={section} />;t Link from "next/link";
import { notFound } from "next/navigation";
import SectionExperience from "../components/SectionExperience";

const sections = {
  knowledge: {
    title: "Knowledge",
    eyebrow: "LEARN & DISCOVER",
    description: "A growing library of useful insights, educational resources, explainers, and practical guides.",
    detail: "We are preparing thoughtful resources and learning materials for this section. Check back as the Knowledge library takes shape.",
  },
  blog: {
    title: "Blog",
    eyebrow: "IDEAS & STORIES",
    description: "Stories, ideas, updates, and perspectives from across the Dajjal Family universe.",
    detail: "The editorial space is being prepared. Articles and updates will appear here as they are ready.",
  },
  "digital-products": {
    title: "Digital Products",
    eyebrow: "TOOLS FOR YOUR NEXT IDEA",
    description: "A future collection of e-books, templates, creative assets, and useful digital resources.",
    detail: "We are preparing our first digital releases. Product information and availability will be published here.",
  },
  business: {
    title: "Business",
    eyebrow: "BUILD & COLLABORATE",
    description: "Discover the services, ventures, collaborations, and business initiatives connected to Dajjal Family.",
    detail: "This area will introduce our business projects and collaboration opportunities as they become available.",
  },
  community: {
    title: "Community",
    eyebrow: "CONNECT & GROW",
    description: "A place for people to connect, share experiences, and grow around common interests.",
    detail: "We are shaping the community experience. More information about participation and community features will follow.",
  },
  about: {
    title: "About Dajjal Family",
    eyebrow: "ONE FAMILY. MANY POSSIBILITIES.",
    description: "Dajjal Family is a growing digital ecosystem connecting gaming, knowledge, creativity, digital products, business, and community.",
    detail: "Our vision is to bring different digital experiences together under one identity, while allowing each project and category to grow in its own direction.",
  },
  contact: {
    title: "Contact",
    eyebrow: "LET'S CONNECT",
    description: "Have a question, an idea, or a potential collaboration? Dajjal Family welcomes thoughtful conversations.",
    detail: "Our contact channels are being organized. Please check back soon for the official ways to reach our team.",
  },
};

export async function generateMetadata({ params }) {
  const { section } = await params;
  const item = sections[section];
  if (!item) return {};
  return {
    title: item.title,
    description: item.description,
    robots: { index: false, follow: true },
    alternates: { canonical: `https://dajjalfamily.com/${section}/` },
  };
}

export default async function SectionPage({ params }) {
  const { section } = await params;
  const item = sections[section];
  if (!item) notFound();

  return (
    <main className="df-section-page">
      <span className="df-eyebrow">{item.eyebrow}</span>
      <h1 className="welcome-title">{item.title}</h1>
      <p className="df-section-page-intro">{item.description}</p>
      <div className="df-section-page-panel">
        <span className="df-coming-soon">IN DEVELOPMENT</span>
        <h2>Something meaningful is taking shape.</h2>
        <p>{item.detail}</p>
        <Link href="/" className="df-primary-button">BACK TO HOME <span>↗</span></Link>
      </div>
    </main>
  );
}
