import { notFound } from "next/navigation";
import { headers } from "next/headers";
import SectionExperience from "../components/SectionExperience";

const sections = ["knowledge", "blog", "digital-products", "business", "community", "about", "contact"];

const titles = {
  knowledge: { en: "Knowledge", id: "Pengetahuan" },
  blog: { en: "Blog", id: "Blog" },
  "digital-products": { en: "Digital Products", id: "Produk Digital" },
  business: { en: "Business", id: "Bisnis" },
  community: { en: "Community", id: "Komunitas" },
  about: { en: "About Dajjal Family", id: "Tentang Dajjal Family" },
  contact: { en: "Contact", id: "Kontak" },
};

const descriptions = {
  knowledge: {
    en: "Useful insights, educational resources, explainers, and practical guides.",
    id: "Wawasan bermanfaat, sumber edukasi, penjelasan, dan panduan praktis.",
  },
  blog: {
    en: "Stories, ideas, updates, and perspectives from across the Dajjal Family universe.",
    id: "Cerita, gagasan, kabar, dan sudut pandang dari semesta Dajjal Family.",
  },
  "digital-products": {
    en: "E-books, templates, creative assets, and useful digital resources.",
    id: "E-book, template, aset kreatif, dan sumber daya digital bermanfaat.",
  },
  business: {
    en: "Services, ventures, collaborations, and business initiatives connected to Dajjal Family.",
    id: "Layanan, usaha, kolaborasi, dan inisiatif bisnis yang terhubung dengan Dajjal Family.",
  },
  community: {
    en: "Connect, share experiences, and grow around common interests.",
    id: "Terhubung, berbagi pengalaman, dan berkembang berdasarkan minat bersama.",
  },
  about: {
    en: "Learn about Dajjal Family, a growing digital ecosystem.",
    id: "Kenali Dajjal Family, ekosistem digital yang terus berkembang.",
  },
  contact: {
    en: "Contact Dajjal Family for questions, ideas, and collaborations.",
    id: "Hubungi Dajjal Family untuk pertanyaan, gagasan, dan kolaborasi.",
  },
};

export async function generateMetadata({ params }) {
  const { section } = await params;
  if (!sections.includes(section)) return {};

  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const canonicalPath = `/${locale}/${section}`;

  return {
    title: titles[section][locale],
    description: descriptions[section][locale],
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://dajjalfamily.com${canonicalPath}`,
      languages: {
        id: `https://dajjalfamily.com/id/${section}`,
        en: `https://dajjalfamily.com/en/${section}`,
        "x-default": `https://dajjalfamily.com/id/${section}`,
      },
    },
    openGraph: {
      title: titles[section][locale],
      description: descriptions[section][locale],
      url: `https://dajjalfamily.com${canonicalPath}`,
      siteName: "Dajjal Family",
      type: "website",
      locale: locale === "id" ? "id_ID" : "en_US",
    },
  };
}

export default async function SectionPage({ params }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <SectionExperience section={section} />;
}
