import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders/createOrder";
import { initiateMpesaPayment } from "@/lib/payments/mpesa";
import { initiatePaystackPayment } from "@/lib/payments/paystack";

import { z } from "zod";
import { sendOrderConfirmationEmail } from "@/lib/emails/orderEmail";
import { formatResponse } from "@/lib/formatResponse";

const orderSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cvv: z.string().optional(),
  mpesaPhone: z.string().optional(),
  promoCode: z.string().optional(),
  consumerId: z.string(),
  delivery: z.boolean().optional(),
  paymentOption: z.enum(["cod", "pickupatshop", "mpesa", "card", "paystack"]).default("cod"),
  items: z.array(
    z.object({
      marketplaceListingId: z.string(),
      date: z.string().optional(),
      timeSlot: z.string().optional(),
      quantity: z.number().positive(),
      price: z.number().positive(),
    })
  ),
  totalPrice: z.number().positive(),
  shippingAddress: z
    .object({
      display_name: z.string(),
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  shippingMethod: z.enum(["Standard", "Express", "AT SHOP"]).optional(),
});

/* -------------------------------------------------------------------------- */
/*                               HELPER FUNCTIONS                             */
/* -------------------------------------------------------------------------- */

function generateTrackingNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    
    if (!parsed.success) {
      return formatResponse(false, null, parsed.error.flatten(), 400);
    }
  
    const {
      consumerId,
      items,
      totalPrice,
      shippingAddress,
      shippingMethod,
      delivery,
      paymentOption,
      name,
      email,
      phone,
      cardNumber,
      cardExpiry,
      cvv,
      mpesaPhone,
      promoCode,
    } = parsed.data;
  
    const trackingNumber = `TRK${generateTrackingNumber()}`;
    let orderStatus = "PENDING";
    let deliveryStatus = "Order Placed";
    const responsePayload: Record<string, any> = {};

    // app/api/shop/orders/route.ts
    const order = await createOrder({
      consumerId,
      name,
      email,
      phone,
      mpesaPhone,
      promoCode,
      totalPrice,
      shippingAddress,
      shippingMethod,
      status: "PENDING",
      delivery,
      paymentOption,
      trackingNumber,
      deliveryStatus,
      items, // ✅ pass plain array here
    });


    console.log("Order created with ID:", order);
    let paymentResponse;

    switch (paymentOption) {
      case "mpesa":
        paymentResponse = await initiateMpesaPayment(order, body.paymentData.mpesaPhone);
        break;
      case "paystack":
        paymentResponse = await initiatePaystackPayment(order, body.email);
        break;
      case "cod":
      case "pickupatshop":
        paymentResponse = { message: "Payment on delivery or pickup confirmed." };
        break;
      default:
        paymentResponse = { message: "Unknown payment option" };
    }

    // await sendOrderConfirmationEmail(order);

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
