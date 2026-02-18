import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// ✅ GET all campaigns
const getCampaigns = async (_request: Request, _context: { user?: any }) => {

  try {    const cached = await cacheGet(`admin:campaigns:all`);
    if (cached) return NextResponse.json(cached, { status: 200 });
  } catch (e) {}

  const campaigns = await prisma.campaign.findMany({
    include: {
      donations: true, // include related donations
    },
    orderBy: {
      createdAt: "desc", // newest first
    },
  });

  // Cache the result for 1 minute
  try {
    await cacheSet(`admin:campaigns:all`, campaigns, 60);
  } catch (e) {}

  return NextResponse.json(campaigns, { status: 200 });
};

// ✅ POST a new campaign
const createCampaign = async (request: Request, _context: { user?: any }) => {
  const body = await request.json();
  const { name, description, startDate, endDate, goalAmount, currentAmount, status } = body;

  // Basic validation
  if (!name || !description || typeof goalAmount !== "number" || goalAmount <= 0 || !status) {
    return NextResponse.json(
      { message: "Missing required fields (name, description, goalAmount, status) or invalid data." },
      { status: 400 }
    );
  }

  // Parse dates safely
  const parsedStartDate = startDate ? new Date(startDate) : null;
  const parsedEndDate = endDate ? new Date(endDate) : null;

  if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    return NextResponse.json(
      { message: "End date cannot be before start date." },
      { status: 400 }
    );
  }

  const newCampaign = await prisma.campaign.create({
    data: {
      name,
      description,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      goalAmount,
      currentAmount: currentAmount || 0,
      status,
    },
  });

  // Invalidate relevant caches
  try { await cacheDel(`admin:campaigns:*`); } catch (e) {}

  return NextResponse.json(newCampaign, { status: 201 });
};

// ✅ Export wrapped handlers
export const GET = withApiHandler(getCampaigns, { requireAuth: true, requireRateLimit: true });
export const POST = withApiHandler(createCampaign, { requireAuth: true, requireRateLimit: true });
