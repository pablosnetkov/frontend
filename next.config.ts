import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

};

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/goods/:path*', // Локальный маршрут в Next.js
        destination: 'http://backend:8000/api/v1/goods/:path*', // Реальный API
      },
    ];
  },
};

export default nextConfig;
