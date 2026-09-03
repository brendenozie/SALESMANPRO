import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/[adminSlug]/promotions/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Helper to format discount for frontend
const formatDiscount = (value: number, type: string) => {
  if (type === "PERCENTAGE") {
    return `${value}% Off`;
  } else if (type === "FIXED_AMOUNT") {
    return `$${value} Off`;
  }
  return String(value); // Fallback
};

// GET /api/admin/[adminSlug]/promotions
export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  const cacheKey = buildTenantCacheKey(companyId, "promotion-discount", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, "Company not found for the given slug.", 404);
  }

  const promotions = await prisma.promotionDiscount.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
  });

  const formattedPromotions = promotions.map((promo) => ({
    id: promo.id,
    name: promo.name,
    code: promo.code,
    discount: formatDiscount(promo.discountValue, promo.discountType),
    discountValue: promo.discountValue,
    discountType: promo.discountType,
    startDate: promo.startDate.toISOString().split("T")[0],
    endDate: promo.endDate.toISOString().split("T")[0],
    status: promo.status,
    description: promo.description || "",
    imageUrl: promo.imageUrl || "",
  }));

  try {
    if (promotions) {
      await cacheSet(cacheKey, formattedPromotions, 60);
    }
  } catch (e) {}
  
  return formatResponse(true, formattedPromotions, "Promotions fetched successfully.");
});

// POST /api/admin/[adminSlug]/promotions
export const POST = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  const body = await request.json();
  const {
    name,
    code,
    discountValue,
    discountType,
    startDate,
    endDate,
    status,
    description,
    imageUrl,
  } = body;

  if (
    !name ||
    !code ||
    discountValue === undefined ||
    !discountType ||
    !startDate ||
    !endDate ||
    !status
  ) {
    return formatResponse(false, null, "Missing required fields for promotion creation.", 400);
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, "Company not found for the given slug.", 404);
  }

  const existingPromo = await prisma.promotionDiscount.findUnique({
    where: { code },
  });
  if (existingPromo) {
    return formatResponse(false, null, "A promotion with this code already exists.", 409);
  }

  const newPromotion = await prisma.promotionDiscount.create({
    data: {
      name,
      code,
      discountValue: parseFloat(discountValue),
      discountType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      description: description || null,
      imageUrl: imageUrl || null,
      company: { connect: { id: companyId } },
    },
  });

  const formattedNewPromotion = {
    id: newPromotion.id,
    name: newPromotion.name,
    code: newPromotion.code,
    discount: formatDiscount(newPromotion.discountValue, newPromotion.discountType),
    discountValue: newPromotion.discountValue,
    discountType: newPromotion.discountType,
    startDate: newPromotion.startDate.toISOString().split("T")[0],
    endDate: newPromotion.endDate.toISOString().split("T")[0],
    status: newPromotion.status,
    description: newPromotion.description || "",
    imageUrl: newPromotion.imageUrl || "",
  };

  
    try {
      await cacheDel(`tenant:${companyId}:promotion-discount:*`);
      await cacheDel(`admin:promotion-discount:*`);
    } catch (e) {}
    return formatResponse(true, formattedNewPromotion, "Promotion created successfully.", 201);
});
