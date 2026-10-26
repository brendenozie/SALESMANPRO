import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { encrypt } from "@/lib/crypto/aes";

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

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.companyId) {
      return withCors({ success: false, error: "Missing companyId parameter." }, 400);
    }

    const updatePayload: any = {
      isStripeEnabled: Boolean(body.isStripeEnabled),
      isPaypalEnabled: Boolean(body.isPaypalEnabled),
      isMpesaEnabled: Boolean(body.isMpesaEnabled),
      isPaystackEnabled: Boolean(body.isPaystackEnabled),
      isGhubaEnabled: Boolean(body.isGhubaEnabled),
      stripePublishableKey: body.stripePublishableKey || null,
      paypalClientId: body.paypalClientId || null,
      paystackPublicKey: body.paystackPublicKey || null,
      mpesaShortcode: body.mpesaShortcode || null,
      mpesaConsumerKey: body.mpesaConsumerKey || null,
      mpesaPasskey: body.mpesaPasskey || null,
      mpesaCallbackUrl: body.mpesaCallbackUrl || null,
      whatsappPaymentsEnabled: Boolean(body.whatsappPaymentsEnabled),
      whatsappPaymentInstructions: body.whatsappPaymentInstructions || null,
    };

    // Encrypt M-Pesa Secret Key if provided
    if (body.mpesaConsumerSecret) {
      const encrypted = encrypt(body.mpesaConsumerSecret.trim());
      updatePayload.mpesaSecret_encrypted = encrypted.value;
      updatePayload.mpesaSecret_iv = encrypted.iv;
      updatePayload.mpesaSecret_tag = encrypted.tag;
      updatePayload.mpesaConsumerSecret = null; // Do not store plaintext
    }

    // Encrypt Paystack Secret Key if provided
    if (body.paystackSecretKey) {
      const encrypted = encrypt(body.paystackSecretKey.trim());
      updatePayload.paystackSecret_encrypted = encrypted.value;
      updatePayload.paystackSecret_iv = encrypted.iv;
      updatePayload.paystackSecret_tag = encrypted.tag;
      updatePayload.paystackSecretKey = null; // Do not store plaintext
    }

    // Encrypt Stripe Secret Key if provided
    if (body.stripeSecretKey) {
      const encrypted = encrypt(body.stripeSecretKey.trim());
      updatePayload.stripeSecret_encrypted = encrypted.value;
      updatePayload.stripeSecret_iv = encrypted.iv;
      updatePayload.stripeSecret_tag = encrypted.tag;
      updatePayload.stripeSecretKey = null; // Do not store plaintext
    }

    // Encrypt PayPal Client Secret if provided
    if (body.paypalClientSecret) {
      const encrypted = encrypt(body.paypalClientSecret.trim());
      updatePayload.paypalSecret_encrypted = encrypted.value;
      updatePayload.paypalSecret_iv = encrypted.iv;
      updatePayload.paypalSecret_tag = encrypted.tag;
      updatePayload.paypalClientSecret = null; // Do not store plaintext
    }

    // Find existing settings for the company
    const existing = await prisma.paymentSettings.findFirst({
      where: { company: { id: body.companyId } },
    });

    let result;
    if (existing) {
      result = await prisma.paymentSettings.update({
        where: { id: existing.id },
        data: updatePayload,
      });
    } else {
      result = await prisma.paymentSettings.create({
        data: {
          company: { connect: { id: body.companyId } },
          ...updatePayload,
        },
      });
    }

    // Update shipping settings if pickup is specified
    if (typeof body.enablePickup === "boolean") {
      const existingShip = await prisma.shippingSettings.findFirst({
        where: { company: { id: body.companyId } },
      });
      if (existingShip) {
        await prisma.shippingSettings.update({
          where: { id: existingShip.id },
          data: { enablePickup: body.enablePickup },
        });
      } else {
        await prisma.shippingSettings.create({
          data: {
            company: { connect: { id: body.companyId } },
            enablePickup: body.enablePickup,
          },
        });
      }
    }

    return withCors({
      success: true,
      message: "Payment settings saved and encrypted successfully.",
      id: result.id,
    });
  } catch (error: any) {
    console.error("[UPDATE_PAYMENT_SETTINGS_ERROR]", error);
    return withCors({ success: false, error: error?.message || "Failed to save payment settings." }, 500);
  }
}
