"use client";

import {
  useEffect,
} from "react";

// ============================================================
// Service Worker Registration
// ============================================================

export default function ServiceWorkerRegistration() {
  useEffect(
    () => {
      if (
        !(
          "serviceWorker" in
          navigator
        )
      ) {
        return;
      }

      const registerServiceWorker =
        async () => {
          try {
            await navigator
              .serviceWorker
              .register(
                "/sw.js"
              );
          } catch (error) {
            console.error(
              "Fitness OS service worker registration failed:",
              error
            );
          }
        };

      registerServiceWorker();
    },
    []
  );

  return null;
}