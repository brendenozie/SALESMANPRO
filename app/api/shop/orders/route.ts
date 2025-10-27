import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders/createOrder";
import { initiateMpesaPayment } from "@/lib/payments/mpesa";
import { initiatePaystackPayment } from "@/lib/payments/paystack";
import { sendOrderConfirmationEmail } from "@/lib/emails/orderEmail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order = await createOrder(body);

    let paymentResponse;

    switch (body.paymentOption) {
      case "mpesa":
        paymentResponse = await initiateMpesaPayment(order, body.mpesaPhone);
        break;
      case "paystack":
        paymentResponse = await initiatePaystackPayment(order, body.email);
        break;
      case "cash_on_delivery":
      case "pickup_at_shop":
        paymentResponse = { message: "Payment on delivery or pickup confirmed." };
        break;
      default:
        paymentResponse = { message: "Unknown payment option" };
    }

    await sendOrderConfirmationEmail(order);

    return NextResponse.json({
      success: true,
      order,
      paymentResponse,
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
