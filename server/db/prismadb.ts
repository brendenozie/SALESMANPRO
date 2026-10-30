import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * OfflinePrismaClient guarantees type resolution for offline sync models
 * across all editor environments and build runners, preventing stale TSServer
 * cache issues when opening sync routes.
 */
export type OfflinePrismaClient = PrismaClient & {
  registeredDevice: any;
  syncSequenceCounter: any;
  syncChangeLog: any;
  syncOperationReceipt: any;
  syncConflictRecord: any;
  stockAllocation: any;
};

export const client: OfflinePrismaClient = (globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })) as OfflinePrismaClient;

globalThis.prisma = client as unknown as PrismaClient;

export default client;
