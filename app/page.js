import { headers } from "next/headers";
import HomeExperience from "./components/HomeExperience";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const title = locale === "id"
    ? "Dajjal Family — Satu Keluarga. Banyak Kemungkinan."
    : "Dajjal Family — One Family. Many Possibilities.";
  const description = locale === "id"
    ? "Jelajahi Dajjal Family, ekosistem digital untuk gaming, pengetahuan, artikel, produk digital, bisnis, dan komunitas."
    : "Explore Dajjal Family, a growing digital ecosystem for gaming, knowledge, articles, digital products, business, and community.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://dajjalfamily.com/${locale}`,
      languages: {
        id: "https://dajjalfamily.com/id",
        en: "https://dajjalfamily.com/en",
        "x-default": "https://dajjalfamily.com/id",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://dajjalfamily.com/${locale}`,
      siteName: "Dajjal Family",
      type: "website",
      locale: locale === "id" ? "id_ID" : "en_US",
    },
  };
}

export default function Home() {
  return <HomeExperience />;
}
