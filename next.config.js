/** @type {import('next').NextConfig} */
const path = require('path');

module.exports = {
  // Opt into output tracing for lightweight builds
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  productionBrowserSourceMaps: false,
  reactStrictMode: false,

  // Combined env object (fixed duplicate override)
  env: {
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    stripe_public_key: process.env.STRIPE_PUBLIC_KEY ?? "",
  },

  images: {
    loader: "custom",
    domains: [
      "t1.gstatic.com",
      "t2.gstatic.com",
      "res.cloudinary.com",
      "t3.gstatic.com",
      "upload.wikimedia.org",
      "links.papareact.com",
      "images.trvl-media.com",
      "salesmanpro.site",
      "dozi4r4ug9739.cloudfront.net",
    ],
  },

  // Let Next.js handle aliases via tsconfig.json automatically.
  // Kept intact in case custom fallback paths are strictly required:
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname);
    config.resolve.alias['@/types'] = path.resolve(__dirname, 'types');
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'lib');

    return config;
  },
};