import prisma from "@/server/db/prismadb";
import { cacheDel } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET: Fetch single gallery with items
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const gallery = await prisma.gallery.findUnique({
      where: { id },
      include: { items: { orderBy: { order: "asc" } } },
    });

    if (!gallery) {
      return formatResponse(false, null, "Gallery not found", 404);
    }

    return formatResponse(true, gallery, "Gallery fetched successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error.message || "Failed to fetch gallery", 500);
  }
}

/**
 * PATCH / PUT: Update existing gallery details
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.gallery.findUnique({ where: { id } });
    if (!existing) {
      return formatResponse(false, null, "Gallery not found", 404);
    }

    const updatedGallery = await prisma.gallery.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.isFeatured !== undefined && { isFeatured: Boolean(body.isFeatured) }),
      },
      include: { items: true },
    });

    await cacheDel(`admin:galleries:${existing.companyId}`);

    return formatResponse(true, updatedGallery, "Gallery updated successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error.message || "Update failed", 500);
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}

/**
 * DELETE: Remove a gallery and its items
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existing = await prisma.gallery.findUnique({ where: { id } });

    if (!existing) {
      return formatResponse(false, null, "Gallery not found", 404);
    }

    // Delete gallery items first
    await prisma.galleryItem.deleteMany({
      where: { galleryId: id },
    });

    await prisma.gallery.delete({
      where: { id },
    });

    await cacheDel(`admin:galleries:${existing.companyId}`);

    return formatResponse(true, null, "Gallery deleted successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error.message || "Delete failed", 500);
  }
}
