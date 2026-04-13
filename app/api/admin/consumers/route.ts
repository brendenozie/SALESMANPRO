import prisma from "@/server/db/prismadb";
import { withAuthAndRateLimit } from "@/lib/hooks/withAuthAndRateLimit";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import bcrypt from "bcryptjs";

// =====================
// GET /api/consumers
// =====================
export const GET = withApiHandler(async (request, context) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.user?.companyId;

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }

  const cacheKey = `admin:consumers:${companyId}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const consumers = await prisma.consumer.findMany({
    where: { companyId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
          phone: true,
        },
      },
      _count: {
        select: { ConsumerInventory: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  try {
    await cacheSet(cacheKey, consumers, 60);
  } catch (e) {}

  return formatResponse(true, consumers, "Consumers fetched successfully", 200);
});

// =====================
// POST /api/consumers
// =====================
export const POST = withAuthAndRateLimit(async (request) => {
  const body = await request.json();
  let { name, email, password, companyId, phone, profileImageUrl } = body;

  if (!name || !email || !companyId) {
    return formatResponse(false, null, "Missing required fields", 400);
  }

  email = email.toLowerCase().trim();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return formatResponse(
      false,
      null,
      "A user with this email already exists",
      409,
    );
  }

  // Generate unique 6-digit login code for the consumer
  const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedPassword = await bcrypt.hash(password || "consumer123", 10);

  try {
    const newConsumer = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          image: profileImageUrl,
          role: "USER", // Or a specific CONSUMER role if defined in your ENUM
          consumerProfile: {
            create: {
              companyId,
              loginCode,
            },
          },
        },
        include: {
          consumerProfile: true,
        },
      });
    });

    try {
      await cacheDel(`admin:consumers:${companyId}:*`);
    } catch (e) {}

    return formatResponse(
      true,
      newConsumer,
      "Consumer created successfully",
      201,
    );
  } catch (error) {
    console.error("Consumer Creation Error:", error);
    return formatResponse(false, null, "Failed to create consumer", 500);
  }
});
