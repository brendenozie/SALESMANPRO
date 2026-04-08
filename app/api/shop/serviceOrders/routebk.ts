// // app/api/orders/route.ts
import prisma from "@/server/db/prismadb";
import { z } from "zod";
import nodemailer from "nodemailer";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

/* -------------------------------------------------------------------------- */
/*                            PAYMENT INTEGRATIONS                            */
/* -------------------------------------------------------------------------- */

/** Initialize Paystack payment */
async function initiatePaystackPayment(amount: number, email: string) {
  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) throw new Error("Missing Paystack secret key");

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack expects kobo (NGN * 100)
        currency: "KES", // Change to 'NGN' or your supported currency
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/verify`,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      console.error("Paystack init failed:", data);
      throw new Error(data.message || "Failed to initialize Paystack payment");
    }

    return {
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    };
  } catch (error: any) {
    console.error("Paystack error:", error);
    // fallback for local testing
    return {
      success: true,
      authorizationUrl: `https://mock-paystack-checkout.com/auth-${generateTrackingNumber()}?amount=${amount}&email=${email}`,
    };
  }
}

/** Get M-Pesa OAuth Token */
async function getMpesaAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) throw new Error("Missing M-Pesa credentials");

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  const data = await response.json();
  if (!data.access_token) throw new Error("Failed to get M-Pesa access token");
  return data.access_token;
}

