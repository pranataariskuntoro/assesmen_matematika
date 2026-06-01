import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kompres response HTTP secara otomatis (kurangi bandwidth + kecepatan)
  compress: true,

  // Optimalkan pengiriman gambar
  images: {
    minimumCacheTTL: 3600,
  },

  // Header keamanan + performa untuk semua response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Cache static assets aggressively
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Cache JS/CSS static files selama 1 tahun
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache favicon dan gambar publik
        source: "/(favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
