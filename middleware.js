import { NextResponse } from "next/server";

const SUPPORTED_LOCALES = new Set(["id", "en"]);
const DEFAULT_LOCALE = "id";
const LOCALE_COOKIE = "df-locale";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // OAuth callbacks and API endpoints must retain their existing callback contracts.
  if (pathname.startsWith("/api/") || pathname === "/auth/callback") {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (SUPPORTED_LOCALES.has(firstSegment)) {
    const locale = firstSegment;
    const localizedPath = "/" + segments.slice(2).join("/");
    const destination = request.nextUrl.clone();
    destination.pathname = localizedPath === "/" ? "/" : localizedPath;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-df-locale", locale);

    const response = NextResponse.rewrite(destination, {
      request: { headers: requestHeaders },
    });

    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  }

  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = SUPPORTED_LOCALES.has(savedLocale) ? savedLocale : DEFAULT_LOCALE;
  const destination = request.nextUrl.clone();
  destination.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(destination, 307);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
