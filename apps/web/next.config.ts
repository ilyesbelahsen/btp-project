import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  port: process.env.PORT || 3001,
});

const nextConfig: NextConfig = {
  transpilePackages: ["@chantier/types", "@chantier/validators"],

  // Silence Turbopack warning — next-pwa injects webpack config but PWA is disabled in dev
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "your-r2-domain.r2.dev",
      },
    ],
  },
};

export default withPWA(nextConfig);
