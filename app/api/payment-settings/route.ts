import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || searchParams.get("storeId");

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Missing companyId parameter." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        PaymentSettings: true,
        shippingSettings: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Store not found." },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const s = company.PaymentSettings;
    const ship = company.shippingSettings;

    // Return safe configuration with secrets masked
    const maskedSettings = {
      companyId,
      companyName: company.name,
      isGhubaEnabled: Boolean(s?.isGhubaEnabled),

      // M-Pesa Daraja
      isMpesaEnabled: Boolean(s?.isMpesaEnabled),
      mpesaShortcode: s?.mpesaShortcode || "",
      mpesaConsumerKey: s?.mpesaConsumerKey || "",
      hasMpesaSecret: Boolean(s?.mpesaSecret_encrypted || s?.mpesaConsumerSecret),
      mpesaCallbackUrl: s?.mpesaCallbackUrl || "",

      // Paystack
      isPaystackEnabled: Boolean(s?.isPaystackEnabled),
      paystackPublicKey: s?.paystackPublicKey || "",
      hasPaystackSecret: Boolean(s?.paystackSecret_encrypted || s?.paystackSecretKey),

      // Stripe
      isStripeEnabled: Boolean(s?.isStripeEnabled),
      stripePublishableKey: s?.stripePublishableKey || "",
      hasStripeSecret: Boolean(s?.stripeSecret_encrypted || s?.stripeSecretKey),

      // PayPal
      isPaypalEnabled: Boolean(s?.isPaypalEnabled),
      paypalClientId: s?.paypalClientId || "",
      hasPaypalSecret: Boolean(s?.paypalSecret_encrypted || s?.paypalClientSecret),

      // Till / Manual
      tillNumber: (s as any)?.tillNumber || "",
      enablePickup: Boolean(ship?.enablePickup),
      whatsappPaymentsEnabled: Boolean(s?.whatsappPaymentsEnabled),
      whatsappPaymentInstructions: s?.whatsappPaymentInstructions || "",
    };

    return NextResponse.json(
      { success: true, settings: maskedSettings },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("[GET_PAYMENT_SETTINGS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve payment settings." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
