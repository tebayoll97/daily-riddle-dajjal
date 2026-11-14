"use client";

import { useState } from "react";

function getInitials(name = "") {
  const parts = name.trim().split(/\\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
}

export function Avatar({ src, name = "User", alt, size = "md", className = "" }) {
  const [failed, setFailed] = useState(false);
  const safeSize = ["sm", "md", "lg", "xl"].includes(size) ? size : "md";
  const label = alt ?? name;
  return (
    <span className={["ui-avatar", `ui-avatar-${safeSize}`, className].filter(Boolean).join(" ")} role="img" aria-label={label}>
      {src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : <span aria-hidden="true">{getInitials(name)}</span>}
    </span>
  );
}
