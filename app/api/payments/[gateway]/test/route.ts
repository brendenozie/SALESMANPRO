// app/api/payments/[gateway]/test/route.ts
import { NextResponse } from "next/server";
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { getCompanyPaymentConfig as _noop } from "@/lib/paymentsv2/index"; // keep import lint happy


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { gateway: string } },
) {
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid or missing request body" },
      { status: 400 },
    );
  }
// export async function POST(req: Request, { params }: { params: { gateway: string } }) {
  const { gateway } = params;
//   const body = await req.json().catch(() => ({}));
  const companyId = body.companyId;

  try {
    const cfg = await getCompanyPaymentConfig(companyId);

    // Basic checks per gateway
    if (gateway === "ghuba") {
      const c = cfg.credentials;
      if (!c.ghubaApiKey || !c.ghubaMerchantId) return NextResponse.json({ label: "Ghuba", success: false, response: "Missing credentials" }, { status: 400 });
      return NextResponse.json({ label: "Ghuba", success: true, response: "Credentials present" });
    }

    if (gateway === "mpesa") {
      const c = cfg.credentials;
      try {
        // attempt to fetch token
        const tokenResp = await fetch(`${c.baseUrl ?? process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
          method: "GET",
          headers: {
            Authorization: `Basic ${Buffer.from(`${c.consumerKey}:${c.consumerSecret}`).toString("base64")}`,
          },
        });
        if (!tokenResp.ok) {
          const txt = await tokenResp.text().catch(() => "");
          return NextResponse.json({ label: "M-Pesa", success: false, response: txt }, { status: 400 });
        }
        return NextResponse.json({ label: "M-Pesa", success: true, response: "Token OK" });
      } catch (err: any) {
        return NextResponse.json({ label: "M-Pesa", success: false, response: err?.message ?? String(err) }, { status: 500 });
      }
    }

    if (gateway === "paystack") {
      const secret = cfg.credentials.secretKey;
      if (!secret) return NextResponse.json({ label: "Paystack", success: false, response: "Missing secret" }, { status: 400 });
      const ping = await fetch(`${cfg.credentials.baseUrl ?? process.env.PAYSTACK_BASE_URL}/transaction?perPage=1`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const json = await ping.json().catch(() => null);
      return NextResponse.json({ label: "Paystack", success: ping.ok, response: json });
    }

    if (gateway === "stripe") {
      const secret = cfg.credentials.secretKey;
      if (!secret) return NextResponse.json({ label: "Stripe", success: false, response: "Missing secret" }, { status: 400 });
      // Try listing payment methods lightly
      const ping = await fetch("https://api.stripe.com/v1/charges?limit=1", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const json = await ping.json().catch(() => null);
      return NextResponse.json({ label: "Stripe", success: ping.ok, response: json });
    }

    if (gateway === "paypal") {
      const c = cfg.credentials;
      try {
        const tokenResp = await fetch(`${c.baseUrl ?? process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${c.clientId}:${c.clientSecret}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        });
        const ok = tokenResp.ok;
        return NextResponse.json({ label: "PayPal", success: ok, response: ok ? "Token OK" : await tokenResp.text() });
      } catch (err: any) {
        return NextResponse.json({ label: "PayPal", success: false, response: err?.message ?? String(err) }, { status: 500 });
      }
    }

    return NextResponse.json({ label: gateway, success: false, response: "Unknown gateway" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ label: gateway, success: false, response: err?.message ?? String(err) }, { status: 500 });
  }
}
