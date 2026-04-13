import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  customWorkerDir: "worker",
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  turbopack: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" }, // Pour Laravel local
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      { protocol: "http", hostname: "minio", port: "9000" },      // Pour MinIO local
      { protocol: "https", hostname: "o229-marketplace.s3.amazonaws.com" }, // Exemple S3
      { protocol: "https", hostname: "o-229.com" } // Domaine principal
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 604800,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Tailles optimisées pour mobile
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true, // Active le Gzip/Brotli automatique

};

export default withPWA(nextConfig);
