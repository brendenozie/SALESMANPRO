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

// 1. Promote nested standalone output to root if Next.js created a subdirectory
if (!fs.existsSync(path.join(STANDALONE_DIR, 'server.js'))) {
  const entries = fs.readdirSync(STANDALONE_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nestedServerJs = path.join(STANDALONE_DIR, entry.name, 'server.js');
      if (fs.existsSync(nestedServerJs)) {
        console.log(`-> Found nested standalone output in ${entry.name}, promoting to root...`);
        copyDirRecursive(path.join(STANDALONE_DIR, entry.name), STANDALONE_DIR);
        break;
      }
    }
  }
}

// 2. Copy Next.js static assets (.next/static -> .next/standalone/.next/static)
console.log('-> Copying .next/static...');
copyDirRecursive(
  path.join(ROOT_DIR, '.next', 'static'),
  path.join(STANDALONE_DIR, '.next', 'static')
);

// 3. Copy public directory (public -> .next/standalone/public)
console.log('-> Copying public directory...');
copyDirRecursive(
  path.join(ROOT_DIR, 'public'),
  path.join(STANDALONE_DIR, 'public')
);

// 4. Copy compiled background workers (dist-worker -> .next/standalone/dist-worker)
if (fs.existsSync(path.join(ROOT_DIR, 'dist-worker'))) {
  console.log('-> Copying dist-worker...');
  copyDirRecursive(
    path.join(ROOT_DIR, 'dist-worker'),
    path.join(STANDALONE_DIR, 'dist-worker')
  );
  const aliasSrc = path.join(ROOT_DIR, 'workers', 'resolve-alias.js');
  if (fs.existsSync(aliasSrc)) {
    copyFile(aliasSrc, path.join(STANDALONE_DIR, 'dist-worker', 'workers', 'resolve-alias.js'));
    copyFile(aliasSrc, path.join(STANDALONE_DIR, 'dist-worker', 'resolve-alias.js'));
  }
}

// 5. Copy PM2 ecosystem configuration
console.log('-> Copying ecosystem.config.js...');
copyFile(
  path.join(ROOT_DIR, 'ecosystem.config.js'),
  path.join(STANDALONE_DIR, 'ecosystem.config.js')
);

// 6. Copy Prisma schema
if (fs.existsSync(path.join(ROOT_DIR, 'prisma', 'schema.prisma'))) {
  console.log('-> Copying prisma/schema.prisma...');
  copyFile(
    path.join(ROOT_DIR, 'prisma', 'schema.prisma'),
    path.join(STANDALONE_DIR, 'prisma', 'schema.prisma')
  );
}

// 7. Inject auto-loading of .env at the top of server.js
const serverJsPath = path.join(STANDALONE_DIR, 'server.js');
if (fs.existsSync(serverJsPath)) {
  console.log('-> Injecting .env auto-loader into standalone server.js...');
  const serverContent = fs.readFileSync(serverJsPath, 'utf8');
  const envLoader = `// [Standalone Bootstrap] Auto-load environment variables from .env
(function() {
  const fs = require('fs');
  const path = require('path');
  const candidates = [
    path.join(__dirname, '.env'),
    '/var/www/salesmanpro/shared/.env',
    '/var/www/salesmanpro/.env'
  ];
  for (const envFile of candidates) {
    if (fs.existsSync(envFile)) {
      try {
        const lines = fs.readFileSync(envFile, 'utf8').split('\\n');
        for (const line of lines) {
          const t = line.trim();
          if (!t || t.startsWith('#')) continue;
          const idx = t.indexOf('=');
          if (idx > 0) {
            const k = t.slice(0, idx).trim();
            let v = t.slice(idx + 1).trim();
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
              v = v.slice(1, -1);
            }
            if (!process.env[k]) {
              process.env[k] = v;
            }
          }
        }
        break;
      } catch (err) {}
    }
  }
})();
`;
  if (!serverContent.includes('[Standalone Bootstrap]')) {
    fs.writeFileSync(serverJsPath, envLoader + '\n' + serverContent, 'utf8');
  }
}

console.log('✅ Standalone production bundle assembled successfully at .next/standalone');
