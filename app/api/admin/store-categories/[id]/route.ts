import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for subcategories
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

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
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
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

// POST /api/store-categories
// Creates a new StoreCategory entry.
export async function POST(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const body = await request.json();
    const { companyId, categoryId, displayName, icon, sortOrder, visible } = body;

    // Basic validation
    if (!companyId || !categoryId || !displayName) {
      return NextResponse.json({ message: "Company ID, Category ID, and Display Name are required." }, { status: 400 });
    }

    // Check if a StoreCategory already exists for this companyId and categoryId pair
    const existingStoreCategory = await prisma.storeCategory.findUnique({
      where: {
        companyId_categoryId: { // Use the @@unique compound index
          companyId: companyId,
          categoryId: categoryId,
        },
      },
    });

    if (existingStoreCategory) {
      return NextResponse.json({ message: "A store category for this company and product category already exists." }, { status: 409 });
    }

    const newStoreCategory = await prisma.storeCategory.create({
      data: {
        companyId,
        categoryId,
        displayName,
        icon,
        sortOrder: sortOrder !== undefined ? sortOrder : 0, // Default to 0 if not provided
        visible: visible !== undefined ? visible : true, // Default to true if not provided
        items: [], // Initialize with an empty array for subcategories
        allBrands: [], // Initialize with an empty array for brands
      },
      include: {
        category: { // Include the linked ProductCategory details for the response
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            image: true,
            description: true,
          },
        },
      },
    });

    // Transform the response to match client-side type
    const responseData = {
      id: newStoreCategory.id,
      companyId: newStoreCategory.companyId,
      categoryId: newStoreCategory.categoryId,
      displayName: newStoreCategory.displayName || newStoreCategory.category?.name || 'Unnamed Category',
      icon: newStoreCategory.icon || newStoreCategory.category?.icon || '📦',
      sortOrder: newStoreCategory.sortOrder,
      visible: newStoreCategory.visible,
      items: (newStoreCategory.items as SubcategoryJson[] | null) || [],
      allBrands: newStoreCategory.allBrands,
      categoryName: newStoreCategory.category?.name,
      categorySlug: newStoreCategory.category?.slug,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating store category:", error);
    // Handle unique constraint error for display name if it were unique
    if (error.code === 'P2002') { // Prisma unique constraint violation
      return NextResponse.json({ message: "A category with similar properties might already exist." }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create store category", error: error.message }, { status: 500 });
  }
}

// DELETE /api/store-categories/[id]
// Deletes a StoreCategory entry by ID.

export async function DELETE(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: "Store category ID is required." }, { status: 400 });
    }

    // Check if the store category exists
    const existingStoreCategory = await prisma.storeCategory.findUnique({
      where: { id },
    });

    if (!existingStoreCategory) {
      return NextResponse.json({ message: "Store category not found." }, { status: 404 });
    }

    // Delete the store category
    await prisma.storeCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Store category deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting store category:", error);
    return NextResponse.json({ message: "Failed to delete store category", error: error.message }, { status: 500 });
  }
}
