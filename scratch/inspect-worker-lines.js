const fs = require('fs');

const files = [
  '/var/www/salesmanpro/current/dist-worker/lib/ai/queue/aiWorker.js',
  '/var/www/salesmanpro/current/dist-worker/workers/ai-workforce-worker.js',
  '/var/www/salesmanpro/current/dist-worker/lib/backup/queue/backupWorker.js',
  '/var/www/salesmanpro/current/dist-worker/lib/media/queue/video-transcode.worker.js',
  '/var/www/salesmanpro/current/dist-worker/lib/whatsapp/queue/worker.js'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    console.log(`=== ${f} ===`);
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('connection:') || line.includes('new bullmq_1.Worker')) {
        console.log(`L${idx + 1}: ${line}`);
      }
    });
  } else {
    console.log(`MISSING: ${f}`);
  }
}
