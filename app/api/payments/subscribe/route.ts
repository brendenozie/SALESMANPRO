import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const { companyId, planId, currency, amount } = await req.json();

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { user: true }
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

    if (!PAYSTACK_SECRET) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY missing" },
        { status: 500 }
      );
    }

    const email = company.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Company email missing" }, { status: 400 });
    }

    // -----------------------------
    // 1. Create / Get Paystack User
    // -----------------------------
    const customerRes = await fetch("https://api.paystack.co/customer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email })
    });

    const customerData = await customerRes.json();

    if (!customerRes.ok) {
      return NextResponse.json(
        { error: "Failed to create customer", details: customerData },
        { status: 400 }
      );
    }

    // -----------------------------
    // 2. INIT TRANSACTION
    // -----------------------------
    const paymentRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,              // MUST be already in cents (KES*100 or USD*100)
        currency,            // "KES" or "USD"
        callback_url: `${process.env.NEXT_PUBLIC_API_URL}/payments/paystack/verify-subscription`,
        metadata: { companyId, planId }
      })
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok) {
      return NextResponse.json(
        { error: "Paystack init failed", details: paymentData },
        { status: 400 }
      );
    }

    // RETURN ONLY WHAT FRONTEND NEEDS
    return NextResponse.json({
      status: true,
      message: "Transaction initiated",
      data: {
        reference: paymentData.data.reference,
        authorization_url: paymentData.data.authorization_url,
        access_code: paymentData.data.access_code
      }
    });

  } catch (err) {
    console.error("PAYSTACK ERROR:", err);
    return NextResponse.json(
      { error: "Server crashed", details: err },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";

// export async function POST(req: Request) {
//   try {
//     const { companyId, planId } = await req.json();

//     const company = await prisma.company.findUnique({
//       where: { id: companyId },
//       include: { user: true }
//     });

//     if (!company) {
//       return NextResponse.json({ error: "Company not found" }, { status: 404 });
//     }

//     const plan = await prisma.plan.findUnique({ where: { id: planId } });

//     if (!plan) {
//       return NextResponse.json({ error: "Plan not found" }, { status: 404 });
//     }

//     // MUST USE SERVER SECRET KEY
//     const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

//     if (!PAYSTACK_SECRET) {
//       return NextResponse.json({ error: "Missing PAYSTACK_SECRET_KEY on server" }, { status: 500 });
//     }

//     // 1. Create Paystack Customer
//     const customerRes = await fetch("https://api.paystack.co/customer", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${PAYSTACK_SECRET}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email: company.user?.email
//       })
//     });

//     const customerData = await customerRes.json();

//     if (!customerRes.ok) {
//       return NextResponse.json(
//         { error: "Paystack customer creation failed", details: customerData },
//         { status: 400 }
//       );
//     }

//     // 2. Initialize Transaction
//     const paymentRes = await fetch("https://api.paystack.co/transaction/initialize", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${PAYSTACK_SECRET}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email: company.user?.email,
//         amount: Number(plan.price) * 100,
//         callback_url: `${process.env.NEXT_PUBLIC_API_URL}/payments/paystack/verify-subscription`,
//         metadata: {
//           companyId,
//           planId,
//         }
//       })
//     });

//     const paymentData = await paymentRes.json();

//     if (!paymentRes.ok) {
//       return NextResponse.json(
//         { error: "Paystack transaction init failed", details: paymentData },
//         { status: 400 }
//       );
//     }

//     // SUCCESS
//     return NextResponse.json(paymentData);

//   } catch (e) {
//     console.error("Paystack error:", e);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
