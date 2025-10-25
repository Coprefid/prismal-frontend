"use client";
import { useEffect } from "react";

// Hides the Next.js DevTools indicator (small 'N' button) during development.
// Uses the official internal endpoints exposed by Next DevTools in dev mode.
export default function HideNextDevtools() {
  useEffect(() => {
    // Only attempt in the browser
    if (typeof window === "undefined") return;

    // Best effort: persist "disableDevIndicator" in .next/cache/next-devtools-config.json
    fetch("/__nextjs_devtools_config", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ disableDevIndicator: true }),
    }).catch(() => {});

    // Also trigger the cooldown-based disable endpoint
    fetch("/__nextjs_disable_dev_indicator", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
