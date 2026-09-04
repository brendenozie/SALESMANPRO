const fs = require('fs');
const path = require('path');

const APP_DIR = path.resolve(__dirname);
const isStandalone = fs.existsSync(path.join(APP_DIR, 'server.js'));

/**
 * Robust zero-dependency .env parser.
 * Reads environment variables from shared and local .env files and ensures
 * they are available to PM2 cluster instances and background worker processes.
 */
function loadDotEnv(envPath) {
  const env = {};
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          env[key] = val;
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    } catch (err) {
      console.warn('[ecosystem] Warning reading .env from', envPath, err.message);
    }
  }
  return env;
}

const sharedEnv = loadDotEnv('/var/www/salesmanpro/shared/.env');
const localEnv = loadDotEnv(path.join(APP_DIR, '.env'));
const baseEnv = {
  ...sharedEnv,
  ...localEnv,
  NODE_ENV: 'production',
};

module.exports = {
  apps: [
    {
      name: 'salesmanpro',
      cwd: APP_DIR,
      script: isStandalone ? 'server.js' : 'node_modules/.bin/next',
      args: isStandalone ? '' : 'start -p 3000',
      instances: 3,
      exec_mode: 'cluster',
      env: {
        ...baseEnv,
        PORT: 3000,
      },
      max_memory_restart: '2G',
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      autorestart: true,
      kill_timeout: 5000,
      watch: false,
    },
    {
      name: 'ssl-worker',
      cwd: APP_DIR,
      script: './dist-worker/workers/domain-ssl-worker.js',
      node_args: '--max-old-space-size=150',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        ...baseEnv,
      },
      max_memory_restart: '200M',
    },
    {
      name: 'whatsapp-worker',
      cwd: APP_DIR,
      script: './dist-worker/workers/whatsapp-worker.js',
      node_args: '--max-old-space-size=512',
      interpreter: 'node',
      instances: 2,
      exec_mode: 'fork',
      env: {
        ...baseEnv,
      },
      restart_delay: 3000,
      max_memory_restart: '600M',
      autorestart: true,
      kill_timeout: 5000,
      watch: false,
    },
    {
      name: 'ai-job-worker',
      cwd: APP_DIR,
      script: './dist-worker/workers/ai-job-worker.js',
      node_args: '--max-old-space-size=512',
      interpreter: 'node',
      instances: 2,
      exec_mode: 'fork',
      env: {
        ...baseEnv,
      },
      restart_delay: 3000,
      max_memory_restart: '600M',
      autorestart: true,
      kill_timeout: 5000,
      watch: false,
    },
    {
      name: 'backup-worker',
      cwd: APP_DIR,
      script: './dist-worker/workers/backup-worker.js',
      node_args: '--max-old-space-size=512',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        ...baseEnv,
      },
      restart_delay: 5000,
      max_memory_restart: '800M',
      autorestart: true,
      kill_timeout: 10000,
      watch: false,
    },
  ],
};