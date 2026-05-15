import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

import { createOrder as createOrderRecord } from "@/lib/orders/createOrder";
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
// import { initiateGhubaPayment } from "@/lib/paymentsv2/ghuba";
import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack";
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";

// Import your application's helper methods from your payment integration paths here
// import { getCompanyPaymentConfig, initiateMpesaPayment, initiatePaystackPayment, initiateGhubaPayment, initiateStripePaymentIntent, createPaypalOrder } from "@/server/lib/payments";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, buyer, tickets, paymentMethod, companyId } = body;

    // 1. Core payload validations
    if (!eventId || !buyer?.name || !buyer?.email || !tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json({ error: "Missing required checkout details" }, { status: 400 });
    }

    // 2. Fetch all requested tickets in a single batch query
    const ticketIds = tickets.map((t: any) => t.ticketId);
    const dbTickets = await prisma.eventTicket.findMany({
      where: { id: { in: ticketIds } },
    });

    const ticketMap = new Map(dbTickets.map((t) => [t.id, t]));
    let calculatedTotalAmount = 0;

    // 3. Structural Validation Pass
    for (const requestedTicket of tickets) {
      const dbTicket = ticketMap.get(requestedTicket.ticketId);

      if (!dbTicket) {
        return NextResponse.json({ error: `Ticket configuration not found for ID: ${requestedTicket.ticketId}` }, { status: 404 });
      }

      if (dbTicket.quantitySold + requestedTicket.quantity > dbTicket.quantityTotal) {
        return NextResponse.json({ error: `Not enough ticket allocations available for ${dbTicket.name}` }, { status: 400 });
      }

      calculatedTotalAmount += dbTicket.price * requestedTicket.quantity;
    }

    // 4. Safe Database Transaction Write Block
    const purchases = await prisma.$transaction(async (tx) => {
      const createdPurchases = [];

      for (const requestedTicket of tickets) {
        const dbTicket = ticketMap.get(requestedTicket.ticketId)!;
        const lineItemTotal = dbTicket.price * requestedTicket.quantity;

        // Create ticket purchase tracking record
        const purchase = await tx.eventTicketPurchase.create({
          data: {
            eventId,
            ticketId: dbTicket.id,
            companyId: companyId || null,
            buyerId: buyer.id || null,
            buyerName: buyer.name,
            buyerEmail: buyer.email,
            buyerPhone: buyer.phone || null,
            quantity: requestedTicket.quantity,
            unitPrice: dbTicket.price,
            totalAmount: lineItemTotal,
            paymentMethod,
          },
        });

        // Map personal ticket attachments
        const attendeesToCreate = requestedTicket.attendees && Array.isArray(requestedTicket.attendees)
          ? requestedTicket.attendees
          : Array.from({ length: requestedTicket.quantity }).map(() => ({
              fullName: buyer.name,
              email: buyer.email,
              phone: buyer.phone || null,
            }));

        for (const attendee of attendeesToCreate) {
          await tx.eventTicketAttendee.create({
            data: {
              purchaseId: purchase.id,
              ticketId: dbTicket.id,
              eventId,
              fullName: attendee.fullName || buyer.name,
              email: attendee.email || buyer.email,
              phone: attendee.phone || buyer.phone || null,
              ticketCode: crypto.randomUUID(), 
            },
          });
        }

        // Lock inventory allocation
        await tx.eventTicket.update({
          where: { id: dbTicket.id },
          data: { quantitySold: { increment: requestedTicket.quantity } },
        });

        createdPurchases.push(purchase);
      }

      return createdPurchases;
    });

    // 5. Dynamic Payment Integration Switch Pipeline
    let paymentResponse: any = null;
    
    // Utilize primary reference context from your created batch items
    const primaryOrderContext = purchases[0];

    // Fetch dynamic gateway configurations linked to the store/company profile
    const cfg = await getCompanyPaymentConfig(companyId);

    if (calculatedTotalAmount > 0) {
      switch (paymentMethod) {
        case "mpesa": {
          const phoneNumber = body.paymentData?.mpesaPhone ?? buyer.phone;
          if (!phoneNumber) {
            return NextResponse.json({ error: "M-Pesa valid active phone number is required" }, { status: 400 });
          }
          paymentResponse = await initiateMpesaPayment(primaryOrderContext, phoneNumber, cfg?.credentials);
          break;
        }
        case "paystack":
          paymentResponse = await initiatePaystackPayment(primaryOrderContext, buyer.email, cfg?.credentials);
          break;
        case "ghuba":
          paymentResponse = await initiateGhubaPayment(primaryOrderContext, buyer.email);
          break;
        case "stripe":
          paymentResponse = await initiateStripePaymentIntent(primaryOrderContext, cfg?.credentials);
          break;
        case "paypal":
          paymentResponse = await createPaypalOrder(primaryOrderContext, cfg?.credentials);
          break;
        case "cod":
        case "pickupatshop":
          paymentResponse = { message: "Payment confirmation standard offline authorization pending." };
          // If you maintain global order states alongside specific ticket purchases:
          await prisma.eventTicketPurchase.updateMany({
            where: { id: { in: purchases.map((p) => p.id) } },
            data: { paymentStatus: "PENDING" },
          });
          break;
        default:
          paymentResponse = { message: "Unknown or fallback custom option processing specified." };
      }
    } else {
      paymentResponse = { message: "Free admission voucher access bypass processed." };
    }

    // 6. Return payload cleanly back to your frontend layout client logic
    return NextResponse.json({
      success: true,
      totalAmount: calculatedTotalAmount,
      purchases,
      // Spread payment details out securely (returns fields like authorizationUrl or approveLink)
      ...(paymentResponse && typeof paymentResponse === "object" ? paymentResponse : { paymentData: paymentResponse }),
    });

  } catch (error: any) {
    console.error("[INTEGRATED_CHECKOUT_API_CRASH]:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected validation exception halted your checkout processing." },
      { status: 500 }
    );
  }
}

