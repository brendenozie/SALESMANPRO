

import prisma from '@/server/db/prismadb'; // Assuming this is your standard Prisma client import
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { Prisma } from '@prisma/client';

// Define the expected structure for route parameters
type RouteParams = { params: { id: string } };

// --- GET Handler Core Logic ---
/**
 * Fetches a single package by ID.
 */
async function handleGetPackage(request: Request, { params }: RouteParams) {
  const { id } = params;

  const pkg = await prisma.package.findUnique({
    where: { id: id },
  });

  if (!pkg) {
    return formatResponse(false, null, 'Package not found.', 404);
  }

  // withApiHandler handles wrapping this result in a success formatResponse with status 200
  return formatResponse(true, pkg, "Package fetched successfully", 200);
}

// --- PUT Handler Core Logic ---
/**
 * Updates a package by ID.
 */
async function handlePutPackage(request: Request, { params }: RouteParams) {
  const { id } = params;
  const body = await request.json();
  const { title, price, frequency, features, status, isFeatured } = body;

  try {
    const updatedPackage = await prisma.package.update({
      where: { id: id },
      data: {
        title,
        price,
        frequency,
        features,
        status,
        isFeatured,
        updatedAt: new Date(), // Manually update timestamp if schema supports it
      },
    });

    // Explicitly return success with status 200
    return formatResponse(true, updatedPackage, null, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Record not found error
      return formatResponse(false, null, 'Package not found.', 404);
    }
    // Throw other errors for withApiHandler to catch as 500
    throw error;
  }
}

// --- DELETE Handler Core Logic ---
/**
 * Deletes a package by ID.
 */
async function handleDeletePackage(request: Request, { params }: RouteParams) {
  const { id } = params;

  try {
    await prisma.package.delete({
      where: { id: id },
    });

    // Explicitly return success with status 200 (No Content)
    return formatResponse(true, { message: 'Package deleted successfully' }, null, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Record not found error
      return formatResponse(false, null, 'Package not found.', 404);
    }
    // Throw other errors for withApiHandler to catch as 500
    throw error;
  }
}

// Wrap the core logic with the API handler middleware, which handles auth, try/catch, and response formatting.
export const GET = withApiHandler(handleGetPackage);
export const PUT = withApiHandler(handlePutPackage);
export const DELETE = withApiHandler(handleDeletePackage);
