import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for subcategories

// Helper type for subcategories as they are stored in JSON
type SubcategoryJson = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
};

// POST /api/store-categories/[id]/subcategories
// Adds a new subcategory to a specific StoreCategory's 'items' JSON array.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params; // StoreCategory ID

  try {
    const body = await request.json();
    const { name, slug, visible } = body; // sortOrder will be determined by current items length

    // Basic validation
    if (!name) {
      return NextResponse.json({ message: "Subcategory name is required." }, { status: 400 });
    }

    const storeCategory = await prisma.storeCategory.findUnique({
      where: { id },
    });

    if (!storeCategory) {
      return NextResponse.json({ message: "Parent store category not found" }, { status: 404 });
    }

    // Get current items, ensure it's an array
    const currentItems: SubcategoryJson[] = (storeCategory.items as SubcategoryJson[] | null) || [];

    // Generate a unique ID for the new subcategory
    const newSubId = uuidv4();
    const newSubcategory: SubcategoryJson = {
      id: newSubId,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'), // Generate slug if not provided
      sortOrder: currentItems.length, // Add to the end
      visible: visible !== undefined ? visible : true,
    };

    // Check for duplicate subcategory name within the current category
    const isDuplicateName = currentItems.some(item => item.name.toLowerCase() === name.toLowerCase());
    if (isDuplicateName) {
      return NextResponse.json({ message: "A subcategory with this name already exists in this category." }, { status: 409 });
    }

    const updatedItems = [...currentItems, newSubcategory];

    const updatedStoreCategory = await prisma.storeCategory.update({
      where: { id },
      data: {
        items: updatedItems, // Update the entire JSON array
      },
      include: {
        category: true, // Include related ProductCategory for full response
      },
    });

    // Return the newly added subcategory (or the updated parent category)
    return NextResponse.json(newSubcategory, { status: 201 }); // Return the new subcategory
  } catch (error: any) {
    console.error(`Error adding subcategory to store category ${id}:`, error);
    return NextResponse.json({ message: "Failed to add subcategory", error: error.message }, { status: 500 });
  }
}
