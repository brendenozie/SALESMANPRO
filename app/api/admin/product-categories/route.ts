import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Category slug is required"),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  metaKeywords: z.array(z.string()).optional().default([]),
  sortOrder: z.coerce.number().int().default(0),
  visible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  showInHomepage: z.boolean().default(false),
});

// GET: List all categories for an authorized company
export const GET = withApiHandler(
  async (request: Request, context: any) => {
    const companyId = context.companyId;

    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const cacheKey = buildTenantCacheKey(companyId, "product-categories", {});

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const categories = await prisma.productCategory.findMany({
      where: { companyId },
      orderBy: { sortOrder: "asc" },
    });

    try {
      if (categories) {
        await cacheSet(cacheKey, categories, 60);
      }
    } catch (e) {}

    return formatResponse(true, categories, "Categories fetched successfully", 200);
  },
  { requireAuth: true, requireTenant: true },
);

// POST: Create a new product category
export const POST = withApiHandler(
  async (request: Request, context: any) => {
    const body = await request.json().catch(() => null);
    if (!body) {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return formatResponse(false, null, parsed.error.errors, 400);
    }

    const companyId = context.companyId;
    if (!companyId) {
      return formatResponse(
        false,
        null,
        "Authorized company context required",
        403,
      );
    }

    const {
      name,
      slug,
      icon,
      image,
      description,
      longDescription,
      seoTitle,
      seoDescription,
      metaKeywords,
      sortOrder,
      visible,
      isFeatured,
      showInHomepage,
    } = parsed.data;

    // Check slug uniqueness within company
    const existingSlug = await prisma.productCategory.findFirst({
      where: { slug, companyId },
      select: { id: true },
    });

    if (existingSlug) {
      return formatResponse(
        false,
        null,
        "Category with this slug already exists for your company",
        409,
      );
    }

    const category = await prisma.productCategory.create({
      data: {
        name,
        slug,
        icon: icon || null,
        image: image || null,
        description: description || null,
        longDescription: longDescription || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        metaKeywords: metaKeywords || [],
        sortOrder,
        visible,
        isFeatured,
        showInHomepage,
        companyId,
      },
    });

    try {
      await cacheDel(`tenant:${companyId}:product-categories:*`);
    } catch (e) {}

    return formatResponse(true, category, "Category created successfully", 201);
  },
  { requireAuth: true, requireTenant: true },
);
