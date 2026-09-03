import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

const getCampaigns = async (request: Request, context: { user?: any }) => {
  const user = context.user;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const status = searchParams.get("status");

  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;

  const cacheKey = `admin:campaigns:${status || 'all'}:page:${page}:limit:${limit}`;

  try {    
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json(cached, { status: 200 });
  } catch (e) {}

  const [total, campaigns] = await prisma.$transaction([
    prisma.campaign.count({ where }),
    prisma.campaign.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        goalAmount: true,
        currentAmount: true,
        status: true,
        createdAt: true,
        _count: {
          select: { donations: true },
        },
      },
    }),
  ]);

  // Cache total count for pagination (optional)
  try {
    await cacheSet(`admin:campaigns:total:${status || 'all'}`, total, 60); // Cache for 1 minute
  } catch (e) {}
  
  try {
    await cacheSet(cacheKey, {
      data: campaigns.map((c) => ({
        ...c,
        donationsCount: c._count.donations,
      })),
      page,
      totalPages: Math.ceil(total / limit),
      total,
    },
    60); // Cache for 60 seconds
  } catch (e) {}
  
  return NextResponse.json({
    data: campaigns.map((c) => ({
      ...c,
      donationsCount: c._count.donations,
    })),
    page,
    totalPages: Math.ceil(total / limit),
    total,
  });
};

const createCampaign = async (request: Request, context: { user?: any }) => {
  const user = context.user;
  const body = await request.json();

  const { name, description, startDate, endDate, goalAmount, status } = body;

  if (!name || !description || !goalAmount || !status) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const parsedGoal = Number(goalAmount);
  if (isNaN(parsedGoal) || parsedGoal <= 0) {
    return NextResponse.json({ error: "Invalid goalAmount." }, { status: 400 });
  }

  const parsedStartDate = startDate ? new Date(startDate) : null;
  const parsedEndDate = endDate ? new Date(endDate) : null;

  if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    return NextResponse.json(
      { error: "End date cannot be before start date." },
      { status: 400 }
    );
  }

  const newCampaign = await prisma.campaign.create({
    data: {
      name,
      description,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      goalAmount: parsedGoal,
      currentAmount: 0,
      status,
    },
    select: {
      id: true,
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      goalAmount: true,
      currentAmount: true,
      status: true,
      createdAt: true,
    },
  });

    // Invalidate relevant caches
  try {
    await cacheDel(`tenant:${'unscoped'}:campaigns:*`);
    await cacheDel(`admin:campaigns:*`);
  } catch (e) {}

  return NextResponse.json(newCampaign, { status: 201 });
};

export const GET = withApiHandler(getCampaigns, {
  requireAuth: true,
  requireRateLimit: true,
});

export const POST = withApiHandler(createCampaign, {
  requireAuth: true,
  requireRateLimit: true,
});
// import { NextResponse } from "next/server";
//  => {
//   const companyId = context.user?.companyId;

//   if (!companyId) return formatResponse(false, null, "Unauthorized", 401);

//   // OPTIMIZATION: Database Aggregation
//   const campaigns = await prisma.campaign.findMany({
//     where: { companyId },
//     select: {
//       id: true,
//       name: true,
//       description: true,
//       status: true,
//       goalAmount: true,
//       currentAmount: true, // Assuming this is a tracked field
//       startDate: true,
//       endDate: true,
//       _count: {
//         select: { donations: true } // Only get the NUMBER of donations, not the data
//       }
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   return formatResponse(true, campaigns, "Campaigns fetched", 200);
// };

// // ✅ POST: Create a new campaign
// const createCampaign = async (request: Request, context: { user?: any }) => {
//   const companyId = context.user?.companyId;
//   if (!companyId) return formatResponse(false, null, "Unauthorized", 401);

//   const body = await request.json();
//   const { name, description, startDate, endDate, goalAmount, status } = body;

//   // 1. Validation Logic
//   if (!name || !description || !goalAmount || goalAmount <= 0) {
//     return formatResponse(false, null, "Invalid name or goal amount.", 400);
//   }

//   const start = startDate ? new Date(startDate) : null;
//   const end = endDate ? new Date(endDate) : null;

//   if (start && end && start > end) {
//     return formatResponse(false, null, "End date cannot be before start date.", 400);
//   }

//   // 2. Atomic Create
//   const newCampaign = await prisma.campaign.create({
//     data: {
//       name,
//       description,
//       goalAmount,
//       status: status || "DRAFT",
//       startDate: start,
//       endDate: end,
//       company: { connect: { id: companyId } }, // Securely link to company
//     },
//   });

//   return formatResponse(true, newCampaign, "Campaign created", 201);
// };

// export const GET = withApiHandler(getCampaigns, { requireAuth: true });
// export const POST = withApiHandler(createCampaign, { requireAuth: true });
// import { NextResponse } from "next/server";
//  => {
//   const campaigns = await prisma.campaign.findMany({
//     include: {
//       donations: true, // include related donations
//     },
//     orderBy: {
//       createdAt: "desc", // newest first
//     },
//   });

//   return NextResponse.json(campaigns, { status: 200 });
// };

// // ✅ POST a new campaign
// const createCampaign = async (request: Request, _context: { user?: any }) => {
//   const body = await request.json();
//   const { name, description, startDate, endDate, goalAmount, currentAmount, status } = body;

//   // Basic validation
//   if (!name || !description || typeof goalAmount !== "number" || goalAmount <= 0 || !status) {
//     return NextResponse.json(
//       { message: "Missing required fields (name, description, goalAmount, status) or invalid data." },
//       { status: 400 }
//     );
//   }

//   // Parse dates safely
//   const parsedStartDate = startDate ? new Date(startDate) : null;
//   const parsedEndDate = endDate ? new Date(endDate) : null;

//   if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
//     return NextResponse.json(
//       { message: "End date cannot be before start date." },
//       { status: 400 }
//     );
//   }

//   const newCampaign = await prisma.campaign.create({
//     data: {
//       name,
//       description,
//       startDate: parsedStartDate,
//       endDate: parsedEndDate,
//       goalAmount,
//       currentAmount: currentAmount || 0,
//       status,
//     },
//   });

//   return NextResponse.json(newCampaign, { status: 201 });
// };

// // ✅ Export wrapped handlers
// export const GET = withApiHandler(getCampaigns, { requireAuth: true, requireRateLimit: true });
// export const POST = withApiHandler(createCampaign, { requireAuth: true, requireRateLimit: true });
