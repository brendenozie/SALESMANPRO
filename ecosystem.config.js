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
    {
      name: 'ssl-worker',
      // Use the full relative path from the root of /var/www/salesmanpro
      script: 'workers/domain-ssl-worker.ts', 
      interpreter: 'node',
      // This tells Node to use ts-node to interpret the TS file on the fly
      node_args: '-r ts-node/register',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        // Ensure this points to your root so it can find your .env and prisma
        TS_NODE_PROJECT: './tsconfig.json', 
      }
    }
    // {
    //   name: 'ssl-worker',
    //   // If using TypeScript directly:
    //   script: 'node_modules/.bin/ts-node',
    //   args: 'workers/domain-ssl-worker.ts', // Path to your worker file
    //   instances: 1,      // NEVER run more than 1 instance of the SSL worker
    //   exec_mode: 'fork',
    //   watch: false,
    //   autorestart: true,
    //   env: {
    //     NODE_ENV: 'production',
    //     // Pass your env vars here or ensure they are in your .env file
    //   }
    // }
  ],
};