// Mock placeholder function blocks to guarantee file compiles standalone. 
// Remove these below if these handlers are already imported into your routes context.
// async function getCompanyPaymentConfig(companyId: string): Promise<any> { return { credentials: {} }; }
// async function initiateMpesaPayment(order: any, phone: string, creds: any) { return { success: true }; }
// async function initiatePaystackPayment(order: any, email: string, creds: any) { return { authorizationUrl: "" }; }
// async function initiateGhubaPayment(order: any, email: string) { return { authorizationUrl: "" }; }
// async function initiateStripePaymentIntent(order: any, creds: any) { return { clientSecret: "" }; }
// async function createPaypalOrder(order: any, creds: any) { return { approveLink: "" }; }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { eventId, buyer, tickets, paymentMethod, companyId } = body;

//     // 1. Basic payload validations
//     if (
//       !eventId ||
//       !buyer?.name ||
//       !buyer?.email ||
//       !tickets ||
//       !Array.isArray(tickets) ||
//       tickets.length === 0
//     ) {
//       return NextResponse.json(
//         { error: "Missing required checkout details" },
//         { status: 400 },
//       );
//     }

//     // 2. Fetch all requested tickets in a single database batch query
//     const ticketIds = tickets.map((t: any) => t.ticketId);
//     const dbTickets = await prisma.eventTicket.findMany({
//       where: { id: { in: ticketIds } },
//     });

//     // Map database tickets by ID for instant O(1) retrieval lookups
//     const ticketMap = new Map(dbTickets.map((t) => [t.id, t]));
//     let calculatedTotalAmount = 0;

//     // 3. First Pass: Validate availability and calculate final prices securely
//     for (const requestedTicket of tickets) {
//       const dbTicket = ticketMap.get(requestedTicket.ticketId);

//       if (!dbTicket) {
//         return NextResponse.json(
//           {
//             error: `Ticket configuration not found for ID: ${requestedTicket.ticketId}`,
//           },
//           { status: 404 },
//         );
//       }

//       if (
//         dbTicket.quantitySold + requestedTicket.quantity >
//         dbTicket.quantityTotal
//       ) {
//         return NextResponse.json(
//           {
//             error: `Not enough ticket allocations available for ${dbTicket.name}`,
//           },
//           { status: 400 },
//         );
//       }

//       calculatedTotalAmount += dbTicket.price * requestedTicket.quantity;
//     }

