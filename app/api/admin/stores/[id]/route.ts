// app/api/admin/[adminSlug]/staff/[id]/route.ts
import prisma from "@/server/db/prismadb";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET a single store with category tree and counts
async function getStore(req: Request, { params }: { params: { id: string } }) {
  
  try {
    const storeId = params.id;

    const store = await prisma.company.findUnique({
      where: { id: storeId },
      include: {
        productCategories: true,
        _count: {
          select: { marketplaceListings: true },
        },
      },
    });

    if (!store) {
      return formatResponse(false, null, "Store not found", 404);
    }

    return formatResponse(true, store, "Store fetched successfully");
  } catch (error: any) {
    console.error("Error fetching store:", error);
    return formatResponse(false, null, error.message || "Internal Server Error", 500);
  }
}

// Export wrapped handler
export const GET = withApiHandler(getStore);
