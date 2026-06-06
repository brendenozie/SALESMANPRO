// app/api/shop/orders/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/server/db/prismadb";
import { createOrder as createOrderRecord } from "@/lib/orders/createOrder";
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack"; // Temporary Ghuba fallback
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// ---------------------------
// CROSS-DOMAIN CORS PRE-FLIGHT
// Essential for multi-tenant custom domains hitting this API
// ---------------------------
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, cache-control",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// ---------------------------
// SCHEMA VALIDATION
// ---------------------------
const orderItemSchema = z.object({
  marketplaceListingId: z.string().min(1),
  date: z.string().optional(),
  timeSlot: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

const orderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone is required"),
  mpesaPhone: z.string().optional(),
  consumerId: z.string().min(1),
  paymentOption: z
    .enum(["cod", "pickupatshop", "mpesa", "card", "paystack", "ghuba", "stripe", "paypal"])
    .default("cod"),
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  trackingNumber: z.string().optional(),
  totalPrice: z.number().positive(),
  totalFinalPrice: z.number().optional(),
  shippingAddress: z.record(z.string(), z.any()).optional(), // Hardened from z.any()
  shippingMethod: z.string().optional(),
  companyId: z.string().min(1, "Company ID is required"),
  paymentData: z.record(z.string(), z.any()).optional(),
});

