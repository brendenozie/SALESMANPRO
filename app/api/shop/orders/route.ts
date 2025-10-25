// // app/api/orders/route.ts
import prisma from "@/server/db/prismadb";
import { z } from "zod";
import nodemailer from "nodemailer";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --- PAYMENT UTILITY FUNCTIONS (MOCK IMPLEMENTATIONS) ---

/**
 * Mocks the initiation of a Paystack transaction.
 * In a real scenario, this calls the Paystack Initialize Transaction API.
 * @returns An object containing the authorization URL for redirection.
 */
async function initiatePaystackPayment(amount: number, email: string) {
  // NOTE: In production, you would call the Paystack API here.
  console.log(`[Paystack Mock] Initiating payment for ${amount} from ${email}`);
  
  // MOCK: Return a success and a mock authorization URL for the client to redirect to
  const mockAuthorizationUrl = `https://mock-paystack-checkout.com/auth-${generateTrackingNumber()}?amount=${amount}&email=${email}`;
  
  return {
    success: true,
    authorizationUrl: mockAuthorizationUrl,
  };
}

/**
 * Mocks the initiation of an M-Pesa STK Push.
 * In a real scenario, this calls the M-Pesa C2B API.
 * @returns An object containing the M-Pesa Request ID.
 */
async function initiateMpesaSTKPush(amount: number, phone: string, trackingNumber: string) {
  // NOTE: In production, you would call the Safaricom Daraja API here.
  console.log(`[M-Pesa Mock] Initiating STK Push for ${amount} to ${phone}`);
  
  // MOCK: Return a successful M-Pesa Request ID.
  const mockCheckoutRequestId = `ws_CO_123456_${trackingNumber}`;
  
  return {
    success: true,
    checkoutRequestId: mockCheckoutRequestId,
  };
}


// Zod schema updated to include M-Pesa phone number
const orderSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  
  // Card Details
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cvv: z.string().optional(),
  
  // M-Pesa Details
  mpesaPhone: z.string().optional(),

  promoCode: z.string().optional(),
  consumerId: z.string(),
  delivery: z.boolean().optional(),
  paymentOption: z.string().default("cod"), // Default changed to 'cod'
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
    mpesaPhone, // NEW: M-Pesa phone number
    promoCode,
  } = parsed.data;

  // Initial order status based on payment option
  let orderStatus = "PENDING";
  let deliveryStatus = "Order Placed";
  let responsePayload: any = {};
  const trackingNumber = `TRK${generateTrackingNumber()}`;
  
  try {
    // 1. PAYMENT INITIATION LOGIC
    if (paymentOption === 'paystack') {
      const paymentResult = await initiatePaystackPayment(totalPrice, email);
      
      if (!paymentResult.success || !paymentResult.authorizationUrl) {
        throw new Error("Failed to initialize Paystack payment.");
      }
      // If Paystack init is successful, we set the order status to WAITING_PAYMENT
      orderStatus = "WAITING_PAYMENT"; 
      responsePayload.authorizationUrl = paymentResult.authorizationUrl;

    } else if (paymentOption === 'mpesa') {
      if (!mpesaPhone) throw new Error("M-Pesa phone number is required.");

      const paymentResult = await initiateMpesaSTKPush(totalPrice, mpesaPhone, trackingNumber);
      
      if (!paymentResult.success) {
        throw new Error("Failed to initiate M-Pesa STK Push.");
      }
      // If M-Pesa init is successful, we set the order status to WAITING_PAYMENT
      orderStatus = "WAITING_PAYMENT"; 
      responsePayload.checkoutRequestId = paymentResult.checkoutRequestId;
      
    } else if (paymentOption === 'card') {
      // MOCK: In a real system, you would try to charge the card now.
      // If successful: orderStatus = "PROCESSING";
      // If failed: throw new Error("Card charge failed.");
      
      // Since this is a mock, we assume the backend handles the charge synchronously and it passed.
      if (!cardNumber || !cardExpiry || !cvv) throw new Error("Card details are incomplete.");
      orderStatus = "PROCESSING"; 
      
    } else if (paymentOption === 'cod' || paymentOption === 'pickupatshop') {
      // Cash on Delivery/Pickup: Payment is deferred.
      orderStatus = "PROCESSING"; 
    } else {
      throw new Error(`Unsupported payment option: ${paymentOption}`);
    }

    // 2. CREATE THE ORDER IN THE DATABASE
    const order = await prisma.customerOrder.create({
      data: {
        consumerId,
        name,
        email,
        phone,
        cardNumber, // Saving card details (temporarily) - NOT best practice in production!
        cardExpiry,
        cvv,
        mpesaPhone, // Saving M-Pesa phone number
        promoCode,
        totalPrice,
        shippingAddress,
        shippingMethod,
        status: "PENDING", // Use the dynamically set status
        delivery,
        paymentOption,
        trackingNumber: trackingNumber, // Use the generated tracking number
        deliveryStatus: deliveryStatus,
        items: { create: items },
      },
      include: { items: true },
    });
    
    // 3. COMPILE FINAL RESPONSE
    const finalResponse = {
      ...order,
      ...responsePayload, // Add authorizationUrl or checkoutRequestId if present
    };

    // Return the response, which includes the tracking number and potentially a redirect URL
    return formatResponse(true, finalResponse);

  } catch (err: any) {
    console.error("Error creating order:", err);
    // If payment or creation fails, return a 400 or 500 error
    return formatResponse(false, null, err.message, 500);
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

    return formatResponse(true, { orders, totalPages }, null, 200);
  } catch (err: any) {
    console.error("Error fetching orders:", err);
    return formatResponse(false, null, err.message, 500);
  }
}

