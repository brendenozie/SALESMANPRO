/**
 * deploy/ecosystem.config.js
 *
 * PM2 Production Ecosystem Configuration for SalesmanPro.
 *
 * Supports:
 * - Zero-downtime rolling reload: `pm2 reload ecosystem.config.js`
 * - Graceful connection draining (`kill_timeout: 10000`)
 * - Unified supervision of Next.js web process and standalone BullMQ workers.
 */

module.exports = {
  apps: [
    // 1. Next.js Web Application
    {
      name: "salesmanpro-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1, // Or "max" for cluster mode per server
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "2048M",
      kill_timeout: 10000,
      listen_timeout: 8000,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },

    // 2. Domain & SSL Worker
    {
      name: "salesmanpro-ssl-worker",
      script: "dist-worker/workers/domain-ssl-worker.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "512M",
      kill_timeout: 5000,
      env: {
        NODE_ENV: "production",
      },
    },

    // 3. Automated Database Backup & Disaster Recovery Worker
    {
      name: "salesmanpro-backup-worker",
      script: "dist-worker/workers/backup-worker.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1024M",
      kill_timeout: 10000,
      env: {
        NODE_ENV: "production",
      },
    },

    // 4. WhatsApp AI Worker
    {
      name: "salesmanpro-whatsapp-worker",
      script: "dist-worker/workers/whatsapp-worker.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1024M",
      kill_timeout: 5000,
      env: {
        NODE_ENV: "production",
      },
    },

    // 5. Central AI Job Worker (Images & Videos)
    {
      name: "salesmanpro-ai-worker",
      script: "dist-worker/workers/ai-job-worker.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1536M",
      kill_timeout: 5000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
