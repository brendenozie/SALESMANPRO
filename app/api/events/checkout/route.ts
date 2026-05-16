import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack";
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, buyer, tickets, paymentMethod, companyId } = body;

    // 1. Core payload validations
    if (
      !eventId ||
      !buyer?.name ||
      !buyer?.email ||
      !tickets ||
      !Array.isArray(tickets) ||
      tickets.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required checkout details" },
        { status: 400 },
      );
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
        return NextResponse.json(
          {
            error: `Ticket configuration not found for ID: ${requestedTicket.ticketId}`,
          },
          { status: 404 },
        );
      }

      if (
        dbTicket.quantitySold + requestedTicket.quantity >
        dbTicket.quantityTotal
      ) {
        return NextResponse.json(
          {
            error: `Not enough ticket allocations available for ${dbTicket.name}`,
          },
          { status: 400 },
        );
      }

      calculatedTotalAmount += dbTicket.price * requestedTicket.quantity;
    }

    // 4. Safe Database Transaction Write Block (With extended timeout & optimizations)
    const purchases = await prisma.$transaction(
      async (tx) => {
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
          const rawAttendees =
            requestedTicket.attendees &&
            Array.isArray(requestedTicket.attendees)
              ? requestedTicket.attendees
              : Array.from({ length: requestedTicket.quantity }).map(() => ({
                  fullName: buyer.name,
                  email: buyer.email,
                  phone: buyer.phone || null,
                }));

          // Prepare records for batch insertion
          const attendeesData = rawAttendees.map((attendee: any) => ({
            purchaseId: purchase.id,
            ticketId: dbTicket.id,
            eventId,
            fullName: attendee.fullName || buyer.name,
            email: attendee.email || buyer.email,
            phone: attendee.phone || buyer.phone || null,
            ticketCode: crypto.randomUUID(),
          }));

          // High optimization: Use createMany instead of a sequential loop!
          await tx.eventTicketAttendee.createMany({
            data: attendeesData,
          });

          // Lock inventory allocation
          await tx.eventTicket.update({
            where: { id: dbTicket.id },
            data: { quantitySold: { increment: requestedTicket.quantity } },
          });

          createdPurchases.push(purchase);
        }

        return createdPurchases;
      },
      {
        // Give MongoDB/Prisma a comfortable window to complete execution
        timeout: 15000,
      },
    );

    // 5. Dynamic Payment Integration Switch Pipeline
    let paymentResponse: any = null;
    const primaryOrderContext = purchases[0];
    const cfg = await getCompanyPaymentConfig(companyId);

    if (calculatedTotalAmount > 0) {
      switch (paymentMethod) {
        case "mpesa": {
          const phoneNumber = body.paymentData?.mpesaPhone ?? buyer.phone;
          if (!phoneNumber) {
            return NextResponse.json(
              { error: "M-Pesa valid active phone number is required" },
              { status: 400 },
            );
          }
          paymentResponse = await initiateMpesaPayment(
            primaryOrderContext,
            phoneNumber,
            cfg?.credentials,
          );
          break;
        }
        case "paystack":
          paymentResponse = await initiatePaystackPayment(
            primaryOrderContext,
            buyer.email,
            cfg?.credentials,
          );
          break;
        case "ghuba":
          paymentResponse = await initiateGhubaPayment(
            primaryOrderContext,
            buyer.email,
          );
          break;
        case "stripe":
          paymentResponse = await initiateStripePaymentIntent(
            primaryOrderContext,
            cfg?.credentials,
          );
          break;
        case "paypal":
          paymentResponse = await createPaypalOrder(
            primaryOrderContext,
            cfg?.credentials,
          );
          break;
        case "cod":
        case "pickupatshop":
          paymentResponse = {
            message:
              "Payment confirmation standard offline authorization pending.",
          };
          await prisma.eventTicketPurchase.updateMany({
            where: { id: { in: purchases.map((p) => p.id) } },
            data: { paymentStatus: "PENDING" },
          });
          break;
        default:
          paymentResponse = {
            message: "Unknown or fallback custom option processing specified.",
          };
      }
    } else {
      paymentResponse = {
        message: "Free admission voucher access bypass processed.",
      };
    }

    // 6. Return payload cleanly
    return NextResponse.json({
      success: true,
      totalAmount: calculatedTotalAmount,
      purchases,
      ...(paymentResponse && typeof paymentResponse === "object"
        ? paymentResponse
        : { paymentData: paymentResponse }),
    });
  } catch (error: any) {
    // Hardened error handler to prevent payload argument null crashes
    const outMessage = error instanceof Error ? error.message : String(error);
    console.error("[INTEGRATED_CHECKOUT_API_CRASH]:", outMessage);

    return NextResponse.json(
      {
        error:
          outMessage ||
          "An unexpected validation exception halted your checkout processing.",
      },
      { status: 500 },
    );
  }
}
