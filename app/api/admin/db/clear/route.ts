import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyBackupSecret } from "@/lib/verifyBackupSecret";
import { setProgress } from "@/lib/restoreProgress";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req) => {
  verifyBackupSecret(req);

  const restoreId = crypto.randomUUID();
  // Use Prisma's internal model list
  const models = Object.keys((prisma as any)._runtimeDataModel.models);

  const results: Record<string, any> = {};
  const errors: Record<string, string> = {};

  // 1. Delete Order: Models with many dependencies should usually be deleted FIRST.
  // Reversing is a good start, but we'll also handle failures gracefully.
  const deleteOrder = [...models].reverse();

  // 2. Increased concurrency slightly, but removed the slow .count() check
  const limit = pLimit(5);

  await Promise.all(
    deleteOrder.map((modelName, index) =>
      limit(async () => {
        const prismaKey =
          modelName.charAt(0).toLowerCase() + modelName.slice(1);
        const modelClient = (prisma as any)[prismaKey];

        if (!modelClient) {
          errors[modelName] = "Model key mapping failed";
          return;
        }

        try {
          // We jump straight to deleteMany.
          // If it's already empty, Mongo returns { count: 0 } almost instantly.
          const { count } = await modelClient.deleteMany({});

          results[modelName] = `${count} records cleared`;

          // Track progress based on original array length
          setProgress(restoreId, {
            currentModel: modelName,
            total: deleteOrder.length,
            completed: index + 1,
          });
        } catch (err: any) {
          console.error(`Failed to clear ${modelName}:`, err.message);
          errors[modelName] = err.message;
        }
      }),
    ),
  );

  const errorCount = Object.keys(errors).length;

  return Response.json({
    success: errorCount === 0,
    message:
      errorCount > 0
        ? `Cleared with ${errorCount} errors`
        : "Database wiped clean",
    restoreId,
    stats: results,
    errors: errorCount > 0 ? errors : undefined,
  });
});

/**
 * PARALLEL LIMIT HELPER
 * Ensures we don't overwhelm the MongoDB connection pool
 */
function pLimit(limit: number) {
  let active = 0;
  const queue: any[] = [];

  const next = () => {
    if (queue.length && active < limit) {
      active++;
      const nextTask = queue.shift();
      nextTask();
    }
  };

  return (fn: () => Promise<any>) =>
    new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          active--;
          next();
        }
      });
      next();
    });
}