//     // 4. Second Pass: Execute sequential writes safely wrapped inside a Prisma transactional rollback block
//     const purchases = await prisma.$transaction(async (tx) => {
//       const createdPurchases = [];

//       for (const requestedTicket of tickets) {
//         const dbTicket = ticketMap.get(requestedTicket.ticketId)!;
//         const lineItemTotal = dbTicket.price * requestedTicket.quantity;

//         // Create the primary ledger purchase record
//         const purchase = await tx.eventTicketPurchase.create({
//           data: {
//             eventId,
//             ticketId: dbTicket.id,
//             companyId: companyId || null, // Handle optional multi-tenant fields safely
//             buyerId: buyer.id || null,
//             buyerName: buyer.name,
//             buyerEmail: buyer.email,
//             buyerPhone: buyer.phone || null,
//             quantity: requestedTicket.quantity,
//             unitPrice: dbTicket.price,
//             totalAmount: lineItemTotal,
//             paymentMethod,
//           },
//         });

//         // Fallback Protection: If frontend didn't supply attendee specifics, map them automatically to the primary buyer details
//         const attendeesToCreate =
//           requestedTicket.attendees && Array.isArray(requestedTicket.attendees)
//             ? requestedTicket.attendees
//             : Array.from({ length: requestedTicket.quantity }).map(() => ({
//                 fullName: buyer.name,
//                 email: buyer.email,
//                 phone: buyer.phone || null,
//               }));

//         // Batch write individual unique access passes/attendees
//         for (const attendee of attendeesToCreate) {
//           await tx.eventTicketAttendee.create({
//             data: {
//               purchaseId: purchase.id,
//               ticketId: dbTicket.id,
//               eventId,
//               fullName: attendee.fullName || buyer.name,
//               email: attendee.email || buyer.email,
//               phone: attendee.phone || buyer.phone || null,
//               ticketCode: crypto.randomUUID(), // Generates secure unique identifier reference for ticket scanning
//             },
//           });
//         }

//         // Increment inventory counts
//         await tx.eventTicket.update({
//           where: { id: dbTicket.id },
//           data: { quantitySold: { increment: requestedTicket.quantity } },
//         });

//         createdPurchases.push(purchase);
//       }

//       return createdPurchases;
//     });

//     // TODO: Integrate payment provider triggers (M-Pesa STK, Paystack / Stripe URL generation) based on the calculatedTotalAmount

//         // PAYMENT PROCESSING
//         let paymentResponse: any = null;
//         const cfg = await getCompanyPaymentConfig(data.companyId);
    
//         switch (data.paymentOption) {
//           case "mpesa": {
//             const phoneNumber = data.paymentData?.mpesaPhone ?? data.mpesaPhone ?? data.phone;
//             if (!phoneNumber) return withCors({ success: false, error: "mpesaPhone required" }, 400);
//             paymentResponse = await initiateMpesaPayment(orderDb, phoneNumber, cfg.credentials);
//             break;
//           }
//           case "paystack":
//             paymentResponse = await initiatePaystackPayment(orderDb, data.email, cfg.credentials);
//             break;
//           case "ghuba":
//             // paymentResponse = await initiateGhubaPayment(orderDb, cfg.credentials);
//             paymentResponse = await initiateGhubaPayment(orderDb, data.email);
//             break;
//           case "stripe":
//             paymentResponse = await initiateStripePaymentIntent(orderDb, cfg.credentials);
//             break;
//           case "paypal":
//             paymentResponse = await createPaypalOrder(orderDb, cfg.credentials);
//             break;
//           case "cod":
//           case "pickupatshop":
//             paymentResponse = { message: "Payment on delivery or pickup confirmed." };
//             await prisma.customerOrder.update({
//               where: { id: orderDb.id },
//               data: { paymentStatus: "PENDING" },
//             });
//             break;
//           default:
//             paymentResponse = { message: "Unknown payment option" };
//         }
    

//     return NextResponse.json({
//       success: true,
//       totalAmount: calculatedTotalAmount,
//       purchases,
//     });
//   } catch (error: any) {
//     console.error("[CHECKOUT_ERROR_LOG]:", error);
//     return NextResponse.json(
//       {
//         error:
//           "An internal server complication interrupted checkout validation.",
//       },
//       { status: 500 },
//     );
//   }
// }
