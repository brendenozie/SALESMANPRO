import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { withDistributedLock } from "@/lib/idempotency";
import { z } from "zod";
import crypto from "crypto";

import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack";
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";

const eventCheckoutSchema = z.object({
  eventId: z.string().min(1, "eventId is required"),
  companyId: z.string().optional().nullable(),
  buyer: z.object({
    id: z.string().optional().nullable(),
    name: z.string().min(1, "Buyer name is required"),
    email: z.string().email("Valid buyer email is required"),
    phone: z.string().optional().nullable(),
  }),
  tickets: z
    .array(
      z.object({
        ticketId: z.string().min(1, "ticketId is required"),
        quantity: z.number().int().positive("quantity must be at least 1"),
        attendees: z
          .array(
            z.object({
              fullName: z.string().optional(),
              email: z.string().optional(),
              phone: z.string().optional().nullable(),
            }),
          )
          .optional(),
      }),
    )
    .min(1, "At least one ticket must be selected"),
  paymentMethod: z.string().min(1, "paymentMethod is required"),
  paymentData: z.record(z.any()).optional(),
});

async function handlePost(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return formatResponse(false, null, "Invalid JSON payload", 400);
  }

  const parsed = eventCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.errors, 400);
  }

  const { eventId, buyer, tickets, paymentMethod, companyId, paymentData } =
    parsed.data;

  // 1. Fetch all requested tickets in a single batch query
  const ticketIds = tickets.map((t) => t.ticketId);
  const dbTickets = await prisma.eventTicket.findMany({
    where: { id: { in: ticketIds } },
  });

  const ticketMap = new Map(dbTickets.map((t) => [t.id, t]));
  let calculatedTotalAmount = 0;

  // 2. Structural Pre-Validation Pass
  for (const requestedTicket of tickets) {
    const dbTicket = ticketMap.get(requestedTicket.ticketId);

    if (!dbTicket) {
      return formatResponse(
        false,
        null,
        `Ticket configuration not found for ID: ${requestedTicket.ticketId}`,
        404,
      );
    }

    if (
      dbTicket.quantitySold + requestedTicket.quantity >
      dbTicket.quantityTotal
    ) {
      return formatResponse(
        false,
        null,
        `Not enough ticket allocations available for ${dbTicket.name}. Available: ${dbTicket.quantityTotal - dbTicket.quantitySold}`,
        400,
      );
    }

    calculatedTotalAmount += dbTicket.price * requestedTicket.quantity;
  }

  // 3. Concurrency-Safe Transaction under Distributed Event Lock
  const lockResource = `checkout:event:${eventId}`;

  try {
    const purchases = await withDistributedLock(
      lockResource,
      async () => {
        return await prisma.$transaction(
          async (tx) => {
            const createdPurchases = [];

            for (const requestedTicket of tickets) {
              const dbTicket = ticketMap.get(requestedTicket.ticketId)!;
              const lineItemTotal = dbTicket.price * requestedTicket.quantity;

              // Atomic ticket allocation guard: Ensure quantitySold does not exceed quantityTotal under race conditions
              const updatedTicket = await tx.eventTicket.updateMany({
                where: {
                  id: dbTicket.id,
                  quantitySold: {
                    lte: dbTicket.quantityTotal - requestedTicket.quantity,
                  },
                },
                data: {
                  quantitySold: { increment: requestedTicket.quantity },
                },
              });

              if (updatedTicket.count === 0) {
                throw new Error(
                  `Insufficient ticket allocations remaining for ${dbTicket.name}`,
                );
              }

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

              // Map attendees
              const rawAttendees =
                requestedTicket.attendees &&
                Array.isArray(requestedTicket.attendees) &&
                requestedTicket.attendees.length > 0
                  ? requestedTicket.attendees
                  : Array.from({ length: requestedTicket.quantity }).map(() => ({
                      fullName: buyer.name,
                      email: buyer.email,
                      phone: buyer.phone || null,
                    }));

              const attendeesData = rawAttendees.map((attendee) => ({
                purchaseId: purchase.id,
                ticketId: dbTicket.id,
                eventId,
                fullName: attendee.fullName || buyer.name,
                email: attendee.email || buyer.email,
                phone: attendee.phone || buyer.phone || null,
                ticketCode: crypto.randomUUID(),
              }));

              await tx.eventTicketAttendee.createMany({
                data: attendeesData,
              });

              createdPurchases.push(purchase);
            }

            return createdPurchases;
          },
          { timeout: 15000 },
        );
      },
      15, // 15s lock TTL
      5000, // 5s spin-wait timeout
    );

    // 4. Dynamic Payment Integration Switch Pipeline
    let paymentResponse: any = null;
    const primaryOrderContext = purchases[0];
    const cfg = companyId ? await getCompanyPaymentConfig(companyId) : null;

    if (calculatedTotalAmount > 0) {
      switch (paymentMethod) {
        case "mpesa": {
          const phoneNumber = paymentData?.mpesaPhone ?? buyer.phone;
          if (!phoneNumber) {
            return formatResponse(
              false,
              null,
              "M-Pesa valid active phone number is required",
              400,
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
            "",
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

    return formatResponse(
      true,
      {
        totalAmount: calculatedTotalAmount,
        purchases,
        ...(paymentResponse && typeof paymentResponse === "object"
          ? paymentResponse
          : { paymentData: paymentResponse }),
      },
      "Checkout completed successfully",
      201,
    );
  } catch (error: any) {
    const outMessage = error instanceof Error ? error.message : String(error);
    console.error("[EVENT_CHECKOUT_TRANSACTION_ERROR]:", outMessage);

    return formatResponse(
      false,
      null,
      outMessage || "An unexpected exception halted your checkout processing.",
      400,
    );
  }
}

export const POST = withApiHandler(handlePost, {
  requireAuth: false,
  requireRateLimit: true,
  requireIdempotency: true,
});
