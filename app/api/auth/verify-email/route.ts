import { NextRequest, NextResponse } from "next/server";
import { consumeVerificationToken } from "@/lib/auth/verification";

export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get("email") || "").trim().toLowerCase();
  const token = req.nextUrl.searchParams.get("token") || "";

  if (!email || !token) {
    return NextResponse.json({ ok: false, error: "Invalid verification link." }, { status: 400 });
  }

  const ok = await consumeVerificationToken(email, token);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "This verification link is invalid or expired." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const token = String(body.token || "");
  if (!email || !token) {
    return NextResponse.json({ ok: false, error: "Invalid verification link." }, { status: 400 });
  }
  const ok = await consumeVerificationToken(email, token);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "This verification link is invalid or expired." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
