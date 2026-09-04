/**
 * scripts/pack-standalone.js
 *
 * Assembles the production-ready standalone deployment bundle.
 * Next.js output: 'standalone' produces .next/standalone with a minimal server.js
 * and traced node_modules. This script copies required static assets, workers,
 * ecosystem configuration, and public files into the standalone directory.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const STANDALONE_DIR = path.join(ROOT_DIR, '.next', 'standalone');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[pack-standalone] Warning: Source directory does not exist: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[pack-standalone] Warning: Source file does not exist: ${src}`);
    return;
  }
  const parent = path.dirname(dest);
  fs.mkdirSync(parent, { recursive: true });
  fs.copyFileSync(src, dest);
}

console.log('📦 Assembling standalone deployment bundle...');

if (!fs.existsSync(STANDALONE_DIR)) {
  console.error(`❌ Error: Standalone output directory not found at ${STANDALONE_DIR}`);
  console.error('Make sure Next.js build completed with output: "standalone".');
  process.exit(1);
}

// 1. Copy Next.js static assets (.next/static -> .next/standalone/.next/static)
console.log('-> Copying .next/static...');
copyDirRecursive(
  path.join(ROOT_DIR, '.next', 'static'),
  path.join(STANDALONE_DIR, '.next', 'static')
);

// 2. Copy public directory (public -> .next/standalone/public)
console.log('-> Copying public directory...');
copyDirRecursive(
  path.join(ROOT_DIR, 'public'),
  path.join(STANDALONE_DIR, 'public')
);

// 3. Copy compiled background workers (dist-worker -> .next/standalone/dist-worker)
if (fs.existsSync(path.join(ROOT_DIR, 'dist-worker'))) {
  console.log('-> Copying dist-worker...');
  copyDirRecursive(
    path.join(ROOT_DIR, 'dist-worker'),
    path.join(STANDALONE_DIR, 'dist-worker')
  );
}

// 4. Copy PM2 ecosystem configuration
console.log('-> Copying ecosystem.config.js...');
copyFile(
  path.join(ROOT_DIR, 'ecosystem.config.js'),
  path.join(STANDALONE_DIR, 'ecosystem.config.js')
);

// 5. Copy Prisma schema
if (fs.existsSync(path.join(ROOT_DIR, 'prisma', 'schema.prisma'))) {
  console.log('-> Copying prisma/schema.prisma...');
  copyFile(
    path.join(ROOT_DIR, 'prisma', 'schema.prisma'),
    path.join(STANDALONE_DIR, 'prisma', 'schema.prisma')
  );
}

console.log('✅ Standalone production bundle assembled successfully at .next/standalone');
