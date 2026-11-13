"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function RouteChrome({ children }) {
  const pathname = usePathname() || "/";
  const isDFRoute = pathname === "/df" || pathname.startsWith("/df/");

  return (
    <>
      {!isDFRoute && <Header />}
      <div className="flex-1 w-full">
        <div className="ui-route-frame">{children}</div>
      </div>
      {!isDFRoute && <Footer />}
    </>
  );
}
