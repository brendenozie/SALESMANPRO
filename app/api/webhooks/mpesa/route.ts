import { NextResponse } from "next/server";
import { processMpesaCallback } from "@/lib/whatsapp/payments/mpesaCallbackHandler";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await processMpesaCallback(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("[MPESA_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
