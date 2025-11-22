import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const callback = data?.Body?.stkCallback;

    if (!callback) {
      return new NextResponse("Invalid STK callback", { status: 400 });
    }

    console.log("M-Pesa STK Callback:", callback);

    /**
     * CALLBACK SAMPLE:
     * callback.ResultCode === 0 → success
     * callback.CallbackMetadata.Item[] → mpesaReceiptNumber, amount, phone
     */

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    Sentry.captureException(err);
    return new NextResponse("Error", { status: 400 });
  }
}
