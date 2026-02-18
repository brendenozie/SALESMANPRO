import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from '@/server/db/prismadb'; // Assuming this is your standard Prisma client import
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { Prisma } from '@prisma/client';

// Define the expected structure for route parameters (empty for a collection route)
type RouteParams = { params: {} };

// --- GET Handler Core Logic ---

async function handleGetPackages(request: Request, { params }: RouteParams) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return formatResponse(false, null, 'The companyId query parameter is required to fetch packages.', 400);
  }

  
    const cacheKey = `admin:packages:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const packages = await prisma.package.findMany({
    where: { companyId },
    orderBy: {
      createdAt: 'desc'
    }
  });

  try {
    if (packages) {
      await cacheSet(cacheKey, packages, 60);
    }
  } catch (e) {}

  // withApiHandler handles wrapping this result in a success formatResponse with status 200
  return formatResponse(true, { packages }, "Packages fetched successfully", 200);
}

// --- POST Handler Core Logic ---

async function handlePostPackage(request: Request, { params }: RouteParams) {
  const body = await request.json();

  const { title, price, frequency, features, status, isFeatured, companyId } = body;

  if (!companyId || !title || price === undefined) {
    return formatResponse(false, null, 'Missing required fields: companyId, title, and price.', 400);
  }

  try {
    const newPackage = await prisma.package.create({
      data: {
        title,
        price,
        frequency,
        features,
        status,
        isFeatured,
        companyId,
      },
    });

    // Explicitly return success with status 201 (Created)
    
    try { await cacheDel(`admin:packages:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newPackage, null, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        // Foreign key constraint failure (e.g., invalid companyId)
        return formatResponse(false, null, 'Invalid companyId provided.', 404);
    }
    // Throw other errors for withApiHandler to catch as 500
    throw error;
  }
}

// Wrap the core logic with the API handler middleware.
export const GET = withApiHandler(handleGetPackages);
export const POST = withApiHandler(handlePostPackage);
