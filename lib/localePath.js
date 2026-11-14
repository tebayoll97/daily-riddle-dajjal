export function stripLocalePrefix(pathname) {
  const path = typeof pathname === "string" && pathname.startsWith("/")
    ? pathname
    : "/";
  const segments = path.split("/");
  const locale = segments[1];

  if (locale !== "id" && locale !== "en") return path;

  const unprefixedPath = `/${segments.slice(2).join("/")}`;
  return unprefixedPath || "/";
}
