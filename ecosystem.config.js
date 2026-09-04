const fs = require('fs');
const path = require('path');

const isStandalone = fs.existsSync(path.join(__dirname, 'server.js'));

module.exports = {
  apps: [
    {
      name: 'salesmanpro',
      script: isStandalone ? 'server.js' : 'node_modules/.bin/next',
      args: isStandalone ? '' : 'start -p 3000',
      instances: 3,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
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
      script: './dist-worker/workers/domain-ssl-worker.js',
      node_args: '--max-old-space-size=150',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '200M',
    },
    {
      name: 'whatsapp-worker',
      script: './dist-worker/workers/whatsapp-worker.js',
      node_args: '--max-old-space-size=512',
      interpreter: 'node',
      instances: 2,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 3000,
      max_memory_restart: '600M',
      autorestart: true,
      kill_timeout: 5000,
      watch: false,
    },
    {
      name: 'ai-job-worker',
      script: './dist-worker/workers/ai-job-worker.js',
      node_args: '--max-old-space-size=512',
      interpreter: 'node',
      instances: 2,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 3000,
      max_memory_restart: '600M',
      autorestart: true,
      kill_timeout: 5000,
      watch: false,
    },
    {
      name: 'backup-worker',
      script: './dist-worker/workers/backup-worker.js',
      node_args: '--max-old-space-size=512',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 5000,
      max_memory_restart: '800M',
      autorestart: true,
      kill_timeout: 10000,
      watch: false,
    },
  ],
};