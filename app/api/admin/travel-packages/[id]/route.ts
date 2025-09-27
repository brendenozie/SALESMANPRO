// app/api/tour-packages/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Slugify function
const slugify = (text: string) =>
  text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

// GET /api/tour-packages/[id]
async function handleGET(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  if (!id) return formatResponse(false, null, "Tour package ID is required", 400);

  try {
    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id },
      include: { destination: true },
    });

    if (!tourPackage) return formatResponse(false, null, "Tour package not found", 404);

    const transformedPackage = {
      ...tourPackage,
      destination: tourPackage.destination?.name || "N/A",
    };

    return formatResponse(true, transformedPackage);
  } catch (error: any) {
    console.error("Error fetching tour package:", error);
    return formatResponse(false, null, error.message || "Failed to fetch tour package", 500);
  }
}

// PUT /api/tour-packages/[id]
async function handlePUT(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { pathname } = new URL(request.url);
  const id = pathname.split("/").pop();
  if (!id) return formatResponse(false, null, "Tour package ID is required", 400);

  try {
    const body = await request.json();
    const {
      name,
      description,
      longDescription,
      duration,
      price,
      status,
      imageUrl,
      images,
      destinationIds,
    } = body;

    const updatedPackage = await prisma.$transaction(async (tx) => {
      // Unlink current destinations
      await tx.destination.updateMany({
        where: { tourPackageId: id },
        data: { tourPackageId: null },
      });

      // Link new destinations
      if (destinationIds?.length) {
        await tx.destination.updateMany({
          where: { id: { in: destinationIds } },
          data: { tourPackageId: id },
        });
      }

      // Update tour package
      return tx.tourPackage.update({
        where: { id },
        data: {
          name,
          slug: slugify(name),
          description,
          longDescription,
          duration,
          price: parseFloat(price),
          status,
          imageUrl,
          images: images || [],
        },
      });
    });

    return formatResponse(true, updatedPackage, "Tour package updated successfully");
  } catch (error: any) {
    console.error("Error updating tour package:", error);
    return formatResponse(false, null, error.message || "Failed to update tour package", 500);
  }
}

// DELETE /api/tour-packages/[id]
async function handleDELETE(request: Request) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { pathname } = new URL(request.url);
  const id = pathname.split("/").pop();
  if (!id) return formatResponse(false, null, "Tour package ID is required", 400);

  try {
    await prisma.$transaction(async (tx) => {
      // Unlink destinations
      await tx.destination.updateMany({
        where: { tourPackageId: id },
        data: { tourPackageId: null },
      });
      // Delete tour package
      await tx.tourPackage.delete({ where: { id } });
    });

    return formatResponse(true, null, "Tour package deleted successfully");
  } catch (error: any) {
    console.error("Error deleting tour package:", error);
    return formatResponse(false, null, error.message || "Failed to delete tour package", 500);
  }
}

// Export API handlers
export const GET = withApiHandler(handleGET);
export const PUT = withApiHandler(handlePUT);
export const DELETE = withApiHandler(handleDELETE);
