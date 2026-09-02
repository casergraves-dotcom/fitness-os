import type { NextConfig } from "next";

const isIosBundle =
  process.env.FITNESS_OS_BUILD_TARGET ===
  "ios";

const nextConfig: NextConfig = {
  ...(isIosBundle
    ? {
        output:
          "export" as const,

        trailingSlash:
          true,

        images: {
          unoptimized:
            true,
        },
      }
    : {}),

  allowedDevOrigins: [
    "192.168.1.16",
    "localhost",
  ],

  devIndicators: false,
};

export default nextConfig;
