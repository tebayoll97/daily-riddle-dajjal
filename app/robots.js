const origin = "https://dajjalfamily.com";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/profile/",
        "/settings/",
        "/login",
        "/register",
        "/design-system",
        "/character-test",
        "/df/wedding/dashboard",
        "/df/wedding/create",
        "/df/wedding/preview",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
