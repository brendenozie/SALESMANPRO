import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/[adminSlug]/promotions/[promotionId]/route.ts
import { NextResponse } from "next/server";
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
  return String(value);
};

// PUT /api/admin/[adminSlug]/promotions/[promotionId]
export const PUT = withApiHandler(async (request, { params }) => {
  const { adminSlug, promotionId } = params;

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

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, "Company not found.", 404);
  }

  const existingPromotion = await prisma.promotion.findUnique({
    where: { id: promotionId },
    select: { companyId: true, code: true },
  });

  if (!existingPromotion || existingPromotion.companyId !== company.id) {
    return formatResponse(
      false,
      null,
      "Promotion not found or does not belong to this company.",
      404
    );
  }

  // Check for code conflict if updated
  if (code && code !== existingPromotion.code) {
    const conflictPromo = await prisma.promotion.findFirst({
      where: { code },
    });
    if (conflictPromo) {
      return formatResponse(
        false,
        null,
        "Another promotion with this code already exists.",
        409
      );
    }
  }

  const updatedPromotion = await prisma.promotionDiscount.update({
    where: { id: promotionId },
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
    },
  });

  const formattedUpdatedPromotion = {
    id: updatedPromotion.id,
    name: updatedPromotion.name,
    code: updatedPromotion.code,
    discount: formatDiscount(
      updatedPromotion.discountValue,
      updatedPromotion.discountType
    ),
    discountValue: updatedPromotion.discountValue,
    discountType: updatedPromotion.discountType,
    startDate: updatedPromotion.startDate.toISOString().split("T")[0],
    endDate: updatedPromotion.endDate.toISOString().split("T")[0],
    status: updatedPromotion.status,
    description: updatedPromotion.description || "",
    imageUrl: updatedPromotion.imageUrl || "",
  };

  
    try { await cacheDel(`admin:promotion-discount:${existingPromotion.companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, formattedUpdatedPromotion, "Promotion updated.");
});

// DELETE /api/admin/[adminSlug]/promotions/[promotionId]
export const DELETE = withApiHandler(async (_request, { params }) => {
  const { adminSlug, promotionId } = params;

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, "Company not found.", 404);
  }

  const promoToDelete = await prisma.promotion.findUnique({
    where: { id: promotionId },
    select: { companyId: true },
  });

  if (!promoToDelete || promoToDelete.companyId !== company.id) {
    return formatResponse(
      false,
      null,
      "Promotion not found or does not belong to this company.",
      404
    );
  }

  await prisma.promotion.delete({
    where: { id: promotionId },
  });

  
    try { await cacheDel(`admin:promotion-discount:${promoToDelete.companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Promotion deleted successfully.");
});
