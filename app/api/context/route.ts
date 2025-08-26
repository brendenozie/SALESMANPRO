// app/api/context/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const headers = req.headers;

  const host = headers.get("x-requested-host") || "";
  const subdomain = headers.get("x-requested-subdomain") || "";
  const originalPath = headers.get("x-original-path") || "";

  return NextResponse.json({
    host,
    subdomain,
    originalPath, // 👈 now available
  });
}
