import { redisConnection } from "@/lib/redis";

export const WHATSAPP_WORKER_HEARTBEAT_KEY = "salesmanpro:whatsapp:worker:heartbeat";
const HEARTBEAT_TTL_SECONDS = 90;

export async function touchWhatsAppWorkerHeartbeat(): Promise<void> {
  await redisConnection.set(
    WHATSAPP_WORKER_HEARTBEAT_KEY,
    String(Date.now()),
    "EX",
    HEARTBEAT_TTL_SECONDS,
  );
}

export async function getWhatsAppWorkerHealth(): Promise<{
  status: "HEALTHY" | "UNHEALTHY" | "WARNING";
  ageMs?: number;
  message?: string;
}> {
  try {
    const raw = await redisConnection.get(WHATSAPP_WORKER_HEARTBEAT_KEY);
    if (!raw) {
      return {
        status: "UNHEALTHY",
        message: "WhatsApp worker has not reported a heartbeat",
      };
    }
    const ageMs = Date.now() - Number(raw);
    if (Number.isNaN(ageMs) || ageMs > HEARTBEAT_TTL_SECONDS * 1000) {
      return {
        status: "UNHEALTHY",
        ageMs,
        message: "WhatsApp worker heartbeat is stale",
      };
    }
    return { status: "HEALTHY", ageMs };
  } catch (error) {
    return {
      status: "UNHEALTHY",
      message: error instanceof Error ? error.message : "Heartbeat check failed",
    };
  }
}
