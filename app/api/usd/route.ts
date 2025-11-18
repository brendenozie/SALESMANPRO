import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/KES");
    const data = await res.json();
    return NextResponse.json({ usd: data?.rates?.USD || null });
  } catch (e) {
    console.error("USD conversion failed:", e);
    return NextResponse.json({ usd: null });
  }
}
