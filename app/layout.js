import "./globals.css";
import RouteChrome from "./components/RouteChrome";
import GlobalAudioController from "./components/GlobalAudioController";
import { LanguageProvider } from "./components/LanguageProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { headers } from "next/headers";

export const metadata = {
  metadataBase: new URL("https://dajjalfamily.com"),
  title: { default: "Dajjal Family — One Family. Many Possibilities.", template: "%s | Dajjal Family" },
  description: "Explore Dajjal Family, a growing digital ecosystem for gaming, knowledge, articles, digital products, business, and community.",
  applicationName: "Dajjal Family",
  keywords: ["Dajjal Family", "digital ecosystem", "online games", "digital products", "knowledge and learning", "digital community"],
};

export default async function RootLayout({ children }) {
  const requestHeaders = await headers();
  const requestedLocale = requestHeaders.get("x-df-locale");
  const initialLanguage = requestedLocale === "en" ? "en" : "id";

  return (
    <html lang={initialLanguage}>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <LanguageProvider initialLanguage={initialLanguage}>
            <GlobalAudioController />
            <RouteChrome>{children}</RouteChrome>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
