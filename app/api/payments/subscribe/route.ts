import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const { companyId, planId, amount, currency, billingPeriod, monthsPaidFor, yearsPaidFor } = await req.json();

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { user: true }
    });

    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    
    if (!PAYSTACK_SECRET) {
      return NextResponse.json({ error: "Missing PAYSTACK_TEST_SECRET_KEY on server" }, { status: 500 });
    }

    const email = company.user?.email;
    if (!email) return NextResponse.json({ error: "Email missing" }, { status: 400 });

    // 1. Create customer
    await fetch("https://api.paystack.co/customer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email })
    });

    // 2. Initialize Transaction
    const paymentRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency,
        metadata: { companyId, planId, billingPeriod, monthsPaidFor, yearsPaidFor }
      })
    });

    const data = await paymentRes.json();

    if (!paymentRes.ok) {
      return NextResponse.json({ error: "Payment initialization failed", details: data }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Server Error", details: error }, { status: 500 });
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
//       return NextResponse.json({ error: "Missing PAYSTACK_TEST_SECRET_KEY on server" }, { status: 500 });
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