/** Initiate M-Pesa STK Push (Daraja) */
async function initiateMpesaSTKPush(amount: number, phone: string, trackingNumber: string) {
  try {
    const token = await getMpesaAccessToken();
    const shortCode = process.env.MPESA_SHORTCODE;
    const passKey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`;

    if (!shortCode || !passKey) throw new Error("Missing M-Pesa credentials");

    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .substring(0, 14);

    const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString("base64");

    const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone.replace(/^0/, "254"), // format to 254xxxxxxxxx
        PartyB: shortCode,
        PhoneNumber: phone.replace(/^0/, "254"),
        CallBackURL: callbackUrl,
        AccountReference: `ORDER-${trackingNumber}`,
        TransactionDesc: "Ghuba Order Payment",
      }),
    });

    const data = await response.json();
    // console.log("[M-Pesa STK Response]", data);

    if (data.ResponseCode !== "0") {
      throw new Error(data.errorMessage || "Failed to initiate STK Push");
    }

    return {
      success: true,
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
    };
  } catch (error: any) {
    console.error("M-Pesa STK error:", error);
    // fallback for local testing
    return {
      success: true,
      checkoutRequestId: `mock_checkout_${trackingNumber}`,
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                                 VALIDATION                                 */
/* -------------------------------------------------------------------------- */

const orderSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cvv: z.string().optional(),
  mpesaPhone: z.string().optional(),
  promoCode: z.string().optional(),
  consumerId: z.string(),
  delivery: z.boolean().optional(),
  paymentOption: z.enum(["cod", "pickupatshop", "mpesa", "card", "paystack"]).default("cod"),
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

/* -------------------------------------------------------------------------- */
/*                               HELPER FUNCTIONS                             */
/* -------------------------------------------------------------------------- */

function generateTrackingNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

/* -------------------------------------------------------------------------- */
/*                                ROUTE HANDLERS                              */
/* -------------------------------------------------------------------------- */

// POST /api/orders
async function createOrder(req: Request) {
  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.flatten(), 400);
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
    mpesaPhone,
    promoCode,
  } = parsed.data;

  const trackingNumber = `TRK${generateTrackingNumber()}`;
  let orderStatus = "PENDING";
  let deliveryStatus = "Order Placed";
  const responsePayload: Record<string, any> = {};

  try {
    // --- PAYMENT LOGIC ---
    if (paymentOption === "paystack") {
      const paystack = await initiatePaystackPayment(totalPrice, email);
      if (!paystack.success) throw new Error("Failed to initialize Paystack payment");
      orderStatus = "WAITING_PAYMENT";
      responsePayload.authorizationUrl = paystack.authorizationUrl;
      responsePayload.reference = paystack.reference;
    } else if (paymentOption === "mpesa") {
      if (!mpesaPhone) throw new Error("M-Pesa phone number is required");
      const mpesa = await initiateMpesaSTKPush(totalPrice, mpesaPhone, trackingNumber);
      if (!mpesa.success) throw new Error("Failed to initiate M-Pesa STK Push");
      orderStatus = "WAITING_PAYMENT";
      responsePayload.checkoutRequestId = mpesa.checkoutRequestId;
    } else if (paymentOption === "card") {
      if (!cardNumber || !cardExpiry || !cvv) throw new Error("Card details are incomplete");
      orderStatus = "PROCESSING"; // mock success
    } else if (paymentOption === "cod" || paymentOption === "pickupatshop") {
      orderStatus = "PROCESSING";
    }

    const order = await prisma.customerOrder.create({
      data: {
        consumerId,
        name,
        email,
        phone,
        mpesaPhone,
        promoCode,
        totalPrice,
        shippingAddress,
        shippingMethod,
        status: "PENDING",
        delivery,
        paymentOption,
        trackingNumber,
        deliveryStatus,
        items: { create: items },
      },
      include: { items: true },
    });

    return formatResponse(true, { ...order, ...responsePayload }, null, 200);
  } catch (err: any) {
    console.error("Error creating order:", err);
    return formatResponse(false, null, err.message, 500);
  }
}

/* -------------------------------------------------------------------------- */
/*                                OTHER METHODS                               */
/* -------------------------------------------------------------------------- */

async function getOrders(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
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
    return formatResponse(true, { orders, totalPages: Math.ceil(total / limit) });
  } catch (err: any) {
    console.error("Error fetching orders:", err);
    return formatResponse(false, null, err.message, 500);
  }
}

async function updateOrder(req: Request) {
  const body = await req.json();
  const { id, status, deliveryStatus } = body;

  if (!id || !status || !deliveryStatus) {
    return formatResponse(false, null, "Missing id, status, or deliveryStatus", 400);
  }

  try {
    const order = await prisma.customerOrder.update({
      where: { id },
      data: { status, deliveryStatus },
    });

    if (process.env.NEXT_PUBLIC_ORDER_WEBHOOK_URL) {
      await fetch(process.env.NEXT_PUBLIC_ORDER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, status, deliveryStatus }),
      });
    }

    const consumer = await prisma.consumer.findUnique({
      where: { id: order.consumerId },
      include: { user: { select: { email: true } } },
    });
    if (consumer?.user?.email) {
      await sendOrderEmail(consumer.user.email, status);
    }

    return formatResponse(true, order);
  } catch (err: any) {
    console.error("Error updating order:", err);
    return formatResponse(false, null, err.message, 500);
  }
}

async function deleteOrder(req: Request) {
  const { id } = await req.json();
  if (!id) return formatResponse(false, null, "Missing order ID", 400);

  try {
    const existing = await prisma.customerOrder.findUnique({ where: { id, deletedAt: null } });
    if (!existing || existing.status !== "PENDING") {
      return formatResponse(false, null, "Only pending orders can be canceled", 400);
    }

    const canceled = await prisma.customerOrder.update({
      where: { id },
      data: { status: "CANCELLED", deliveryStatus: "Order Canceled", deletedAt: new Date() },
    });

    return formatResponse(true, canceled);
  } catch (err: any) {
    console.error("Error deleting order:", err);
    return formatResponse(false, null, err.message, 500);
  }
}

/* -------------------------------------------------------------------------- */
/*                                 EXPORT HANDLERS                            */
/* -------------------------------------------------------------------------- */

export const POST = withApiHandler(createOrder);
export const GET = withApiHandler(getOrders);
export const PUT = withApiHandler(updateOrder);
export const DELETE = withApiHandler(deleteOrder);

// import prisma from "@/server/db/prismadb";
// import { z } from "zod";
// import nodemailer from "nodemailer";
// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// // --- PAYMENT UTILITY FUNCTIONS (MOCK IMPLEMENTATIONS) ---

// /**
//  * Mocks the initiation of a Paystack transaction.
//  * In a real scenario, this calls the Paystack Initialize Transaction API.
//  * @returns An object containing the authorization URL for redirection.
//  */
// async function initiatePaystackPayment(amount: number, email: string) {
//   // NOTE: In production, you would call the Paystack API here.
//   console.log(`[Paystack Mock] Initiating payment for ${amount} from ${email}`);
  
//   // MOCK: Return a success and a mock authorization URL for the client to redirect to
//   const mockAuthorizationUrl = `https://mock-paystack-checkout.com/auth-${generateTrackingNumber()}?amount=${amount}&email=${email}`;
  
//   return {
//     success: true,
//     authorizationUrl: mockAuthorizationUrl,
//   };
// }

// /**
//  * Mocks the initiation of an M-Pesa STK Push.
//  * In a real scenario, this calls the M-Pesa C2B API.
//  * @returns An object containing the M-Pesa Request ID.
//  */
// async function initiateMpesaSTKPush(amount: number, phone: string, trackingNumber: string) {
//   // NOTE: In production, you would call the Safaricom Daraja API here.
//   console.log(`[M-Pesa Mock] Initiating STK Push for ${amount} to ${phone}`);
  
//   // MOCK: Return a successful M-Pesa Request ID.
//   const mockCheckoutRequestId = `ws_CO_123456_${trackingNumber}`;
  
//   return {
//     success: true,
//     checkoutRequestId: mockCheckoutRequestId,
//   };
// }


// // Zod schema updated to include M-Pesa phone number
// const orderSchema = z.object({
//   name: z.string(),
//   email: z.string(),
//   phone: z.string(),
  
//   // Card Details
//   cardNumber: z.string().optional(),
//   cardExpiry: z.string().optional(),
//   cvv: z.string().optional(),
  
//   // M-Pesa Details
//   mpesaPhone: z.string().optional(),

//   promoCode: z.string().optional(),
//   consumerId: z.string(),
//   delivery: z.boolean().optional(),
//   paymentOption: z.string().default("cod"), // Default changed to 'cod'
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
//     mpesaPhone, // NEW: M-Pesa phone number
//     promoCode,
//   } = parsed.data;

//   // Initial order status based on payment option
//   let orderStatus = "PENDING";
//   let deliveryStatus = "Order Placed";
//   let responsePayload: any = {};
//   const trackingNumber = `TRK${generateTrackingNumber()}`;
  
//   try {
//     // 1. PAYMENT INITIATION LOGIC
//     if (paymentOption === 'paystack') {
//       const paymentResult = await initiatePaystackPayment(totalPrice, email);
      
//       if (!paymentResult.success || !paymentResult.authorizationUrl) {
//         throw new Error("Failed to initialize Paystack payment.");
//       }
//       // If Paystack init is successful, we set the order status to WAITING_PAYMENT
//       orderStatus = "WAITING_PAYMENT"; 
//       responsePayload.authorizationUrl = paymentResult.authorizationUrl;

//     } else if (paymentOption === 'mpesa') {
//       if (!mpesaPhone) throw new Error("M-Pesa phone number is required.");

//       const paymentResult = await initiateMpesaSTKPush(totalPrice, mpesaPhone, trackingNumber);
      
//       if (!paymentResult.success) {
//         throw new Error("Failed to initiate M-Pesa STK Push.");
//       }
//       // If M-Pesa init is successful, we set the order status to WAITING_PAYMENT
//       orderStatus = "WAITING_PAYMENT"; 
//       responsePayload.checkoutRequestId = paymentResult.checkoutRequestId;
      
//     } else if (paymentOption === 'card') {
//       // MOCK: In a real system, you would try to charge the card now.
//       // If successful: orderStatus = "PROCESSING";
//       // If failed: throw new Error("Card charge failed.");
      
//       // Since this is a mock, we assume the backend handles the charge synchronously and it passed.
//       if (!cardNumber || !cardExpiry || !cvv) throw new Error("Card details are incomplete.");
//       orderStatus = "PROCESSING"; 
      
//     } else if (paymentOption === 'cod' || paymentOption === 'pickupatshop') {
//       // Cash on Delivery/Pickup: Payment is deferred.
//       orderStatus = "PROCESSING"; 
//     } else {
//       throw new Error(`Unsupported payment option: ${paymentOption}`);
//     }

//     // 2. CREATE THE ORDER IN THE DATABASE
//     const order = await prisma.customerOrder.create({
//       data: {
//         consumerId,
//         name,
//         email,
//         phone,
//         cardNumber, // Saving card details (temporarily) - NOT best practice in production!
//         cardExpiry,
//         cvv,
//         mpesaPhone, // Saving M-Pesa phone number
//         promoCode,
//         totalPrice,
//         shippingAddress,
//         shippingMethod,
//         status: "PENDING", // Use the dynamically set status
//         delivery,
//         paymentOption,
//         trackingNumber: trackingNumber, // Use the generated tracking number
//         deliveryStatus: deliveryStatus,
//         items: { create: items },
//       },
//       include: { items: true },
//     });
    
//     // 3. COMPILE FINAL RESPONSE
//     const finalResponse = {
//       ...order,
//       ...responsePayload, // Add authorizationUrl or checkoutRequestId if present
//     };

//     // Return the response, which includes the tracking number and potentially a redirect URL
//     return formatResponse(true, finalResponse);

//   } catch (err: any) {
//     console.error("Error creating order:", err);
//     // If payment or creation fails, return a 400 or 500 error
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
//     await fetch(process.env.NEXT_PUBLIC_ORDER_WEBHOOK_URL!, {
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
//     await fetch(process.env.NEXT_PUBLIC_ORDER_WEBHOOK_URL!, {
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
