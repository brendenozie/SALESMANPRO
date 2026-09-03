import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache } from "@/lib/cache";

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const userIp = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

    if (userIp && userIp !== "127.0.0.1" && userIp !== "::1") {
      const cacheKey = `geo:country:${userIp}`;

      const country = await fetchWithCache(
        cacheKey,
        async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          try {
            const res = await fetch(`https://ipapi.co/${userIp}/json/`, {
              headers: { "User-Agent": "Mozilla/5.0" },
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!res.ok) return "Unknown";
            const data = await res.json();
            return data.country_name || "Unknown";
          } catch (fetchErr) {
            clearTimeout(timeoutId);
            return "Unknown";
          }
        },
        86400 // 24 hours TTL
      );

      return withCors(
        { country },
        200,
        { "Cache-Control": "private, max-age=86400, stale-while-revalidate=43200" }
      );
    }

    return withCors({ country: "Unknown" });
  } catch (e) {
    console.error("Location lookup failed:", e);
    return withCors({ country: "Unknown" }, 200);
  }
}