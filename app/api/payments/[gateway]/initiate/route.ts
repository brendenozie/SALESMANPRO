// app/api/payments/[gateway]/initiate/route.ts
import { NextResponse } from "next/server";
import { resolvePaymentConfiguration, PaymentProvider } from "@/lib/payments/resolver";
import { initiateMpesaPayment } from "@/lib/payments/mpesa";
import { initiatePaystackPayment } from "@/lib/payments/paystack";
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";
import { normalizePhoneNumber } from "@/lib/whatsapp/normalizePhone";

export async function POST(req: Request, { params }: { params: { gateway: string } }) {
  const { gateway } = params;
  const body = await req.json().catch(() => ({}));
  const { companyId, order, email, phone, mpesaPhone } = body;

  const gwUpper = gateway.toUpperCase() as PaymentProvider;

  try {
    const resolved = await resolvePaymentConfiguration({
      purpose: "ORDER",
      provider: gwUpper === ("GHUBA" as any) ? "PAYSTACK" : gwUpper,
      storeId: companyId,
    });

    switch (gateway.toLowerCase()) {
      case "ghuba":
      case "paystack": {
        const resp = await initiatePaystackPayment(order, email, resolved.credentials as any);
        return NextResponse.json({
          success: true,
          provider: "paystack",
          ownership: resolved.ownership,
          credentialSource: resolved.credentialSource,
          response: resp,
        });
      }
      case "mpesa": {
        const rawNumber = mpesaPhone ?? phone;
        const normalized = normalizePhoneNumber(rawNumber);
        if (!normalized) {
          return NextResponse.json({ success: false, error: "Valid M-Pesa phone number required" }, { status: 400 });
        }
        const resp = await initiateMpesaPayment(order, normalized, resolved.credentials as any);
        return NextResponse.json({
          success: true,
          provider: "mpesa",
          ownership: resolved.ownership,
          credentialSource: resolved.credentialSource,
          response: resp,
        });
      }
      case "stripe": {
        const resp = await initiateStripePaymentIntent(order, resolved.credentials);
        return NextResponse.json({
          success: true,
          provider: "stripe",
          ownership: resolved.ownership,
          credentialSource: resolved.credentialSource,
          response: resp,
        });
      }
      case "paypal": {
        const resp = await createPaypalOrder(order, resolved.credentials);
        return NextResponse.json({
          success: true,
          provider: "paypal",
          ownership: resolved.ownership,
          credentialSource: resolved.credentialSource,
          response: resp,
        });
      }
      case "till":
      case "mpesatill": {
        return NextResponse.json({
          success: true,
          provider: "till",
          ownership: resolved.ownership,
          credentialSource: resolved.credentialSource,
          credentials: resolved.credentials,
        });
      }
      default:
        return NextResponse.json({ success: false, error: "Unsupported provider" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
