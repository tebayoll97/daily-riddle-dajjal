const origin = "https://dajjalfamily.com";

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
  return publicRoutes.map((route) => ({
    url: `${origin}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/games" ? 0.8 : 0.6,
  }));
}
