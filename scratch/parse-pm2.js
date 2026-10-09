const fs = require('fs');

const raw = fs.readFileSync('/var/www/salesmanpro/pm2-list.json', 'utf8');
const data = JSON.parse(raw);

console.log("=== PM2 PROCESSES RUNNING ON VPS ===");
data.forEach(p => {
  const env = p.pm2_env || {};
  let dbUrl = env.DATABASE_URL || '';
  if (dbUrl) {
    dbUrl = dbUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://<REDACTED_USER>:<REDACTED_PASSWORD>@');
  }
  let redisUrl = env.REDIS_URL || '';
  if (redisUrl) {
    redisUrl = redisUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://<REDACTED_USER>:<REDACTED_PASSWORD>@');
  }

  console.log(`[ID ${p.pm_id}] Name: ${p.name} | PID: ${p.pid} | Status: ${env.status} | Mode: ${env.exec_mode} | Instances: ${env.instances}`);
  console.log(`  CWD: ${env.pm_cwd}`);
  console.log(`  Script: ${env.pm_exec_path}`);
  if (dbUrl) console.log(`  DATABASE_URL: ${dbUrl}`);
  if (redisUrl) console.log(`  REDIS_URL: ${redisUrl}`);
  console.log(`  NODE_ENV: ${env.NODE_ENV}`);
  console.log(`  Uptime / Restarts: ${env.restart_time} restarts, created: ${new Date(env.pm_uptime).toISOString()}`);
  console.log('---');
});
