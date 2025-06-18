import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb";
import { z } from "zod";
import nodemailer from "nodemailer";

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
      quantity: z.number().positive(),
      price: z.number().positive(),
    })
  ),
  totalPrice: z.number().positive(),
  shippingAddress: z.object({
    display_name: z.string(),
    lat: z.number(),
    lng: z.number(),
  }).optional(),
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
export async function POST(req: Request) {
  
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }
    const { consumerId, items, totalPrice, shippingAddress, shippingMethod, delivery, paymentOption,
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
      return NextResponse.json(order, { status: 200 });
    } catch (err: any) {
      console.error("Error creating order:", err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET /api/orders
export async function GET(req: Request) {
  
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return NextResponse.json({ error: "Invalid pagination parameters." }, { status: 400 });
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
      return NextResponse.json({ data: orders, meta: { total, perPage: limit, page, totalPages } }, { status: 200 });
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      return NextResponse.json({ error: "Failed to fetch orders", detail: err.message }, { status: 500 });
    }
}

// PUT /api/orders
export async function PUT(req: Request) {
  
    const body = await req.json();
    const { id, status, deliveryStatus } = body;
    if (!id || !status || !deliveryStatus) {
      return NextResponse.json({ error: "Missing id, status or deliveryStatus" }, { status: 400 });
    }
    try {
      const order = await prisma.customerOrder.update({ where: { id }, data: { status, deliveryStatus } });
      // webhook
      await fetch(process.env.ORDER_WEBHOOK_URL!, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: id, status, deliveryStatus }) });
      const consumer = await prisma.consumer.findUnique({ where: { id: order.consumerId } });
      if (consumer) await sendOrderEmail(consumer.email, status);
      return NextResponse.json(order, { status: 200 });
    } catch (err: any) {
      console.error("Error updating order:", err);
      return NextResponse.json({ error: "Failed to update order", detail: err.message }, { status: 500 });
    }
}

// DELETE /api/orders
// DELETE /api/orders (soft delete)
export async function DELETE(req: Request) {
  
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }
    try {
      const existing = await prisma.customerOrder.findUnique({ where: { id, deletedAt: null } });
      if (!existing || existing.status !== "PENDING") {
        return NextResponse.json({ error: "Only pending orders can be canceled" }, { status: 400 });
      }
      const canceled = await prisma.customerOrder.update({ where: { id }, data: { status: "CANCELLED", deliveryStatus: "Order Canceled", deletedAt: new Date() } });
      return NextResponse.json(canceled, { status: 200 });
    } catch (err: any) {
      console.error("Error soft-deleting order:", err);
      return NextResponse.json({ error: "Failed to cancel order", detail: err.message }, { status: 500 });
    }
}


