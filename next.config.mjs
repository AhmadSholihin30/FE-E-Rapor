/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
// async rewrites() {
//     return [
//       {
//         source: '/api-proxy/:path*', // Kita buat path palsu '/api-proxy'
//         destination: 'https://restful-api-e-rapor-production.up.railway.app/api/:path*', // Diteruskan ke Railway
//       },
//     ]
//   },
}

export default nextConfig
