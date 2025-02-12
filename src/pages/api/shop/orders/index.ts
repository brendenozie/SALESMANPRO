import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../server/db/prismadb";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
// import Stripe from "stripe";
import nodemailer from "nodemailer";
import { authenticate } from "../../../../middleware/auth";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// const orderSchema = z.object({
//   clientId: z.string().min(10),
//   productId: z.string().min(10),
//   consumerId: z.string().min(10),
//   quantity: z.number().positive(),
//   totalPrice: z.number().positive(),
//   shippingAddress: z.string().min(5),
//   shippingMethod: z.enum(["Standard", "Express"]),
// });

const orderSchema = z.object({
  clientId: z.string().min(10),
  consumerId: z.string().min(10),
  items: z.array(
    z.object({
      productId: z.string().min(10),
      quantity: z.number().positive(),
      price: z.number().positive(),
    })
  ),
  totalPrice: z.number().positive(),
  shippingAddress: z.string().min(5),
  shippingMethod: z.enum(["Standard", "Express"]),
});

async function sendOrderEmail(email: any, orderStatus: any) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
  });
  await transporter.sendMail({
    from: `"Kapu Store" <${process.env.EMAIL}>`,
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
  if (!validation.success) return res.status(400).json({ error: validation.error.errors });

  const { clientId, consumerId, items, totalPrice, shippingAddress, shippingMethod } = req.body;

  try {
    const order = await prisma.customerOrder.create({
      data: {
        clientId,
        consumerId,
        totalPrice,
        shippingAddress,
        shippingMethod,
        status: "PENDING",
        trackingNumber: `TRK${Date.now()}`,
        deliveryStatus: "Order Placed",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

      // if (req.method === "POST") {
      //   const validation = orderSchema.safeParse(req.body);
      //   if (!validation.success) return res.status(400).json({ error: validation.error.errors });
      //   const order = await prisma.customerOrder.create({
      //     data: { ...req.body, trackingNumber: `TRK${Date.now()}`, status: "PENDING", deliveryStatus: "Order Placed" },
      //   });
      //   return res.status(201).json(order);
      // }

      if (req.method === "GET") {
        const { page = "1", limit = "10" } = req.query;
        const pageNumber = parseInt(Array.isArray(page) ? page[0] : page);
        const limitNumber = parseInt(Array.isArray(limit) ? limit[0] : limit);

        const orders = await prisma.customerOrder.findMany({
          skip: (pageNumber - 1) * limitNumber,
          take: limitNumber,
          orderBy: { createdAt: "desc" },
          include: { items: true }, // Fetch associated items
        });

        return res.status(200).json(orders);
      }

      
      // if (req.method === "GET") {
      //   const { page = "1", limit = "10" } = req.query;
      //   const pageNumber = parseInt(Array.isArray(page) ? page[0] : page);
      //   const limitNumber = parseInt(Array.isArray(limit) ? limit[0] : limit);
      //   const orders = await prisma.customerOrder.findMany({ skip: (pageNumber - 1) * limitNumber, take: limitNumber, orderBy: { createdAt: "desc" } });
      //   return res.status(200).json(orders);
      // }
      
      if (req.method === "PUT") {
        const { id, status, deliveryStatus } = req.body;
        const order = await prisma.customerOrder.update({ where: { id }, data: { status, deliveryStatus } });
        await fetch("https://your-webhook-url.com/order-updated", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: id, status, deliveryStatus }) });
        const consumer = await prisma.consumer.findUnique({ where: { id: order.consumerId } });
        if (consumer) {
          await sendOrderEmail(consumer.email, status);
        }
        return res.status(200).json(order);
      }
      
      if (req.method === "DELETE") {
        const { id } = req.body;
        const order = await prisma.customerOrder.findUnique({ where: { id } });
        if (!order || order.status !== "PENDING") return res.status(400).json({ error: "Only pending orders can be canceled" });
        const canceledOrder = await prisma.customerOrder.update({ where: { id }, data: { status: "CANCELLED", deliveryStatus: "Order Canceled" } });
        return res.status(200).json(canceledOrder);
      }
      
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
}


// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     if (req.method === "POST") {
//       // Create a new order
//       const { clientId, productId, consumerId, quantity, totalPrice, shippingAddress, shippingMethod } = req.body;
      
//       if (!clientId || !productId || !consumerId || !quantity || !totalPrice) {
//         return res.status(400).json({ error: "Missing required fields" });
//       }

//       const order = await prisma.customerOrder.create({
//         data: {
//           clientId,
//           productId,
//           consumerId,
//           quantity,
//           totalPrice,
//           shippingAddress,
//           shippingMethod,
//           trackingNumber: generateTrackingNumber(), // Random tracking number
//           status: "PENDING",
//           deliveryStatus: "Order Placed",
//         },
//       });

//       return res.status(201).json(order);
//     }

//     if (req.method === "GET") {
//       // Fetch orders or a single order
//       const { id, trackingNumber } = req.query;

//       if (id) {
//         const order = await prisma.customerOrder.findUnique({ where: { id: Array.isArray(id) ? id[0] : id } });
//         if (!order) return res.status(404).json({ error: "Order not found" });
//         return res.status(200).json(order);
//       }

//       if (trackingNumber) {
//         const order = await prisma.customerOrder.findFirst({ where: { trackingNumber: Array.isArray(trackingNumber) ? trackingNumber[0] : trackingNumber } });
//         if (!order) return res.status(404).json({ error: "Invalid tracking number" });
//         return res.status(200).json(order);
//       }

//       // Get all orders
//       const orders = await prisma.customerOrder.findMany();
//       return res.status(200).json(orders);
//     }

//     if (req.method === "PUT") {
//       // Update order status
//       const { id, status, deliveryStatus } = req.body;
//       if (!id || !status) return res.status(400).json({ error: "Missing order ID or status" });

//       const updatedOrder = await prisma.customerOrder.update({
//         where: { id },
//         data: { status, deliveryStatus },
//       });

//       return res.status(200).json(updatedOrder);
//     }

//     res.setHeader("Allow", ["POST", "GET", "PUT"]);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   } catch (error) {
//     console.error("API Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// // Utility function to generate a random tracking number
// function generateTrackingNumber() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }
