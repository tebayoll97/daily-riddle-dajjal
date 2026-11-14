const origin = "https://dajjalfamily.com";

const privatePaths = [
  "/admin",
  "/profile",
  "/settings",
  "/login",
  "/register",
  "/design-system",
  "/character-test",
  "/df/wedding",
];

const disallow = [
  "/api",
  ...privatePaths.flatMap((path) => [path, `/id${path}`, `/en${path}`]),
];

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
