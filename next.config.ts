import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/worker/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Lets the phone on the local network hit the dev server's HMR endpoint.
  // Update this if your machine's LAN IP changes.
  allowedDevOrigins: ["192.168.1.37"],
};

export default withSerwist(nextConfig);
