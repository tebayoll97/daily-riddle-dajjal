export const metadata = {
  title: "Games",
  description: "Explore the Dajjal Family game library. Discover interactive adventures, puzzles, and challenges.",
  alternates: { canonical: "https://dajjalfamily.com/games" },
  openGraph: {
    title: "Games | Dajjal Family",
    description: "Explore interactive adventures, puzzles, and challenges in the Dajjal Family game library.",
    url: "https://dajjalfamily.com/games",
    siteName: "Dajjal Family",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function GamesLayout({ children }) {
  return children;
}
