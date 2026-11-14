import "./globals.css";
import RouteChrome from "./components/RouteChrome";
import GlobalAudioController from "./components/GlobalAudioController";
import { LanguageProvider } from "./components/LanguageProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { headers } from "next/headers";

const ORIGIN = "https://dajjalfamily.com";
const NO_INDEX_PATHS = [
  "/admin",
  "/profile",
  "/settings",
  "/login",
  "/register",
  "/design-system",
  "/character-test",
  "/df/wedding",
];

function isPrivatePath(pathname) {
  return NO_INDEX_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const pathname = requestHeaders.get("x-df-path") || "/";
  const localizedPath = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return {
    metadataBase: new URL(ORIGIN),
    title: { default: "Dajjal Family — One Family. Many Possibilities.", template: "%s | Dajjal Family" },
    description: "Explore Dajjal Family, a growing digital ecosystem for gaming, knowledge, articles, digital products, business, and community.",
    applicationName: "Dajjal Family",
    keywords: ["Dajjal Family", "digital ecosystem", "online games", "digital products", "knowledge and learning", "digital community"],
    ...(isPrivatePath(pathname) ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: `${ORIGIN}${localizedPath}`,
      languages: {
        id: `${ORIGIN}/id${pathname === "/" ? "" : pathname}`,
        en: `${ORIGIN}/en${pathname === "/" ? "" : pathname}`,
        "x-default": `${ORIGIN}/id${pathname === "/" ? "" : pathname}`,
      },
    },
  };
}

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
