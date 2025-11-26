import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { encrypt } from "@/lib/crypto/aes";

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}


export async function POST(req: NextRequest) {
  const body = await req.json();

  const updatePayload: any = {
    isStripeEnabled: body.isStripeEnabled,
    isPaypalEnabled: body.isPaypalEnabled,
    isMpesaEnabled: body.isMpesaEnabled,
    isPaystackEnabled: body.isPaystackEnabled,
    isGhubaEnabled: body.isGhubaEnabled,
    stripePublishableKey: body.stripePublishableKey,
    paypalClientId: body.paypalClientId,
  };

  if (body.stripeSecretKey) {
    const encrypted = encrypt(body.stripeSecretKey);
    updatePayload.stripeSecret_encrypted = encrypted.value;
    updatePayload.stripeSecret_iv = encrypted.iv;
    updatePayload.stripeSecret_tag = encrypted.tag;
  }

  // Find existing settings for the company (findFirst accepts relation filters)
  const existing = await prisma.paymentSettings.findFirst({
    where: { company: { id: body.companyId } },
  });

  if (existing) {
    // Update by the unique id of the found record
    const updated = await prisma.paymentSettings.update({
      where: { id: existing.id },
      data: updatePayload,
    });
    return withCors(updated);
  }

  // Create when no existing settings are found
  const created = await prisma.paymentSettings.create({
    data: {
      companyId: body.companyId,
      ...updatePayload,
    },
  });

  return withCors(created);
}

// import prisma from "@/server/db/prismadb";
// import { encrypt } from "@/lib/encryption";
// import { formatResponse } from "@/lib/formatResponse";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";

// async function updatePaymentSettings(req: Request, context: HandlerContext) {
//   const { user } = context;
//   if (!user) return formatResponse(false, null, "Unauthorized", 401);

//   const body = await req.json();
//   const { id, stripeSecretKey, paypalClientSecret, paystackSecretKey, ghubaApiKey, ...rest } = body;

//   if (!id) return formatResponse(false, null, "Missing payment settings id", 400);

//   const updateData: any = {
//     ...rest, // all non-secret fields update normally
//   };

//   // ------- STRIPE SECRET ENCRYPT -------
//   if (stripeSecretKey) {
//     const encrypted = encrypt(stripeSecretKey);

//     updateData.stripeSecret_encrypted = encrypted.value;
//     updateData.stripeSecret_iv = encrypted.iv;
//     updateData.stripeSecret_tag = encrypted.tag;

//     updateData.stripeSecretKey = null; // DO NOT STORE RAW VALUE
//   }

//   // ------- PAYPAL SECRET ENCRYPT -------
//   if (paypalClientSecret) {
//     const encrypted = encrypt(paypalClientSecret);

//     updateData.paypalSecret_encrypted = encrypted.value;
//     updateData.paypalSecret_iv = encrypted.iv;
//     updateData.paypalSecret_tag = encrypted.tag;

//     updateData.paypalClientSecret = null; 
//   }

//   // ------- PAYSTACK SECRET ENCRYPT -------
//   if (paystackSecretKey) {
//     const encrypted = encrypt(paystackSecretKey);

//     updateData.paystackSecret_encrypted = encrypted.value;
//     updateData.paystackSecret_iv = encrypted.iv;
//     updateData.paystackSecret_tag = encrypted.tag;

//     updateData.paystackSecretKey = null;
//   }

//   // ------- GHUBA SECRET ENCRYPT -------
//   if (ghubaApiKey) {
//     const encrypted = encrypt(ghubaApiKey);

//     updateData.ghubaSecret_encrypted = encrypted.value;
//     updateData.ghubaSecret_iv = encrypted.iv;
//     updateData.ghubaSecret_tag = encrypted.tag;

//     updateData.ghubaApiKey = null;
//   }

//   // ------- UPDATE DB -------
//   const updated = await prisma.paymentSettings.update({
//     where: { id },
//     data: updateData,
//   });

//   return formatResponse(true, updated, "Payment settings updated");
// }

// export const POST = withApiHandler(updatePaymentSettings);
