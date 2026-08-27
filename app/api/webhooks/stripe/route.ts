// import { NextRequest, NextResponse } from "next/server";
// import Stripe from "stripe";

// export const config = {
//   api: { bodyParser: false } // critical for raw-body
// };

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20",
// });

// export async function POST(req: NextRequest) {
//   const rawBody = Buffer.from(await req.arrayBuffer());

//   const signature = req.headers.get("stripe-signature");
//   if (!signature) {
//     return NextResponse.json({ error: "Missing signature" }, { status: 400 });
//   }

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       rawBody,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (err: any) {
//     return NextResponse.json({ error: `Invalid signature` }, { status: 400 });
//   }

//   switch (event.type) {
//     case "payment_intent.succeeded":
//       // TODO: Reconcile order status & idempotency
//       break;
//   }

//   return NextResponse.json({ received: true });
// }
