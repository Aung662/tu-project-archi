/** @type {import('next').NextConfig} */

// The backend base URL. In the sandbox/preview, the browser cannot reach the
// backend directly, so Next.js PROXIES /api/* to the backend (same-origin from
// the browser's perspective). In production on Vercel, set BACKEND_ORIGIN to the
// deployed API URL (e.g. https://tu-archive-api.onrender.com).
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
