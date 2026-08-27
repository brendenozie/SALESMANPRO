module.exports = {
  apps: [
    {
      name: 'salesmanpro',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
<<<<<<< HEAD
      instances: 3,           // Back to 2 instances for better performance
      exec_mode: 'cluster',   // Cluster mode is fine now that we have RAM room
=======
      instances: 3,
      exec_mode: 'cluster',
>>>>>>> c00ac535 (Fresh initialization and recovery)
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
<<<<<<< HEAD
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
      script: './dist-worker/workers/domain-ssl-worker.js', // Point to compiled JS
      node_args: "--max-old-space-size=150", // Hard limit Node to 150MB RAM
=======
      max_memory_restart: '4G',
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      autorestart: true,
      kill_timeout: 3000,
      watch: false,
    },
    {
      name: 'ssl-worker',
      script: './dist-worker/workers/domain-ssl-worker.js',
      node_args: '--max-old-space-size=150',
>>>>>>> c00ac535 (Fresh initialization and recovery)
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
<<<<<<< HEAD
      // Add a memory limit to force a restart if it leaks
      max_memory_restart: '200M'
    }
    // {
    //   name: 'ssl-worker',
    //   // Use the full relative path from your project root
    //   script: 'workers/domain-ssl-worker.ts', 
    //   interpreter: 'node',
    //   // This combined flag handles TS execution AND the @/ aliases
    //   node_args: '-r ts-node/register -r tsconfig-paths/register',
    //   instances: 1,
    //   exec_mode: 'fork',
    //   env: {
    //     NODE_ENV: 'production',
    //     TS_NODE_PROJECT: './tsconfig.json',
    //   }
    // }
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
=======
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
>>>>>>> c00ac535 (Fresh initialization and recovery)
  ],
};