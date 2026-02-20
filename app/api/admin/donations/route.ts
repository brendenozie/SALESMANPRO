import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// =======================================================================
// GET all donations
// =======================================================================
async function getDonations(request: Request) {

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");

  const cacheKey = `admin:donations:${campaignId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const donations = await prisma.donation.findMany({
    include: {
      donor: true,
      project: true,
      campaign: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  try {
    if (donations) {
      await cacheSet(cacheKey, { data: donations }, 60);
    }
  } catch (e) {}

  return formatResponse(true, { data: donations }, null, 200);
}

// =======================================================================
// POST a new donation
// =======================================================================
async function createDonation(request: Request) {
  

  const body = await request.json();
  const { donorId, amount, currency, paymentMethod, notes, status, projectId, campaignId, transactionId } = body;

  // Basic validation
  if (!donorId || typeof amount !== 'number' || amount <= 0 || !currency || !status) {
    return formatResponse(false, null, 'Missing required fields or invalid data.', 400);
  }

  const newDonation = await prisma.donation.create({
    data: {
      donor: { connect: { id: donorId } },
      amount,
      currency,
      paymentMethod: paymentMethod || null,
      notes: notes || null,
      status,
      projectId: projectId || null,
      campaignId: campaignId || null,
      transactionId: transactionId || null,
    },
  });

  // Optionally update campaign's currentAmount if status is SUCCESS
  if (campaignId && status === 'SUCCESS') {
    try {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          currentAmount: {
            increment: amount,
          },
        },
      });
    } catch (campaignError) {
      console.warn(`Warning: Could not update campaign ${campaignId} currentAmount.`, campaignError);
    }
  }

  
    try { await cacheDel(`admin:donations:${campaignId || 'global'}:*`); } catch (e) {}

    return formatResponse(true, { data: newDonation }, null, 201);
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getDonations);
export const POST = withApiHandler(createDonation);
