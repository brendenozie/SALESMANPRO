module.exports = {
  apps: [
    {
      name: 'salesmanpro',
      script: 'node_modules/.bin/next',
      args: 'start', // 'start' runs the production server
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enables load balancing across cores
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Memory management: Restart if it exceeds 1.5GB
      // (Helps prevent OOM crashes on your 8GB server)
      max_memory_restart: '1500M',
      // Logging
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
  ],
};