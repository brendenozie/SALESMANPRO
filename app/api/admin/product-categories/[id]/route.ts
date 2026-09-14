import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  metaKeywords: z.array(z.string()).optional(),
  sortOrder: z.coerce.number().int().optional(),
  visible: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  showInHomepage: z.boolean().optional(),
});

// GET: Get single category scoped to company
export const GET = withApiHandler(
  async (_req, context: any) => {
    const companyId = context.companyId;
    const { id } = context.params;

    if (!id) {
      return formatResponse(false, null, "Category ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const category = await prisma.productCategory.findFirst({
      where: { id, companyId },
    });

    if (!category) {
      return formatResponse(false, null, "Category not found in this company", 404);
    }

    return formatResponse(true, category, "Category fetched successfully", 200);
  },
  { requireAuth: true, requireTenant: true },
);

// PUT: Update single category with IDOR verification
export const PUT = withApiHandler(
  async (req, context: any) => {
    const companyId = context.companyId;
    const { id } = context.params;

    if (!id) {
      return formatResponse(false, null, "Category ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return formatResponse(false, null, parsed.error.errors, 400);
    }

    // Verify category exists and belongs to company (IDOR protection)
    const existing = await prisma.productCategory.findFirst({
      where: { id, companyId },
      select: { id: true, slug: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Category not found in this company", 404);
    }

    // If slug is being changed, ensure uniqueness
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugConflict = await prisma.productCategory.findFirst({
        where: { slug: parsed.data.slug, companyId, id: { not: id } },
        select: { id: true },
      });
      if (slugConflict) {
        return formatResponse(
          false,
          null,
          "Category with this slug already exists for your company",
          409,
        );
      }
    }

    const category = await prisma.productCategory.update({
      where: { id },
      data: parsed.data,
    });

    try {
      await cacheDel(`tenant:${companyId}:product-categories:*`);
    } catch (e) {}

    return formatResponse(true, category, "Category updated successfully", 200);
  },
  { requireAuth: true, requireTenant: true },
);

// DELETE: Delete single category with IDOR verification
export const DELETE = withApiHandler(
  async (_req, context: any) => {
    const companyId = context.companyId;
    const { id } = context.params;

    if (!id) {
      return formatResponse(false, null, "Category ID is required", 400);
    }
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    // Verify category belongs to company before delete
    const existing = await prisma.productCategory.findFirst({
      where: { id, companyId },
      select: { id: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Category not found in this company", 404);
    }

    const deleted = await prisma.productCategory.delete({
      where: { id },
    });

    try {
      await cacheDel(`tenant:${companyId}:product-categories:*`);
    } catch (e) {}

    return formatResponse(true, deleted, "Category deleted successfully", 200);
  },
  { requireAuth: true, requireTenant: true },
);
