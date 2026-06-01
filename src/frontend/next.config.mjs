/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: ".next-build",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
