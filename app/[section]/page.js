import { notFound } from "next/navigation";
import SectionExperience from "../components/SectionExperience";

const sections = ["knowledge","blog","digital-products","business","community","about","contact"];

export async function generateMetadata({ params }) {
  const { section } = await params;
  if (!sections.includes(section)) return {};
  const titles = {
    knowledge: "Knowledge", blog: "Blog", "digital-products": "Digital Products",
    business: "Business", community: "Community", about: "About Dajjal Family", contact: "Contact",
  };
  const descriptions = {
    knowledge: "Useful insights, educational resources, explainers, and practical guides.",
    blog: "Stories, ideas, updates, and perspectives from across the Dajjal Family universe.",
    "digital-products": "E-books, templates, creative assets, and useful digital resources.",
    business: "Services, ventures, collaborations, and business initiatives connected to Dajjal Family.",
    community: "Connect, share experiences, and grow around common interests.",
    about: "Learn about Dajjal Family, a growing digital ecosystem.",
    contact: "Contact Dajjal Family for questions, ideas, and collaborations.",
  };
  return {
    title: titles[section],
    description: descriptions[section],
    robots: { index: true, follow: true },
    alternates: { canonical: `https://dajjalfamily.com/${section}` },
  };
}

export default async function SectionPage({ params }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <SectionExperience section={section} />;
}