// PUT /api/orders
async function updateOrder(req: Request) {

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
      include: { user: { select: { email: true } } },
    });
    if (consumer) await sendOrderEmail(consumer.user.email, status);

    return formatResponse(true, order);
  } catch (err: any) {
    console.error("Error updating order:", err);
    return formatResponse(false, null, err.message, 500);
  }
}

// DELETE /api/orders (soft delete)
async function deleteOrder(req: Request) {

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

// import prisma from "@/server/db/prismadb";
// import { z } from "zod";
// import nodemailer from "nodemailer";
// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// // Zod schema
// const orderSchema = z.object({
//   name: z.string(),
//   email: z.string(),
//   phone: z.string(),
//   cardNumber: z.string().optional(),
//   cardExpiry: z.string().optional(),
//   cvv: z.string().optional(),
//   promoCode: z.string().optional(),
//   consumerId: z.string(),
//   delivery: z.boolean().optional(),
//   paymentOption: z.string().default("Cash"),
//   items: z.array(
//     z.object({
//       marketplaceListingId: z.string(),
//       date: z.string().optional(),
//       timeSlot: z.string().optional(),
//       quantity: z.number().positive(),
//       price: z.number().positive(),
//     })
//   ),
//   totalPrice: z.number().positive(),
//   shippingAddress: z
//     .object({
//       display_name: z.string(),
//       lat: z.number(),
//       lng: z.number(),
//     })
//     .optional(),
//   shippingMethod: z.enum(["Standard", "Express", "AT SHOP"]).optional(),
// });

// async function sendOrderEmail(email: string, orderStatus: string) {
//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
//   });
//   await transporter.sendMail({
//     from: `"ghuba Store" <${process.env.EMAIL}>`,
//     to: email,
//     subject: "Order Update",
//     text: `Your order status has been updated to: ${orderStatus}`,
//   });
// }

// function generateTrackingNumber() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // POST /api/orders
// async function createOrder(req: Request) {

//   const body = await req.json();
//   const parsed = orderSchema.safeParse(body);
//   if (!parsed.success) {
//     return formatResponse(false, null, parsed.error.errors, 400);
//   }

//   const {
//     consumerId,
//     items,
//     totalPrice,
//     shippingAddress,
//     shippingMethod,
//     delivery,
//     paymentOption,
//     name,
//     email,
//     phone,
//     cardNumber,
//     cardExpiry,
//     cvv,
//     promoCode,
//   } = parsed.data;

//   try {
//     const order = await prisma.customerOrder.create({
//       data: {
//         consumerId,
//         name,
//         email,
//         phone,
//         cardNumber,
//         cardExpiry,
//         cvv,
//         promoCode,
//         totalPrice,
//         shippingAddress,
//         shippingMethod,
//         status: "PENDING",
//         delivery,
//         paymentOption,
//         trackingNumber: `TRK${generateTrackingNumber()}`,
//         deliveryStatus: "Order Placed",
//         items: { create: items },
//       },
//       include: { items: true },
//     });
//     return formatResponse(true, order);
//   } catch (err: any) {
//     console.error("Error creating order:", err);
//     return formatResponse(false, null, err.message, 500);
//   }
// }

// // GET /api/orders
// async function getOrders(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const page = parseInt(searchParams.get("page") || "1", 10);
//   const limit = parseInt(searchParams.get("limit") || "10", 10);
//   if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
//     return formatResponse(false, null, "Invalid pagination parameters.", 400);
//   }
//   const skip = (page - 1) * limit;

//   try {
//     const [orders, total] = await Promise.all([
//       prisma.customerOrder.findMany({
//         skip,
//         take: limit,
//         orderBy: { createdAt: "desc" },
//         include: { items: true },
//       }),
//       prisma.customerOrder.count(),
//     ]);
//     const totalPages = Math.ceil(total / limit);

//     return formatResponse(true, { orders, totalPages }, null, 200);
//   } catch (err: any) {
//     console.error("Error fetching orders:", err);
//     return formatResponse(false, null, err.message, 500);
//   }
// }

// // PUT /api/orders
// async function updateOrder(req: Request) {

//   const body = await req.json();
//   const { id, status, deliveryStatus } = body;
//   if (!id || !status || !deliveryStatus) {
//     return formatResponse(false, null, "Missing id, status or deliveryStatus", 400);
//   }

//   try {
//     const order = await prisma.customerOrder.update({
//       where: { id },
//       data: { status, deliveryStatus },
//     });

//     // webhook
//     await fetch(process.env.ORDER_WEBHOOK_URL!, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ orderId: id, status, deliveryStatus }),
//     });

//     const consumer = await prisma.consumer.findUnique({
//       where: { id: order.consumerId },
//       include: { user: { select: { email: true } } },
//     });
//     if (consumer) await sendOrderEmail(consumer.user.email, status);

//     return formatResponse(true, order);
//   } catch (err: any) {
//     console.error("Error updating order:", err);
//     return formatResponse(false, null, err.message, 500);
//   }
// }

// // DELETE /api/orders (soft delete)
// async function deleteOrder(req: Request) {

//   const { id } = await req.json();
//   if (!id) {
//     return formatResponse(false, null, "Missing order ID", 400);
//   }

//   try {
//     const existing = await prisma.customerOrder.findUnique({
//       where: { id, deletedAt: null },
//     });
//     if (!existing || existing.status !== "PENDING") {
//       return formatResponse(false, null, "Only pending orders can be canceled", 400);
//     }

//     const canceled = await prisma.customerOrder.update({
//       where: { id },
//       data: {
//         status: "CANCELLED",
//         deliveryStatus: "Order Canceled",
//         deletedAt: new Date(),
//       },
//     });

//     return formatResponse(true, canceled);
//   } catch (err: any) {
//     console.error("Error soft-deleting order:", err);
//     return formatResponse(false, null, err.message, 500);
//   }
// }

// export const POST = withApiHandler(createOrder);
// export const GET = withApiHandler(getOrders);
// export const PUT = withApiHandler(updateOrder);
// export const DELETE = withApiHandler(deleteOrder);
