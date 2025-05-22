import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed
import { z } from "zod";
import nodemailer from "nodemailer";
import { authenticate } from "../../../../middleware/auth";

const orderSchema = z.object({
  consumerId: z.string().min(10),
  delivery: z.boolean(),
  paymentOption: z.string().min(10),
  items: z.array(
    z.object({
      marketplaceListingId: z.string().min(10),
      quantity: z.number().positive(),
      price: z.number().positive(),
    })
  ),
  totalPrice: z.number().positive(),
  shippingAddress: z.object({
      display_name: z.string().min(10),
      lat: z.number(),
      lng: z.number(),
    }),
  shippingMethod: z.enum(["Standard", "Express", "AT SHOP",]),
});

async function sendOrderEmail(email: any, orderStatus: any) {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  authenticate(req, res, async () => {
    try {
      if (req.method === "POST") {
        const validation = orderSchema.safeParse(req.body);
        if (!validation.success)
          return NextResponse.json({ error: validation.error.errors });

        const { consumerId, items, totalPrice, shippingAddress, shippingMethod, delivery, paymentOption } = req.body;

        try {
          const order = await prisma.customerOrder.create({
            data: {
              consumerId,
              totalPrice: parseFloat(totalPrice),
              shippingAddress,
              shippingMethod,
              status: "PENDING",
              delivery: delivery,
              paymentOption: paymentOption,
              trackingNumber: `TRK${generateTrackingNumber()}`,
              deliveryStatus: "Order Placed",
              items: {
                create: items.map((item: any) => ({
                  marketplaceListingId: item.marketplaceListingId,
                  quantity: item.quantity,
                  price: item.price,
                })),
              },
            },
            include: { items: true },
          });

          return res.status(201).json(order);
        } catch (error) {
          console.error("Error creating order:", error);
          return NextResponse.json({ error: "Internal Server Error" });
        }
      }

      if (req.method === "GET") {
        const { page = "1", limit = "10" } = req.query;
        const { searchParams } = new URL(req.url);
  
        const agentId = searchParams.get("agentId");
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);
      
        if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
          return NextResponse.json(
            { message: "Invalid pagination parameters." },
            { status: 400 }
          );
        }
      
        const pageNumber = parseInt(Array.isArray(page) ? page[0] : page);
        const limitNumber = parseInt(Array.isArray(limit) ? limit[0] : limit);

        const orders = await prisma.customerOrder.findMany({
          skip: (pageNumber - 1) * limitNumber,
          take: limitNumber,
          orderBy: { createdAt: "desc" },
          include: { items: true },
        });

        return res.status(200).json(orders);
      }

      if (req.method === "PUT") {
        const { id, status, deliveryStatus } = req.body;
        const order = await prisma.customerOrder.update({
          where: { id },
          data: { status, deliveryStatus },
        });
        await fetch("https://your-webhook-url.com/order-updated", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id, status, deliveryStatus }),
        });
        const consumer = await prisma.consumer.findUnique({ where: { id: order.consumerId } });
        if (consumer) {
          await sendOrderEmail(consumer.email, status);
        }
        return res.status(200).json(order);
      }

      if (req.method === "DELETE") {
        const { id } = req.body;
        const order = await prisma.customerOrder.findUnique({ where: { id } });
        if (!order || order.status !== "PENDING")
          return NextResponse.json({ error: "Only pending orders can be canceled" });
        const canceledOrder = await prisma.customerOrder.update({
          where: { id },
          data: { status: "CANCELLED", deliveryStatus: "Order Canceled" },
        });
        return res.status(200).json(canceledOrder);
      }

      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      NextResponse.end(`Method ${req.method} Not Allowed`);
    } catch (error) {
      console.error("API Error:", error);
      NextResponse.json({ error: "Internal Server Error" });
    }
  });
}

// Utility function to generate a random tracking number
function generateTrackingNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
