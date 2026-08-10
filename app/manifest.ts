import type {
  MetadataRoute,
} from "next";

// ============================================================
// Fitness OS Web App Manifest
// ============================================================

export default function manifest():
  MetadataRoute.Manifest {
  return {
    name: "Fitness OS",

    short_name: "Fitness OS",

    description:
      "Personal fitness, training, recovery, and progress system.",

    start_url: "/today",

    display: "standalone",

    background_color:
      "#f8fafc",

    theme_color:
      "#2563eb",

    orientation:
      "portrait",

    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}