// ---------------------------
// UTILS
// ---------------------------
function generateTrackingNumber() {
  // Generates a collision-resistant ID like: TRK-2605-A8F9B2
  const datePart = new Date().toISOString().slice(2, 7).replace('-', '');
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TRK-${datePart}-${randomPart}`;
}

// ---------------------------
// ROUTE HANDLER
// ---------------------------
export const POST = withApiHandler(
  async (req) => {
    try {
      const body = await req.json();
      const parsed = orderSchema.safeParse(body);

      if (!parsed.success) {
        // Return explicit field errors to the frontend for better UI/UX mapping
        const errorMessages = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
        return formatResponse(false, null, `Validation failed: ${errorMessages}`, 400);
      }

      const data = parsed.data;
      const trackingNumber = data.trackingNumber ?? generateTrackingNumber();

      // 1. Create the base order record
      const orderDb = await createOrderRecord({
        consumerId: data.consumerId,
        items: data.items,
        totalPrice: data.totalPrice,
        totalFinalPrice: data.totalFinalPrice ?? data.totalPrice,
        mpesaPhone: data.mpesaPhone,
        paymentOption: data.paymentOption,
        shippingAddress: data.shippingAddress,
        shippingMethod: data.shippingMethod,
        name: data.name,
        email: data.email,
        phone: data.phone,
        promoCode: data.paymentData?.promoCode ?? undefined,
        trackingNumber,
        deliveryStatus: "Order Placed",
        delivery: false,
        notes: data.paymentData?.notes ?? undefined,
        companyId: data.companyId,
      });

      // 2. Retrieve Tenant Payment Configurations
      const cfg = await getCompanyPaymentConfig(data.companyId);
      if (!cfg || !cfg.credentials) {
        return formatResponse(false, null, "Payment gateway configuration is missing for this store.", 500);
      }

      // 3. Route to specific payment processor
      let paymentResponse: any = null;

      switch (data.paymentOption) {
        case "mpesa": {
          const phoneNumber = data.paymentData?.mpesaPhone ?? data.mpesaPhone ?? data.phone;
          if (!phoneNumber) return formatResponse(false, null, "M-Pesa phone number required", 400);
          
          paymentResponse = await initiateMpesaPayment(orderDb, phoneNumber, cfg.credentials);
          break;
        }
        case "paystack": {
          paymentResponse = await initiatePaystackPayment(orderDb, data.email, cfg.credentials);
          break;
        }
        case "ghuba": {
          // FIXED: Passed cfg.credentials to the Paystack alias
          paymentResponse = await initiateGhubaPayment(orderDb, data.email);
          break;
        }
        case "stripe": {
          paymentResponse = await initiateStripePaymentIntent(orderDb, cfg.credentials);
          break;
        }
        case "paypal": {
          paymentResponse = await createPaypalOrder(orderDb, cfg.credentials);
          break;
        }
        case "cod":
        case "pickupatshop": {
          paymentResponse = { message: "Payment on delivery or pickup confirmed." };
          await prisma.customerOrder.update({
            where: { id: orderDb.id },
            data: { paymentStatus: "PENDING" },
          });
          break;
        }
        default:
          return formatResponse(false, null, "Unsupported payment option", 400);
      }

      // 4. Return successful payload
      const authorizationUrl = 
        paymentResponse?.data?.authorization_url ?? 
        paymentResponse?.authorization_url ?? 
        null;

      const response = formatResponse(
        true,
        {
          order: orderDb,
          trackingNumber,
          paymentResponse,
          authorizationUrl,
        },
        "Order created successfully",
        201
      );

      // Inject CORS headers onto the successful response just in case `withApiHandler` misses them
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;

    } catch (err: any) {
      console.error("[ORDER_CREATION_ERROR]", err);
      return formatResponse(false, null, err.message || "Failed to process order checkout", 500);
    }
  },
  {
    requireAuth: false, // Must remain false for public storefronts
    requireRateLimit: true, // HIGHLY RECOMMENDED: Prevent carding/spam attacks on your payment endpoints
  }
);
// // app/api/shop/orders/route.ts
// import { NextResponse } from "next/server";
// import { z } from "zod";
// import prisma from "@/server/db/prismadb";
// import { createOrder as createOrderRecord } from "@/lib/orders/createOrder"; // your createOrder helper path
// import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
// import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
// import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
// // import { initiateGhubaPayment } from "@/lib/paymentsv2/ghuba"; defaulto paystack for ghuba temporarily
// import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack";
// import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
// import { createPaypalOrder } from "@/lib/paymentsv2/paypal";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// import { formatResponse } from "@/lib/formatResponse";

// // ---------------------------
// // GLOBAL CORS HEADERS
// // ---------------------------
// // const CORS_HEADERS = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
// //   "Access-Control-Allow-Headers":
// //   "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
// // };
// // const CORS_HEADERS = {
// //   "Access-Control-Allow-Origin": "*", // Or your specific desktop app origin
// //   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
// //   "Access-Control-Allow-Credentials": "true",
// //   "Access-Control-Allow-Headers":
// //     "Content-Type, Authorization, X-Requested-With, Accept, cache-control",
// //   "Access-Control-Max-Age": "86400",
// // };

// // function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
// //   return new NextResponse(JSON.stringify(json), {
// //     status,
// //     headers: {
// //       "Content-Type": "application/json",
// //       ...CORS_HEADERS,
// //       ...extraHeaders,
// //     },
// //   });
// // }

// // ---------------------------
// // OPTIONS (PRE-FLIGHT)
// // ---------------------------
// // export function OPTIONS() {
// //   return new NextResponse(null, {
// //     status: 204,
// //     headers: CORS_HEADERS,
// //   });
// // }

// // export async function OPTIONS(request: Request) {
// //   return new Response(null, {
// //     status: 204, // 204 No Content is standard for preflight responses
// //     headers: {
// //       "Access-Control-Allow-Origin": "*", // Or '*' for testing
// //       "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
// //       "Access-Control-Allow-Headers": "Content-Type, Authorization",
// //       "Access-Control-Allow-Credentials": "true",
// //     },
// //   });
// // }

// /* Order schema - mirrors your existing schema (light validation) */
// const orderSchema = z.object({
//   name: z.string(),
//   email: z.string().email(),
//   phone: z.string(),
//   mpesaPhone: z.string().optional(),
//   consumerId: z.string(),
//   paymentOption: z
//     .enum([
//       "cod",
//       "pickupatshop",
//       "mpesa",
//       "card",
//       "paystack",
//       "ghuba",
//       "stripe",
//       "paypal",
//     ])
//     .default("cod"),
//   items: z.array(
//     z.object({
//       marketplaceListingId: z.string(),
//       date: z.string().optional(),
//       timeSlot: z.string().optional(),
//       quantity: z.number().positive(),
//       price: z.number().positive(),
//     }),
//   ),
//   trackingNumber: z.string().optional(),
//   totalPrice: z.number().positive(),
//   totalFinalPrice: z.number().optional(),
//   shippingAddress: z.any().optional(),
//   shippingMethod: z.string().optional(),
//   companyId: z.string(),
//   paymentData: z.any().optional(),
// });

// function generateTrackingNumber() {
//   return `TRK${Math.floor(100000 + Math.random() * 900000).toString()}`;
// }

// // export async function POST(req: Request) {
// export const POST = withApiHandler(
//   async (req) => {
//     try {
//       // if (req.method === "OPTIONS") {
//       //   return NextResponse.next();
//       // }

//       const body = await req.json();
//       const parsed = orderSchema.safeParse(body);

//       if (!parsed.success) {
//         // return withCors({ success: false, error: parsed.error.flatten() }, 400);
//         // return formatResponse({ success: false, error: parsed.error.flatten() }, 400);
//         return formatResponse(false, null, "Invalid order data", 400);
//       }

//       const data = parsed.data;
//       const trackingNumber = data.trackingNumber ?? generateTrackingNumber();

//       const orderDb = await createOrderRecord({
//         consumerId: data.consumerId,
//         items: data.items,
//         totalPrice: data.totalPrice,
//         totalFinalPrice: data.totalFinalPrice ?? data.totalPrice,
//         mpesaPhone: data.mpesaPhone,
//         paymentOption: data.paymentOption,
//         shippingAddress: data.shippingAddress,
//         shippingMethod: data.shippingMethod,
//         name: data.name,
//         email: data.email,
//         phone: data.phone,
//         promoCode: data.paymentData?.promoCode ?? undefined,
//         trackingNumber,
//         deliveryStatus: "Order Placed",
//         delivery: false,
//         notes: data.paymentData?.notes ?? undefined,
//         companyId: data.companyId,
//       });

//       let paymentResponse = null;
//       const cfg = await getCompanyPaymentConfig(data.companyId);

//       switch (data.paymentOption) {
//         case "mpesa": {
//           const phoneNumber =
//             data.paymentData?.mpesaPhone ?? data.mpesaPhone ?? data.phone;
//           if (!phoneNumber)
//             return formatResponse(false, null, "mpesaPhone required", 400);
//           paymentResponse = await initiateMpesaPayment(
//             orderDb,
//             phoneNumber,
//             cfg.credentials,
//           );
//           break;
//         }
//         case "paystack": {
//           paymentResponse = await initiatePaystackPayment(
//             orderDb,
//             data.email,
//             cfg.credentials,
//           );
//           break;
//         }
//         case "ghuba": {
//           // paymentResponse = await initiateGhubaPayment(orderDb, cfg.credentials);
//           paymentResponse = await initiateGhubaPayment(orderDb, body.email);
//           break;
//         }
//         case "stripe": {
//           paymentResponse = await initiateStripePaymentIntent(
//             orderDb,
//             cfg.credentials,
//           );
//           break;
//         }
//         case "paypal": {
//           paymentResponse = await createPaypalOrder(orderDb, cfg.credentials);
//           break;
//         }
//         case "cod":
//         case "pickupatshop": {
//           paymentResponse = {
//             message: "Payment on delivery or pickup confirmed.",
//           };
//           // mark paymentStatus accordingly if you want
//           await prisma.customerOrder.update({
//             where: { id: orderDb.id },
//             data: { paymentStatus: "PENDING" },
//           });
//           break;
//         }
//         default:
//           paymentResponse = { message: "Unknown payment option" };
//       }

//       return formatResponse(
//         true,
//         {
//           order: orderDb,
//           trackingNumber,
//           paymentResponse,
//           authorizationUrl:
//             paymentResponse?.data?.authorization_url ??
//             paymentResponse?.authorization_url ??
//             null,
//         },
//         "Order created successfully",
//         201,
//       );

//       // return withCors({
//       //   success: true,
//       //   data: {
//       //     order: orderDb,
//       //     trackingNumber,
//       //     paymentResponse,
//       //     authorizationUrl: paymentResponse?.data?.authorization_url ?? paymentResponse?.authorization_url ?? null,
//       //   },
//       // });
//     } catch (err: any) {
//       console.error("Order creation failed:", err);
//       return formatResponse(
//         false,
//         null,
//         err.message || "Internal Server Error",
//         500,
//       );
//     }
//   },
//   {
//     requireAuth: false, // ✅ VERY IMPORTANT
//     requireRateLimit: false,
//   },
// );
