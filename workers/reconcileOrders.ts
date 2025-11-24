// import { prisma } from "@/lib/prisma";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// export async function reconcileOrders() {
//   const pending = await prisma.order.findMany({
//     where: { status: "pending" },
//   });

//   for (const order of pending) {
//     const pi = await stripe.paymentIntents.retrieve(order.paymentIntentId);
//     if (pi.status === "succeeded") {
//       await prisma.order.update({
//         where: { id: order.id },
//         data: { status: "paid" },
//       });
//     }
//   }
// }
