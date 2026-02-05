

import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { Prisma } from '@prisma/client';

// Define the expected structure for route parameters (empty for a collection route)
type RouteParams = { params: {} };


// --- GET Handler Core Logic ---
/**
 * Fetches all product categories, optionally filtered by companyId.
 */
async function handleGetCategories(request: Request, { params }: RouteParams) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  const categories = await prisma.productCategory.findMany({
    // Only filter by companyId if it is provided
    where: companyId ? { companyId } : {},
    orderBy: { sortOrder: 'asc' },
  });

  // withApiHandler handles wrapping this result in a success formatResponse with status 200
  return formatResponse(true, categories , "Product categories fetched successfully", 200);
}

// --- POST Handler Core Logic ---
/**
 * Creates a new product category.
 */
async function handlePostCategory(request: Request, { params }: RouteParams) {
  const body = await request.json();
  const { name, slug, description, image, sortOrder, visible, companyId } = body;

  // Basic validation check
  if (!name || !slug || !companyId) {
    // Manually returning a 400 error using formatResponse before Prisma operation starts
    return formatResponse(false, null, 'Missing required fields: name, slug, companyId', 400);
  }

  try {
    const newCategory = await prisma.productCategory.create({
      data: {
        name,
        slug,
        description: description || '',
        image: image || null,
        sortOrder: parseInt(sortOrder) || 0,
        visible: typeof visible === 'boolean' ? visible : true,
        Company: { connect: { id: companyId } },

        // Default required fields based on inferred schema
        longDescription: '',
        seoTitle: name,
        seoDescription: description || name,
        metaKeywords: [],
        createdBy: 'admin',
        updatedBy: 'admin',
        status: 'ACTIVE',
        allBrands: [],
        tags: [],
        subcategories: {},
        imageAlt: name,
        productCount: 0,
        isFeatured: false,
        showInHomepage: false,
        attributes: {},
        localization: {},
      },
    });

    // Explicitly return success with status 201
    return formatResponse(true, newCategory, null, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violation for slug (P2002)
      if (error.code === 'P2002' && error.meta?.target) {
        return formatResponse(false, null, 'A category with this slug already exists.', 409);
      }
    }
    // Re-throw other errors to be handled by withApiHandler
    throw error;
  }
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(handleGetCategories);
export const POST = withApiHandler(handlePostCategory);
