import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { Prisma } from '@prisma/client';

// Define the expected structure for route parameters
type RouteParams = { params: { id: string } };

// --- PUT Handler Core Logic ---

async function handlePutCategory(request: Request, { params }: RouteParams) {
  const { id } = params;
  const body = await request.json();
  const { name, slug, description, image, sortOrder, visible } = body;

  try {
    const updatedCategory = await prisma.productCategory.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description || undefined,
        image: image || undefined,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
        visible: typeof visible === 'boolean' ? visible : undefined,
        updatedAt: new Date(),
        updatedBy: 'admin', // Placeholder - ideally, use the authenticated user's ID
      },
    });

    // withApiHandler will wrap this result in a success formatResponse with status 200
    
    try { await cacheDel(`admin:menu-categories:${updatedCategory.slug || updatedCategory.id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedCategory, "Product category updated successfully", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002' && error.meta?.target) {
        // Unique constraint violation (e.g., slug conflict)
        return formatResponse(false, null, 'A category with this slug already exists.', 409);
      }
      if (error.code === 'P2025') {
        // Record not found
        return formatResponse(false, null, 'Product category not found.', 404);
      }
    }
    // Re-throw other errors to be handled by withApiHandler's general error catch
    throw error;
  }
}

// --- DELETE Handler Core Logic ---

async function handleDeleteCategory(request: Request, { params }: RouteParams) {
  const { id } = params;

  try {
    await prisma.productCategory.delete({
      where: { id },
    });

    // withApiHandler will wrap this result in a success formatResponse with status 200
    
    try { await cacheDel(`admin:menu-categories:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, 'Product category deleted successfully', 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Record not found
      return formatResponse(false, null, 'Product category not found.', 404);
    }
    // Re-throw other errors to be handled by withApiHandler
    throw error;
  }
}

// Export the wrapped handlers. withApiHandler handles auth and try/catch.
export const PUT = withApiHandler(handlePutCategory);
export const DELETE = withApiHandler(handleDeleteCategory);
