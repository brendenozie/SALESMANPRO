import crypto from "crypto";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const sentSig = req.headers.get("x-ghuba-signature");

    const expected = crypto
      .createHmac("sha256", process.env.GHUBA_API_KEY!)
      .update(raw)
      .digest("hex");

    if (sentSig !== expected) {
      return new NextResponse("Invalid Ghuba webhook signature", { status: 400 });
    }

    const event = JSON.parse(raw);

    console.log("Ghuba webhook received:", event.type);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    Sentry.captureException(err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
