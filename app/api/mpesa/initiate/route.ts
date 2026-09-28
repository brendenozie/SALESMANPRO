import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

const MPESA_BASE_URL = process.env.MPESA_BASE_URL!;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE!;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY!;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL!; // e.g. https://yourdomain.com/api/mpesa/callback

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}


// Function to get access token
async function getMpesaToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { orderId, phoneNumber, amount } = await req.json();

    // ✅ Get order
    const order = await prisma.customerOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return withCors({ message: "Order not found" }, 404);
    }

    const token = await getMpesaToken();

    // Generate password
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

    // STK push request payload
    const body = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: CALLBACK_URL,
      AccountReference: order.id, // Optional: internal reference
      TransactionDesc: `Payment for order ${order.id}`,
    };

    // 🔹 Initiate STK Push
    const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    // If Safaricom accepted the request, store the CheckoutRequestID on the order
    if (result.ResponseCode === "0" && result.CheckoutRequestID) {
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          trackingNumber: result.CheckoutRequestID, // ✅ store this for callback matching
          transactionReference: result.MerchantRequestID,
          paymentMethod: "MPESA",
          paymentStatus: "PENDING",
          status: "PENDING",
        },
      });
    }

    return withCors({
      message: result.CustomerMessage,
      mpesaResponse: result,
    });
  } catch (error) {
    console.error("STK Push initiation error:", error);
    return withCors({ error: "Server error" }, 500);
  }
}
