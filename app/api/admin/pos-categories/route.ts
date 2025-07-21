import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for subcategories

// Helper type for subcategories as they are stored in JSON
type SubcategoryJson = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
};

// GET /api/store-categories
// Fetches all StoreCategory entries, optionally filtered by companyId.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const whereClause = companyId ? { companyId } : {};

    const storeCategories = await prisma.storeCategory.findMany({
      where: whereClause,
      include: {
        category: { // Include the linked ProductCategory details
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            image: true,
            description: true,
            // Add other fields from ProductCategory you might need
          },
        },
      },
      orderBy: {
        sortOrder: 'asc', // Order by the custom sortOrder
      },
    });

    // Transform the data to ensure 'items' is always an array and 'displayName' is present
    const response = storeCategories.map(sc => ({
      id: sc.id,
      companyId: sc.companyId,
      categoryId: sc.categoryId,
      displayName: sc.displayName || sc.category?.name || 'Unnamed Category', // Fallback to category name
      icon: sc.icon || sc.category?.icon || '📦', // Fallback to category icon
      sortOrder: sc.sortOrder,
      visible: sc.visible,
      items: (sc.items as SubcategoryJson[] | null) || [], // Ensure items is an array, cast from Json
      allBrands: sc.allBrands, // Keep allBrands as is
      // You can add more fields from sc.category here if needed on the client
      categoryName: sc.category?.name,
      categorySlug: sc.category?.slug,
    }));

    return NextResponse.json({ categories: response }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching store categories:", error);
    return NextResponse.json({ message: "Failed to fetch store categories", error: error.message }, { status: 500 });
  }
}
