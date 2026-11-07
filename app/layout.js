import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GlobalAudioController from "./components/GlobalAudioController";
import { LanguageProvider } from "./components/LanguageProvider";

export const metadata = {
  title: {
    default: "Dajjal Family | Gaming Universe",
    template: "%s | Dajjal Family | Gaming Universe",
  },
  description:
    "One Account. One Profile. Multiple Games. One Universe. Explore Daily Riddle, Rune Puzzle, Memory Challenge, Logic Battle, and more.",
  applicationName: "Dajjal Family | Gaming Universe",
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
          <GlobalAudioController />
          <Header />

          <main className="flex-1 w-full">
            <div className="ui-route-frame">
              {children}
            </div>
          </main>

          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
