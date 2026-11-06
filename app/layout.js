
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { LanguageProvider } from "./components/LanguageProvider";

export const metadata = {
  title: {
    default: "Dajjal & Veylora Gaming Universe",
    template: "%s | Dajjal & Veylora Gaming Universe",
  },
  description:
    "One Account. One Profile. Multiple Games. One Universe. Explore Daily Riddle, Rune Puzzle, Memory Challenge, Logic Battle, and more.",
  applicationName: "Dajjal & Veylora Gaming Universe",
  keywords: [
    "Dajjal",
    "Veylora",
    "Gaming Universe",
    "Daily Riddle",
    "Rune Puzzle",
    "Memory Challenge",
    "Logic Battle",
    "Online Mini Games",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <Header />

          <main className="flex-1 w-full">
            {children}
          </main>

          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
