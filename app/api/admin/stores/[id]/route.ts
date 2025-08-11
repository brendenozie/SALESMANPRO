// app/api/admin/[adminSlug]/staff/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed


// GET a single store with category tree and counts
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = params.id;

    const store = await prisma.company.findUnique({
      where: { id: storeId },
      include: {
        productCategories: {
          include: {
            subcategories: {
              include: {
                brands: {
                  include: {
                    _count: {
                      select: { products: true },
                    },
                  },
                },
                _count: {
                  select: { products: true, brands: true },
                },
                products: {
                  take: 5, // Only fetch a preview list to save payload size
                },
              },
            },
            // _count: {
            //   select: { subcategories: true },
            // },
          },
        },
        _count: {
          select: { marketplaceListings: true },
        },
        products: {
          take: 5, // Store's own products preview
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
