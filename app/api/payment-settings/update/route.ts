import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { encrypt } from "@/lib/crypto/aes";

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
    return NextResponse.json(updated);
  }

  // Create when no existing settings are found
  const created = await prisma.paymentSettings.create({
    data: {
      companyId: body.companyId,
      ...updatePayload,
    },
  });

  return NextResponse.json(created);
}
