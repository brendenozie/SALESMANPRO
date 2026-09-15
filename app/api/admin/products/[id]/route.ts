import { cacheDel, buildTenantCacheKey } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { syncApprovedSharedFields } from "@/lib/marketplace/publicationService";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.any()).optional(),
  productCategoryId: z.string().optional(),
  costPrice: z.coerce.number().min(0).optional(),
  sellingPrice: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
  isAvailable: z.boolean().optional(),
  isOnOffer: z.boolean().optional(),
  isFlashDeal: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isDiscounted: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  ingredients: z.string().optional().nullable(),
});

// GET /api/admin/products/:id
export const GET = withApiHandler(
  async (_request: Request, context: any) => {
    const companyId = context.companyId;
    const { id } = context.params;

    if (!id) {
      return formatResponse(false, null, "Product ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const product = await prisma.product.findFirst({
      where: { id, companyId },
      include: {
        productCategory: { select: { id: true, name: true } },
      },
    });

    if (!product) {
      return formatResponse(false, null, "Product not found in this company", 404);
    }

    return formatResponse(true, product, "Product fetched successfully", 200);
  },
  { requireAuth: true, requireTenant: true },
);

// PUT /api/admin/products/:id
export const PUT = withApiHandler(
  async (request: Request, context: any) => {
    const companyId = context.companyId;
    const { id } = context.params;

    if (!id) {
      return formatResponse(false, null, "Product ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return formatResponse(false, null, parsed.error.errors, 400);
    }

    // Verify product exists and belongs to the authorized tenant (IDOR prevention)
    const existingProduct = await prisma.product.findFirst({
      where: { id, companyId },
      select: { id: true, sellingPrice: true, discount: true, costPrice: true },
    });

    if (!existingProduct) {
      return formatResponse(false, null, "Product not found in this company", 404);
    }

    const data = parsed.data;

    // Validate category if updating productCategoryId
    if (data.productCategoryId) {
      const category = await prisma.productCategory.findFirst({
        where: { id: data.productCategoryId, companyId },
        select: { id: true },
      });
      if (!category) {
        return formatResponse(
          false,
          null,
          "Target product category does not exist in this company",
          404,
        );
      }
    }

    const newSellingPrice = data.sellingPrice ?? existingProduct.sellingPrice ?? 0;
    const newDiscount = data.discount ?? existingProduct.discount ?? 0;
    const newCostPrice = data.costPrice ?? existingProduct.costPrice ?? 0;
    const finalPrice = newSellingPrice * (1 - newDiscount / 100);
    const profitMargin = newSellingPrice > 0 ? (newSellingPrice - newCostPrice) / newSellingPrice : 0;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name || undefined,
        description: data.description || undefined,
        images: data.images || undefined,
        productCategory: data.productCategoryId
          ? { connect: { id: data.productCategoryId } }
          : undefined,
        costPrice: data.costPrice !== undefined ? data.costPrice : undefined,
        sellingPrice: data.sellingPrice !== undefined ? data.sellingPrice : undefined,
        finalPrice,
        profitMargin,
        discount: data.discount !== undefined ? data.discount : undefined,
        isAvailable: data.isAvailable,
        isOnOffer: data.isOnOffer,
        isFlashDeal: data.isFlashDeal,
        isNewArrival: data.isNewArrival,
        isDiscounted: data.isDiscounted ?? newDiscount > 0,
        isFeatured: data.isFeatured,
        ingredients: data.ingredients || undefined,
        updatedAt: new Date(),
      },
    });

    // Synchronize approved shared technical specs and derived availability
    await syncApprovedSharedFields(id, Object.keys(data));

    try {
      await cacheDel(`tenant:${companyId}:products:*`);
      await cacheDel(`tenant:${companyId}:admin_products:*`);
    } catch (e) {}

    return formatResponse(true, updatedProduct, "Product updated successfully", 200);
  },
  { requireAuth: true, requireTenant: true },
);

// DELETE /api/admin/products/:id
export const DELETE = withApiHandler(
  async (_request: Request, context: any) => {
    const companyId = context.companyId;
    const { id } = context.params;

    if (!id) {
      return formatResponse(false, null, "Product ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    // Verify ownership before deletion (IDOR prevention)
    const existing = await prisma.product.findFirst({
      where: { id, companyId },
      select: { id: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Product not found in this company", 404);
    }

    // Clean up or deactivate consumer-facing marketplace listings
    await prisma.marketplaceListings.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({
      where: { id },
    });

    try {
      await cacheDel(`tenant:${companyId}:products:*`);
      await cacheDel(`tenant:${companyId}:admin_products:*`);
    } catch (e) {}

    return formatResponse(true, { deletedId: id }, "Product deleted successfully", 200);
  },
  { requireAuth: true, requireTenant: true },
);
