const origin = "https://dajjalfamily.com";
const locales = ["id", "en"];

const publicRoutes = [
  "",
  "/games",
  "/knowledge",
  "/blog",
  "/digital-products",
  "/business",
  "/community",
  "/about",
  "/contact",
  "/df",
  "/df/wedding-anak-dajjal",
];

export default function sitemap() {
  return publicRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${origin}/${locale}${route}`,
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority: route === "" ? 1 : route === "/games" ? 0.8 : 0.6,
      alternates: {
        languages: {
          id: `${origin}/id${route}`,
          en: `${origin}/en${route}`,
        },
      },
    }))
  );
}
