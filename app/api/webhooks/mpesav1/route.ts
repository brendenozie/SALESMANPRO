import { NextResponse } from "next/server";
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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
