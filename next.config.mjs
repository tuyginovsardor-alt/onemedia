/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/telegram/webhook/api/telegram/webhook",
        destination: "/api/telegram/webhook",
      },
    ]
  },
}

export default nextConfig
