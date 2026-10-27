/**
 * app/api/notifications/stream/route.ts
 *
 * Real-Time Server-Sent Events (SSE) Notification Stream.
 * Unifies real-time delivery across SalesmanPro Web, Ghuba Marketplace,
 * and Attached Windows Desktop (WPF WebView2) applications.
 *
 * Backed by Redis Pub/Sub: listens for 'notifications:user:<userId>' events
 * including new incoming notifications and cross-device read synchronizations.
 */

import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/notifications/authHelper";
import { createRedisSubscriber, isRedisAvailable } from "@/lib/redis";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || !user.id) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const userId = user.id;
    const encoder = new TextEncoder();
    let subscriber: any = null;
    let heartbeatTimer: NodeJS.Timeout | null = null;
    let isClosed = false;

    const stream = new ReadableStream({
      async start(controller) {
        // 1. Send initial connected greeting & heartbeat interval
        try {
          controller.enqueue(
            encoder.encode(`event: connected\ndata: ${JSON.stringify({ userId, connectedAt: new Date().toISOString() })}\n\n`)
          );
        } catch {
          return;
        }

        // 2. Set up keepalive heartbeat every 20 seconds
        heartbeatTimer = setInterval(() => {
          if (isClosed) return;
          try {
            controller.enqueue(encoder.encode(`: keepalive\n\n`));
          } catch {
            cleanup();
          }
        }, 20000);

        // 3. Connect to Redis Pub/Sub channel for this specific user
        if (isRedisAvailable()) {
          try {
            subscriber = createRedisSubscriber();
            const channel = `notifications:user:${userId}`;

            await subscriber.subscribe(channel);

            subscriber.on("message", (ch: string, message: string) => {
              if (isClosed || ch !== channel) return;
              try {
                const parsed = JSON.parse(message);
                const eventName = parsed.type === "NEW_NOTIFICATION" ? "notification" : "sync";
                controller.enqueue(
                  encoder.encode(`event: ${eventName}\ndata: ${message}\n\n`)
                );
              } catch (parseErr) {
                controller.enqueue(
                  encoder.encode(`event: message\ndata: ${message}\n\n`)
                );
              }
            });

            subscriber.on("error", (err: any) => {
              console.warn(`[SSE_STREAM] Redis subscriber error for user ${userId}:`, err?.message || err);
            });
          } catch (redisErr: any) {
            console.warn(`[SSE_STREAM] Failed to bind Redis subscriber for user ${userId}:`, redisErr?.message || redisErr);
          }
        }

        const cleanup = () => {
          if (isClosed) return;
          isClosed = true;
          if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
          if (subscriber) {
            try {
              subscriber.unsubscribe().catch(() => {});
              subscriber.quit().catch(() => {});
            } catch {
              // Ignore cleanup errors
            }
            subscriber = null;
          }
          try {
            controller.close();
          } catch {
            // Controller might already be closed
          }
        };

        // 4. Handle client disconnection
        req.signal.addEventListener("abort", () => {
          cleanup();
        });
      },
      cancel() {
        isClosed = true;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (subscriber) {
          subscriber.unsubscribe().catch(() => {});
          subscriber.quit().catch(() => {});
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Disables Nginx buffering for instantaneous SSE delivery
        ...CORS_HEADERS,
      },
    });
  } catch (error: any) {
    console.error("[SSE_NOTIFICATION_STREAM_ERROR]", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || "Stream error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
}
