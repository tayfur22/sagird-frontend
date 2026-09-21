// Next.js 14 does not support next.config.ts (that arrived in Next 15).
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ["src"],
  },
};

export default nextConfig;
