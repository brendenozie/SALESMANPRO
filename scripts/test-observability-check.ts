import { getRedisHealth } from "../lib/observability/redisMonitor";
import { getAllQueueStatuses } from "../lib/observability/queueMonitor";
import { getBackupStorageProvider } from "../lib/backup/storage/storageProvider";

async function main() {
  console.log("--- Testing Redis Health ---");
  const redis = await getRedisHealth();
  console.log("Redis Health:", JSON.stringify(redis, null, 2));

  console.log("\n--- Testing Storage Provider ---");
  const storage = getBackupStorageProvider() as any;
  console.log("Storage Name:", storage.name);
  console.log("Storage Bucket:", storage.bucket);

  console.log("\n--- Testing Queue Statuses ---");
  const queues = await getAllQueueStatuses();
  console.log("Queues count:", queues.length);
  for (const q of queues) {
    console.log(`- ${q.name} (${q.displayName}): isHealthy=${q.isHealthy}, waiting=${q.waiting}, active=${q.active}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
