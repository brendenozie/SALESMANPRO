import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/tour-packages/route.ts
import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

import { formatResponse } from "@/lib/formatResponse";
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

// =======================================================================
// GET /api/tour-packages
// Fetch all tour packages with their destinations
// =======================================================================
async function handleGET(request: Request) {
  


  try {
    
    const cacheKey = buildTenantCacheKey('global', "travel-packages", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const tourPackages = await prisma.tourPackage.findMany({
      include: { destinations: true },
      orderBy: { createdAt: "desc" },
    });

  try {
    if (tourPackages) {
      await cacheSet(cacheKey, tourPackages, 60);
    }
  } catch (e) {}

    return formatResponse(true, tourPackages);
  } catch (error: any) {
    console.error("Error fetching tour packages:", error);
    return formatResponse(false, null, error.message || "Failed to fetch tour packages", 500);
  }
}

// =======================================================================
// POST /api/tour-packages
// Create a new tour package and associate it with destinations
// =======================================================================
async function handlePOST(request: Request) {
  


  try {
    const body = await request.json();
    const { name, description, longDescription, duration, price, status, imageUrl, images, destinationIds } = body;

    if (!name || !description || !duration || price === undefined || !imageUrl) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    const newTourPackage = await prisma.$transaction(async (tx) => {
      const newPackage = await tx.tourPackage.create({
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

      if (destinationIds?.length) {
        await tx.destination.updateMany({
          where: { id: { in: destinationIds } },
          data: { tourPackageId: newPackage.id },
        });
      }

      return newPackage;
    });

    try {
      if (newTourPackage) {
        await cacheSet(`admin:travel-packages:${'global' || 'global'}:${newTourPackage.id}`, newTourPackage, 60);
      }
    } catch (e) {
      console.error("Error caching new tour package:", e);
    }
    
    return formatResponse(true, newTourPackage, "Tour package created successfully");
  } catch (error: any) {
    console.error("Error creating tour package:", error);
    return formatResponse(false, null, error.message || "Failed to create tour package", 500);
  }
}

// Export handlers wrapped with withApiHandler
export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
