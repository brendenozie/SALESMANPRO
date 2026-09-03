import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// =======================================================================
// GET all Donor profiles
// =======================================================================
async function getDonors(request: Request) {

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const cacheKey = buildTenantCacheKey(companyId, "donors", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const donors = await prisma.donor.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      company: true,
      Donation: {
        select: {
          id: true,
          amount: true,
          currency: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  try {
    if (donors) {
      await cacheSet(cacheKey, { data: donors }, 60);
    }
  } catch (e) {}

  return formatResponse(true, { data: donors }, null, 200);
}

// =======================================================================
// POST a new Donor profile
// =======================================================================
async function createDonor(request: Request) {
  
  const body = await request.json();
  const { userId, phoneNumber, companyId } = body;

  // Basic validation
  if (!userId) {
    return formatResponse(false, null, 'User ID is required to create a donor profile.', 400);
  }

  // Check if a donor profile already exists for this user
  const existingDonor = await prisma.donor.findUnique({
    where: { userId },
  });
  if (existingDonor) {
    return formatResponse(false, null, 'A donor profile already exists for this user.', 409); // Conflict
  }

  // Check if the user exists
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!userExists) {
    return formatResponse(false, null, 'User not found.', 404);
  }

  // Create the new Donor profile
  const newDonor = await prisma.donor.create({
    data: {
      user: { connect: { id: userId } },
      phoneNumber: phoneNumber || null,
      company: companyId ? { connect: { id: companyId } } : undefined,
    },
    include: { user: true, company: true }, // Include relations in the response
  });

  
    try {
      await cacheDel(`tenant:${companyId}:donors:*`);
      await cacheDel(`admin:donors:*`);
    } catch (e) {}
    return formatResponse(true, { data: newDonor }, null, 201);
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getDonors);
export const POST = withApiHandler(createDonor);
