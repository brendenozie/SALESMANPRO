import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import bcrypt from "bcryptjs";

/* ====================================================
   GET /api/consumers
   Lists all consumers with nested profiles
====================================================== */
export const GET = withApiHandler(async (request, context) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.user?.companyId;

  if (!companyId)
    return formatResponse(false, null, "Company ID required", 400);

  const cacheKey = buildTenantCacheKey(companyId, "consumers", {});
  const cached = await cacheGet(cacheKey);
  if (cached) return formatResponse(true, cached, "Fetched (cached)", 200);

  const consumers = await prisma.consumer.findMany({
    where: { companyId },
    include: {
      user: {
        select: { name: true, email: true, phone: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  await cacheSet(cacheKey, consumers, 60);
  return formatResponse(true, consumers, "Consumers fetched", 200);
});

/* ====================================================
   POST /api/consumers
   Handles safe atomic creation with related nested user records
====================================================== */
export const POST = withAuthAndRateLimit(async (request) => {
  const body = await request.json();
  const {
    name,
    email,
    phone,
    password,
    companyId,
    bio,
    type = "lead",
    stage = "new",
    source,
    interest = [],
    preferredTypes = [],
    budgetRange,
    tags = [],
    notes,
    membershipStatus = "PENDING",
    photoUrl,
    activityScore = 40,
  } = body;

  if (!name || !email || !companyId) {
    return formatResponse(
      false,
      null,
      "Missing required transactional identity parameters",
      400,
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (exists)
    return formatResponse(
      false,
      null,
      "User profile already registered under that email token",
      409,
    );

  const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedPassword = await bcrypt.hash(password || "consumer123", 10);

  const consumer = await prisma.$transaction(async (tx) => {
    return tx.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        role: "USER",
        image: photoUrl || null,
        consumerProfile: {
          create: {
            companyId,
            loginCode,
            bio,
            type,
            stage,
            source,
            interest,
            preferredTypes,
            budgetRange,
            tags,
            notes,
            membershipStatus,
            photoUrl,
            activityScore,
          },
        },
      },
      include: {
        consumerProfile: {
          include: { user: true },
        },
      },
    });
  });

  await cacheDel(`tenant:${companyId}:consumers:*`);
  await cacheDel(`admin:consumers:*`);

  // Return nested structure matched by the updated frontend
  return formatResponse(
    true,
    consumer.consumerProfile,
    "Consumer initialized successfully",
    201,
  );
});
