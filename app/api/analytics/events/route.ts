/**
 * app/api/analytics/events/route.ts
 *
 * Lightweight, high-throughput ingestion endpoint for product interaction telemetry.
 * POST /api/analytics/events
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { enqueueTelemetryBatch } from "@/lib/analytics/queue/analyticsQueue";
import { TelemetryBatchRequest, TelemetryEventPayload } from "@/lib/analytics/types";

// Maximum allowable batch payload size (64KB)
const MAX_PAYLOAD_BYTES = 64 * 1024;
const MAX_EVENTS_PER_BATCH = 50;

// Events that can only be emitted by authoritative server-side hooks, not raw client endpoints
const PROTECTED_SERVER_EVENTS = new Set(["ORDER_PAID"]);

export async function POST(request: NextRequest) {
  try {
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: "Payload exceeds size limit" },
        { status: 413 }
      );
    }

    const body: TelemetryBatchRequest = await request.json();
    if (!body || !Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload: 'events' array required" },
        { status: 400 }
      );
    }

    // Cap batch size to prevent abuse
    const rawEvents = body.events.slice(0, MAX_EVENTS_PER_BATCH);

    // Attempt to extract session user identity if present
    let authUserId: string | undefined;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user && (session.user as any).id) {
        authUserId = (session.user as any).id;
      }
    } catch {
      // Non-fatal, proceed as anonymous/client-provided
    }

    const sanitizedEvents: TelemetryEventPayload[] = [];

    for (const ev of rawEvents) {
      if (!ev || typeof ev.eventType !== "string") continue;

      // Disallow client forgery of server-verified revenue/paid events
      if (PROTECTED_SERVER_EVENTS.has(ev.eventType)) {
        continue;
      }

      // Discard invalid IDs or oversized metadata
      const sanitizedMeta = ev.metadata && typeof ev.metadata === "object"
        ? JSON.parse(JSON.stringify(ev.metadata).slice(0, 1024))
        : undefined;

      sanitizedEvents.push({
        eventType: ev.eventType,
        marketplaceListingId: typeof ev.marketplaceListingId === "string" ? ev.marketplaceListingId.slice(0, 36) : undefined,
        productId: typeof ev.productId === "string" ? ev.productId.slice(0, 36) : undefined,
        companyId: typeof ev.companyId === "string" ? ev.companyId.slice(0, 36) : undefined,
        storeId: typeof ev.storeId === "string" ? ev.storeId.slice(0, 64) : undefined,
        userId: authUserId || (typeof ev.userId === "string" ? ev.userId.slice(0, 36) : undefined),
        consumerId: typeof ev.consumerId === "string" ? ev.consumerId.slice(0, 36) : undefined,
        customerId: typeof ev.customerId === "string" ? ev.customerId.slice(0, 36) : undefined,
        anonymousVisitorId: typeof ev.anonymousVisitorId === "string" ? ev.anonymousVisitorId.slice(0, 64) : undefined,
        sessionId: typeof ev.sessionId === "string" ? ev.sessionId.slice(0, 64) : undefined,
        channel: ev.channel || "GHUBA",
        sourcePage: typeof ev.sourcePage === "string" ? ev.sourcePage.slice(0, 128) : undefined,
        sourceSection: typeof ev.sourceSection === "string" ? ev.sourceSection.slice(0, 64) : undefined,
        referrer: typeof ev.referrer === "string" ? ev.referrer.slice(0, 128) : undefined,
        deviceType: ev.deviceType || "DESKTOP",
        country: typeof ev.country === "string" ? ev.country.slice(0, 3) : undefined,
        metadata: sanitizedMeta,
        dedupeKey: typeof ev.dedupeKey === "string" ? ev.dedupeKey.slice(0, 128) : undefined,
        timestamp: typeof ev.timestamp === "number" ? ev.timestamp : Date.now(),
      });
    }

    if (sanitizedEvents.length === 0) {
      return NextResponse.json({ success: true, accepted: 0 }, { status: 202 });
    }

    // Queue for asynchronous processing
    await enqueueTelemetryBatch(sanitizedEvents);

    return NextResponse.json(
      {
        success: true,
        accepted: sanitizedEvents.length,
      },
      { status: 202 }
    );
  } catch (error: any) {
    console.warn("[ANALYTICS_INGESTION_ERROR]", error?.message);
    return NextResponse.json(
      { error: "Failed to process telemetry" },
      { status: 500 }
    );
  }
}
