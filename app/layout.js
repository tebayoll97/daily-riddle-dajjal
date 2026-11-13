import "./globals.css";
import "./home.css";
import RouteChrome from "./components/RouteChrome";
import GlobalAudioController from "./components/GlobalAudioController";
import { LanguageProvider } from "./components/LanguageProvider";

export const metadata = {
  metadataBase: new URL("https://dajjalfamily.com"),
  title: {
    default: "Dajjal Family — One Family. Many Possibilities.",
    template: "%s | Dajjal Family",
  },
  description: "Explore Dajjal Family, a growing digital ecosystem for gaming, knowledge, articles, digital products, business, and community.",
  applicationName: "Dajjal Family",
  keywords: ["Dajjal Family", "digital ecosystem", "online games", "digital products", "knowledge and learning", "digital community"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <GlobalAudioController />
          <RouteChrome>{children}</RouteChrome>
        </LanguageProvider>
      </body>
    </html>
  );
}
