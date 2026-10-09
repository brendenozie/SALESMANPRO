const { Queue } = require('/var/www/salesmanpro/current/node_modules/bullmq');

const queueNames = [
  "salesmanpro-ai-jobs",
  "ai-workforce",
  "whatsapp-inbound",
  "salesmanpro-database-backups",
  "salesmanpro-database-restores",
  "salesmanpro-database-maintenance",
  "media-processing"
];

const connection = { host: "127.0.0.1", port: 6379, maxRetriesPerRequest: null };

async function checkQueues() {
  console.log("=== BULLMQ QUEUE HEALTH & METRICS AUDIT ===");
  for (const name of queueNames) {
    const q = new Queue(name, { connection });
    try {
      const counts = await q.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused');
      const isPaused = await q.isPaused();
      console.log(`Queue [${name}]:`);
      console.log(`  Waiting:   ${counts.waiting}`);
      console.log(`  Active:    ${counts.active}`);
      console.log(`  Completed: ${counts.completed}`);
      console.log(`  Failed:    ${counts.failed}`);
      console.log(`  Delayed:   ${counts.delayed}`);
      console.log(`  Paused:    ${isPaused}`);
    } catch (err) {
      console.error(`Error querying queue ${name}:`, err.message);
    } finally {
      await q.close();
    }
  }
  console.log("=== AUDIT COMPLETE ===");
}

checkQueues().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
