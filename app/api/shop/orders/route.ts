// app/api/orders/route.ts
import prisma from "@/server/db/prismadb";
import { z } from "zod";
import nodemailer from "nodemailer";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyAuth } from "@/lib/verifyAuth";

// Zod schema
const orderSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cvv: z.string().optional(),
  promoCode: z.string().optional(),
  consumerId: z.string(),
  delivery: z.boolean().optional(),
  paymentOption: z.string().default("Cash"),
  items: z.array(
    z.object({
      marketplaceListingId: z.string(),
      date: z.string().optional(),
      timeSlot: z.string().optional(),
      quantity: z.number().positive(),
      price: z.number().positive(),
    })
  ),
  totalPrice: z.number().positive(),
  shippingAddress: z
    .object({
      display_name: z.string(),
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  shippingMethod: z.enum(["Standard", "Express", "AT SHOP"]).optional(),
});

async function sendOrderEmail(email: string, orderStatus: string) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
  });
  await transporter.sendMail({
    from: `"ghuba Store" <${process.env.EMAIL}>`,
    to: email,
    subject: "Order Update",
    text: `Your order status has been updated to: ${orderStatus}`,
  });
}

function generateTrackingNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/orders
async function createOrder(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.errors, 400);
  }

  const {
    consumerId,
    items,
    totalPrice,
    shippingAddress,
    shippingMethod,
    delivery,
    paymentOption,
    name,
    email,
    phone,
    cardNumber,
    cardExpiry,
    cvv,
    promoCode,
  } = parsed.data;

  try {
    const order = await prisma.customerOrder.create({
      data: {
        consumerId,
        name,
        email,
        phone,
        cardNumber,
        cardExpiry,
        cvv,
        promoCode,
        totalPrice,
        shippingAddress,
        shippingMethod,
        status: "PENDING",
        delivery,
        paymentOption,
        trackingNumber: `TRK${generateTrackingNumber()}`,
        deliveryStatus: "Order Placed",
        items: { create: items },
      },
      include: { items: true },
    });
    return formatResponse(true, order);
  } catch (err: any) {
    console.error("Error creating order:", err);
    return formatResponse(false, null, "Internal Server Error", 500);
  }
}

// GET /api/orders
async function getOrders(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
    return formatResponse(false, null, "Invalid pagination parameters.", 400);
  }
  const skip = (page - 1) * limit;

  try {
    const [orders, total] = await Promise.all([
      prisma.customerOrder.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.customerOrder.count(),
    ]);
    const totalPages = Math.ceil(total / limit);

    return formatResponse(true, orders, null, 200, {
      total,
      perPage: limit,
      page,
      totalPages,
    });
  } catch (err: any) {
    console.error("Error fetching orders:", err);
    return formatResponse(false, null, err.message, 500);
  }
}

// PUT /api/orders
async function updateOrder(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const body = await req.json();
  const { id, status, deliveryStatus } = body;
  if (!id || !status || !deliveryStatus) {
    return formatResponse(false, null, "Missing id, status or deliveryStatus", 400);
  }

  try {
    const order = await prisma.customerOrder.update({
      where: { id },
      data: { status, deliveryStatus },
    });

    // webhook
    await fetch(process.env.ORDER_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, status, deliveryStatus }),
    });

    const consumer = await prisma.consumer.findUnique({
      where: { id: order.consumerId },
    });
    if (consumer) await sendOrderEmail(consumer.email, status);

    return formatResponse(true, order);
  } catch (err: any) {
    console.error("Error updating order:", err);
    return formatResponse(false, null, err.message, 500);
  }
}

// DELETE /api/orders (soft delete)
async function deleteOrder(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = await req.json();
  if (!id) {
    return formatResponse(false, null, "Missing order ID", 400);
  }

  try {
    const existing = await prisma.customerOrder.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existing || existing.status !== "PENDING") {
      return formatResponse(false, null, "Only pending orders can be canceled", 400);
    }

    const canceled = await prisma.customerOrder.update({
      where: { id },
      data: {
        status: "CANCELLED",
        deliveryStatus: "Order Canceled",
        deletedAt: new Date(),
      },
    });

    return formatResponse(true, canceled);
  } catch (err: any) {
    console.error("Error soft-deleting order:", err);
    return formatResponse(false, null, err.message, 500);
  }
}

export const POST = withApiHandler(createOrder);
export const GET = withApiHandler(getOrders);
export const PUT = withApiHandler(updateOrder);
export const DELETE = withApiHandler(deleteOrder);
