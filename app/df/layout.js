export const metadata = {
  title: "Dajjal Family Universe",
  description: "Meet the characters, explore creative projects, games, stories, and family events in the Dajjal Family universe.",
  alternates: { canonical: "https://dajjalfamily.com/df" },
  openGraph: {
    title: "Dajjal Family Universe",
    description: "One family, endless stories. Explore characters, creative projects, games, and events.",
    url: "https://dajjalfamily.com/df",
    siteName: "Dajjal Family",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function DajjalFamilyLayout({ children }) {
  return children;
}
