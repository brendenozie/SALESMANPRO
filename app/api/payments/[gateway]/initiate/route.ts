// app/api/payments/[gateway]/initiate/route.ts
import { NextResponse } from "next/server";
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateGhubaPayment } from "@/lib/paymentsv2/ghuba";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";

export async function POST(req: Request, { params }: { params: { gateway: string } }) {
  const { gateway } = params;
  const body = await req.json().catch(() => ({}));
  const { companyId, order, email, phone, mpesaPhone } = body;

  try {
    const cfg = await getCompanyPaymentConfig(companyId);

    switch (gateway) {
      case "ghuba": {
        const resp = await initiateGhubaPayment(order, cfg.credentials);
        return NextResponse.json({ success: true, provider: "ghuba", response: resp });
      }
      case "mpesa": {
        const phoneNumber = mpesaPhone ?? phone;
        if (!phoneNumber) return NextResponse.json({ success: false, error: "mpesaPhone required" }, { status: 400 });
        const resp = await initiateMpesaPayment(order, phoneNumber, cfg.credentials);
        return NextResponse.json({ success: true, provider: "mpesa", response: resp });
      }
      case "paystack": {
        const resp = await initiatePaystackPayment(order, email, cfg.credentials);
        return NextResponse.json({ success: true, provider: "paystack", response: resp });
      }
      case "stripe": {
        const resp = await initiateStripePaymentIntent(order, cfg.credentials);
        return NextResponse.json({ success: true, provider: "stripe", response: resp });
      }
      case "paypal": {
        const resp = await createPaypalOrder(order, cfg.credentials);
        return NextResponse.json({ success: true, provider: "paypal", response: resp });
      }
      default:
        return NextResponse.json({ success: false, error: "Unsupported provider" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
