

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 1. Attempt to get country from hosting headers (Works on Vercel/Netlify)
  // Vercel uses 'x-vercel-ip-country'
  // const vercelCountry = req.headers.get("x-vercel-ip-country");
  
  // if (vercelCountry) {
  //   return NextResponse.json({ country: vercelCountry });
  // }

  // 2. Fallback for Localhost (Development)
  // Headers won't exist on localhost, so we default to Kenya for testing
  // if (process.env.NODE_ENV === 'development') {
  //    return NextResponse.json({ country: "Kenya" });
  // }

  // 3. Fallback: If headers fail, we try to get the client IP and ask ipapi
  // We must pass the CLIENT IP, otherwise we get the server's location
  const ip = req.headers.get("x-forwarded-for");
  
  try {
    // Only fetch if we actually have a user IP, otherwise ipapi returns the server location
    if (ip) {
        const res = await fetch(`https://ipapi.co/${ip}/json/`, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });
        const data = await res.json();
        return NextResponse.json({ country: data.country_name || "Unknown" });
    }
  } catch (error) {
      console.error("IP lookup error:", error);
  }

  return NextResponse.json({ country: "Unknown" });
}
