import { NextRequest, NextResponse } from "next/server";

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
        return NextResponse.json({ country: data.country_name || "Unknown" });
    }

    return NextResponse.json({ country: "Unknown" });

  } catch (e) {
    console.error("Location lookup failed:", e);
    return NextResponse.json({ country: "Unknown" });
  }
}