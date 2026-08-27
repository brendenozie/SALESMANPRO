import { NextResponse } from "next/server";
<<<<<<< HEAD
import prisma from "@/server/db/prismadb";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const rawBody = await req.text();

    // Verify webhook signature
    const signature = req.headers.get("x-paystack-signature") || "";
    const expectedSignature = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("❌ Invalid Paystack signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const data = event.data;

    // Only handle successful charge events
    if (event.event === "charge.success") {
      const reference = data.reference;
      const amount = data.amount / 100; // Convert from kobo to currency units

      // Match order by reference or metadata
      const order = await prisma.customerOrder.findFirst({
        where: { trackingNumber: reference },
      });

      if (order) {
        await prisma.customerOrder.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            deliveryStatus: "Payment Received",
          },
        });
        // console.log(`✅ Order ${order.trackingNumber} marked as PAID`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
=======
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
>>>>>>> c00ac535 (Fresh initialization and recovery)
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
