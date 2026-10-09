const fs = require('fs');

const bullmqConnStr = "connection: { host: '127.0.0.1', port: 6379, maxRetriesPerRequest: null }";

const targetFiles = [
  '/var/www/salesmanpro/current/dist-worker/lib/ai/queue/aiWorker.js',
  '/var/www/salesmanpro/current/dist-worker/workers/ai-workforce-worker.js',
  '/var/www/salesmanpro/current/dist-worker/lib/backup/queue/backupWorker.js',
  '/var/www/salesmanpro/current/dist-worker/lib/media/queue/video-transcode.worker.js',
  '/var/www/salesmanpro/current/dist-worker/lib/whatsapp/queue/worker.js'
];

console.log('=== DEPLOYING TARGETED BULLMQ CONNECTION FIX ===');

for (const filepath of targetFiles) {
  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filepath}`);
    process.exit(1);
  }

  // 1. Create backup
  const backupPath = `${filepath}.bak_bullmq_${Date.now()}`;
  fs.copyFileSync(filepath, backupPath);
  console.log(`Backed up ${filepath} -> ${backupPath}`);

  // 2. Read content
  let content = fs.readFileSync(filepath, 'utf8');

  // 3. Replace connection: redis_1.redisConnection
  const count = (content.match(/connection:\s*redis_1\.redisConnection/g) || []).length;
  if (count === 0) {
    console.warn(`No occurrences of connection: redis_1.redisConnection found in ${filepath}`);
  } else {
    content = content.replace(/connection:\s*redis_1\.redisConnection/g, bullmqConnStr);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Patched ${count} occurrence(s) in ${filepath}`);
  }
}

console.log('All 5 target worker files successfully patched.');
