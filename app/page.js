import HomeExperience from "./components/HomeExperience";

export const metadata = {
  title: "Dajjal Family — One Family. Many Possibilities.",
  description: "Explore Dajjal Family, a growing digital ecosystem for gaming, knowledge, articles, digital products, business, and community.",
  alternates: { canonical: "https://dajjalfamily.com/" },
  openGraph: {
    title: "Dajjal Family — One Family. Many Possibilities.",
    description: "A growing digital ecosystem bringing together gaming, knowledge, creativity, digital products, business, and community.",
    url: "https://dajjalfamily.com/",
    siteName: "Dajjal Family",
    type: "website",
  },
};

export default function Home() {
  return <HomeExperience />;
}
