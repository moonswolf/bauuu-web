/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true
  },
}

module.exports = nextConfig