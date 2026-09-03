
import prisma from "@/server/db/prismadb";

/**
 * Concurrency-safe Idempotency wrapper.
 * Prevents race condition duplicate key crashes and safely awaits active in-flight locks.
 */
export async function withIdempotency<T>(
  key: string,
  handler: () => Promise<T>,
  maxWaitMs = 5000,
): Promise<T> {
  // 1. Check existing record
  const existing = await prisma.idempotency.findUnique({ where: { id: key } });
  if (existing?.response) {
    return existing.response as T;
  }

  // 2. If existing and locked, wait for the other worker to finish
  if (existing?.locked) {
    const started = Date.now();
    while (Date.now() - started < maxWaitMs) {
      await new Promise((r) => setTimeout(r, 200));
      const poll = await prisma.idempotency.findUnique({ where: { id: key } });
      if (poll?.response) return poll.response as T;
      if (!poll?.locked) break;
    }
  }

  // 3. Acquire lock with race-condition catch
  let lockAcquired = false;
  try {
    await prisma.idempotency.create({
      data: { id: key, locked: true },
    });
    lockAcquired = true;
  } catch (err: any) {
    // Unique constraint violation (P2002): another request acquired lock concurrently
    const started = Date.now();
    while (Date.now() - started < maxWaitMs) {
      await new Promise((r) => setTimeout(r, 200));
      const poll = await prisma.idempotency.findUnique({ where: { id: key } });
      if (poll?.response) return poll.response as T;
      if (!poll?.locked) {
        lockAcquired = true;
        break;
      }
    }
  }

  try {
    const result = await handler();

    await prisma.idempotency.upsert({
      where: { id: key },
      update: {
        locked: false,
        response: result as any,
      },
      create: {
        id: key,
        locked: false,
        response: result as any,
      },
    });

    return result;
  } catch (err) {
    try {
      await prisma.idempotency.update({
        where: { id: key },
        data: { locked: false },
      });
    } catch (_) {}

    throw err;
  }
}

