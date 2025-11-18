import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      headers: { "User-Agent": "Mozilla/5.0" }, // ipapi requires user agent
    });

    const data = await res.json();
    return NextResponse.json({ country: data.country_name || "Unknown" });
  } catch (e) {
    console.error("IP lookup failed:", e);
    return NextResponse.json({ country: "Unknown" });
  }
}
