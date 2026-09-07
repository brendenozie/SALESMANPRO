/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

try {
  require('graceful-fs').gracefulify(fs);
} catch (e) {}

// Ensure build phase is marked across all compiler workers and child processes
process.env.NEXT_IS_BUILD_PHASE = "true";

module.exports = {
  // Opt into output tracing for lightweight standalone production builds
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
  poweredByHeader: false,

  // Externalize heavy backend packages so Webpack avoids parsing/bundling them
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    'ioredis',
    'bullmq',
    'bcryptjs',
    'nodemailer',
    'cloudinary',
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    'openai',
    'groq-sdk',
    '@ai-sdk/google',
    'ai',
    'formidable',
    'multer',
    'micro',
  ],

  experimental: {
    // Transform barrel imports to direct paths, cutting AST size dramatically
    optimizePackageImports: [
      '@heroicons/react',
      'react-icons',
      'date-fns',
      'lodash',
      '@tanstack/react-query',
      'framer-motion',
      'chart.js',
      'react-chartjs-2',
      'apexcharts',
      'react-apexcharts',
      '@fullcalendar/react',
      'react-dropzone',
      'react-datepicker',
      'react-time-picker',
      'zod',
    ],
    // Allow Next.js 15 webpack worker to isolate client/server memory heaps
    webpackBuildWorker: true,
    cpus: process.env.BUILD_CPUS ? parseInt(process.env.BUILD_CPUS) : 1,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 1000,
  },

  // Combined env object
  env: {
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    stripe_public_key: process.env.STRIPE_PUBLIC_KEY ?? "",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "/api",
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=(self), usb=(), bluetooth=(), serial=(), magnetometer=(), accelerometer=(), gyroscope=(), display-capture=(), browsing-topics=(), local-network-access=()",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
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
};