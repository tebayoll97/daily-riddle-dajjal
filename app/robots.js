import { NextResponse } from "next/server";

export default function robots() {
  const origin = "https://dajjalfamily.com";
  return new NextResponse(
    `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /profile/
Disallow: /settings/
Disallow: /login
Disallow: /register
Disallow: /design-system
Disallow: /character-test
Disallow: /df/wedding/dashboard
Disallow: /df/wedding/create
Disallow: /df/wedding/preview

Sitemap: ${origin}/sitemap.xml
Host: ${origin}
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
