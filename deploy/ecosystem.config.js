const fs = require('fs');
const path = require('path');

const APP_DIR = path.resolve(__dirname, '..');
const isStandalone = fs.existsSync(path.join(APP_DIR, 'server.js'));
const aliasScript = path.join(APP_DIR, 'dist-worker', 'workers', 'resolve-alias.js');

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
      script: isStandalone ? path.join(APP_DIR, 'server.js') : 'node_modules/.bin/next',
      args: isStandalone ? '' : 'start -p 3000',
      node_args: '--max-old-space-size=2560',
      instances: 1,
      exec_mode: 'fork',
      env: {
        ...baseEnv,
        PORT: 3000,
      },
      min_uptime: '15s',
      max_memory_restart: '2500M',
      restart_delay: 4000,
      exp_backoff_restart_delay: 500,
      max_restarts: 20,
      autorestart: true,
      kill_timeout: 10000,
      listen_timeout: 10000,
      watch: false,
    },
    {
      name: 'ssl-worker',
      cwd: APP_DIR,
      script: path.join(APP_DIR, 'dist-worker', 'workers', 'domain-ssl-worker.js'),
      node_args: `--require ${aliasScript} --max-old-space-size=200`,
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        ...baseEnv,
      },
      min_uptime: '15s',
      restart_delay: 5000,
      max_memory_restart: '300M',
      autorestart: true,
      kill_timeout: 5000,
      watch: false,
    },
    {
      name: 'whatsapp-worker',
      cwd: APP_DIR,
      script: path.join(APP_DIR, 'dist-worker', 'workers', 'whatsapp-worker.js'),
      node_args: `--require ${aliasScript} --max-old-space-size=512`,
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        ...baseEnv,
      },
      min_uptime: '15s',
      restart_delay: 5000,
      exp_backoff_restart_delay: 1000,
      max_restarts: 30,
      max_memory_restart: '700M',
      autorestart: true,
      kill_timeout: 5000,
      watch: false,
    },
    {
      name: 'ai-job-worker',
      cwd: APP_DIR,
      script: path.join(APP_DIR, 'dist-worker', 'workers', 'ai-job-worker.js'),
      node_args: `--require ${aliasScript} --max-old-space-size=512`,
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        ...baseEnv,
      },
      min_uptime: '15s',
      restart_delay: 5000,
      exp_backoff_restart_delay: 1000,
      max_restarts: 30,
      max_memory_restart: '700M',
      autorestart: true,
      kill_timeout: 5000,
      watch: false,
    },
    {
      name: 'backup-worker',
      cwd: APP_DIR,
      script: path.join(APP_DIR, 'dist-worker', 'workers', 'backup-worker.js'),
      node_args: `--require ${aliasScript} --max-old-space-size=768`,
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        ...baseEnv,
      },
      min_uptime: '15s',
      restart_delay: 5000,
      exp_backoff_restart_delay: 1000,
      max_restarts: 30,
      max_memory_restart: '1000M',
      autorestart: true,
      kill_timeout: 10000,
      watch: false,
    },
    {
      name: 'ai-workforce-worker',
      cwd: APP_DIR,
      script: path.join(APP_DIR, 'dist-worker', 'workers', 'ai-workforce-worker.js'),
      node_args: `--require ${aliasScript} --max-old-space-size=768`,
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        ...baseEnv,
      },
      min_uptime: '15s',
      restart_delay: 5000,
      exp_backoff_restart_delay: 1000,
      max_restarts: 30,
      max_memory_restart: '1000M',
      autorestart: true,
      kill_timeout: 5000,
      watch: false,
    },
  ],
};
