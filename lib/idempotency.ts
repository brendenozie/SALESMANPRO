
import prisma from "@/server/db/prismadb";

export async function withIdempotency(key: string, handler: () => Promise<any>) {
  const existing = await prisma.idempotency.findUnique({ where: { id: key } });

  if (existing && existing.response) return existing.response;

  if (!existing) {
    await prisma.idempotency.create({
      data: { id: key, locked: true },
    });
  }

  try {
    const result = await handler();

    await prisma.idempotency.update({
      where: { id: key },
      data: {
        locked: false,
        response: result,
      },
    });

    return result;
  } catch (err) {
    await prisma.idempotency.update({
      where: { id: key },
      data: { locked: false },
    });

    throw err;
  }
}
