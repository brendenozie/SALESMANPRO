module.exports = {
  apps: [
    {
      name: 'salesmanpro',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      instances: 2,           // Back to 2 instances for better performance
      exec_mode: 'cluster',   // Cluster mode is fine now that we have RAM room
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Set this higher so PM2 stops killing the app during startup spikes
      max_memory_restart: '4G', 
      restart_delay: 5000,    // 5-second buffer between restarts
      exp_backoff_restart_delay: 100,
      max_restarts: 10,       // Limit restarts to prevent infinite loops
      autorestart: true,     // Keep this true to allow PM2 to manage restarts
      kill_timeout: 3000,   // Give the app more time to shut down gracefully
      watch: false,          // Disable watch mode in production
    },
  ],
};