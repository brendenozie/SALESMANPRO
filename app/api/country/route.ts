import { NextRequest, NextResponse } from "next/server";

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
   
    // 3. SLOWEST: Call ipapi with the USER'S IP
    // We must get the IP from headers, otherwise ipapi sees the server's IP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const userIp = forwardedFor ? forwardedFor.split(',')[0] : null;

    if (userIp) {
        const res = await fetch(`https://ipapi.co/${userIp}/json/`, {
             headers: { "User-Agent": "Mozilla/5.0" }
        });
        const data = await res.json();
        return withCors({ country: data.country_name || "Unknown" });
    }

    return withCors({ country: "Unknown" });

  } catch (e) {
    console.error("Location lookup failed:", e);
    return withCors({ country: "Unknown" }, 500);
  }
}