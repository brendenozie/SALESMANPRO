/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

try {
  require('graceful-fs').gracefulify(fs);
} catch (e) {}

const { PHASE_PRODUCTION_BUILD } = require('next/constants');

const nextConfig = {
  // Opt into output tracing for standalone builds (in CI, deployment, or when STANDALONE env is set)
  output: (process.env.STANDALONE || process.env.CI) ? 'standalone' : undefined,
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
  // Limit Next.js in-memory page/data cache size to 10MB to prevent memory bloat on production VPS
  cacheMaxMemorySize: 10485760,

  transpilePackages: [
    "@fullcalendar/core",
    "@fullcalendar/react",
    "@fullcalendar/daygrid",
    "@fullcalendar/timegrid",
    "@fullcalendar/list",
    "@fullcalendar/interaction",
  ],

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
      // ─── Security headers for all routes ───────────────────────────────
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
      // ─── Public tenant storefront pages — CDN-cacheable ────────────────
      // Matches revalidate: 60 on layout/page. CDN serves stale for 5 min
      // while Next.js ISR background-revalidates. Safe because no user-specific
      // data is included in the public storefront HTML.
      {
        source: "/site/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      // ─── Next.js immutable static assets ───────────────────────────────
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ─── Optimized images from Next.js image API ────────────────────────
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

  images: {
    // Use default Next.js image optimization (WebP/AVIF, responsive, CDN-friendly).
    // Previously `loader: "custom"` was set without a loaderFile — this silently
    // disabled all optimization. Removing it restores built-in image processing.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
      { protocol: "https", hostname: "*.s3.*.amazonaws.com" },
      { protocol: "https", hostname: "*.salesmanpro.site" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  webpack: (config, { isServer }) => {
    // Disable Webpack disk packfile cache during build to prevent disk exhaustion (ENOSPC)
    if (process.env.CI || process.env.NEXT_IS_BUILD_PHASE || process.env.DISABLE_WEBPACK_CACHE) {
      config.cache = false;
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
      };
    }

    return config;
  },
};

module.exports = (phase) => {
  if (phase === PHASE_PRODUCTION_BUILD) {
    process.env.NEXT_IS_BUILD_PHASE = "true";
  } else if (process.env.npm_lifecycle_event !== "build" && !process.env.NEXT_BUILD) {
    delete process.env.NEXT_IS_BUILD_PHASE;
  }
  return nextConfig;
};