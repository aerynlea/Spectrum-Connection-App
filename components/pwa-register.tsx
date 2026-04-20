"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    }).catch(() => {
      // Keep failures silent so they do not interrupt the main experience.
    });
  }, []);

  return null;
}
