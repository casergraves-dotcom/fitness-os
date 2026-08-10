import type {
  Metadata,
  Viewport,
} from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";

// ============================================================
// Fonts
// ============================================================

const geistSans =
  Geist({
    variable:
      "--font-geist-sans",

    subsets: [
      "latin",
    ],
  });

const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",

    subsets: [
      "latin",
    ],
  });

// ============================================================
// Metadata
// ============================================================

export const metadata:
  Metadata = {
  title: {
    default:
      "Fitness OS",

    template:
      "%s | Fitness OS",
  },

  description:
    "Personal fitness, training, recovery, and progress system.",

  applicationName:
    "Fitness OS",

  manifest:
    "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url:
          "/icons/favicon-32.png",

        sizes:
          "32x32",

        type:
          "image/png",
      },
    ],

    apple: [
      {
        url:
          "/icons/apple-touch-icon.png",

        sizes:
          "180x180",

        type:
          "image/png",
      },
    ],
  },

  appleWebApp: {
    capable:
      true,

    title:
      "Fitness OS",

    statusBarStyle:
      "black-translucent",
  },

  formatDetection: {
    telephone:
      false,
  },
};

// ============================================================
// Viewport
// ============================================================

export const viewport:
  Viewport = {
  width:
    "device-width",

  initialScale:
    1,

  viewportFit:
    "cover",

  themeColor:
    "#081320",
};

// ============================================================
// Root Layout
// ============================================================

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={
        `${geistSans.variable} ${geistMono.variable} h-full antialiased`
      }
    >
      <body className="min-h-full">
        <ServiceWorkerRegistration />
        
        {children}
      </body>
    </html>
  );
}