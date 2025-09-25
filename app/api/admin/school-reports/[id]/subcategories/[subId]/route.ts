import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Helper type for subcategories as they are stored in JSON
type SubcategoryJson = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
};

// PATCH /api/store-categories/[id]/subcategories/[subId]
// Updates an existing subcategory within a specific StoreCategory's 'items' JSON array.
export async function PATCH(request: Request, { params }: { params: { id: string; subId: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id, subId } = params; // StoreCategory ID and Subcategory ID

  try {
    const body = await request.json();
    const { name, slug, sortOrder, visible } = body;

    const storeCategory = await prisma.storeCategory.findUnique({
      where: { id },
    });

    if (!storeCategory) {
      return NextResponse.json({ message: "Parent store category not found" }, { status: 404 });
    }

    let currentItems: SubcategoryJson[] = (storeCategory.items as SubcategoryJson[] | null) || [];
    const subIndex = currentItems.findIndex(sub => sub.id === subId);

    if (subIndex === -1) {
      return NextResponse.json({ message: "Subcategory not found within this category" }, { status: 404 });
    }

    const updatedSubcategory = { ...currentItems[subIndex] };

    if (name !== undefined) updatedSubcategory.name = name;
    if (slug !== undefined) updatedSubcategory.slug = slug;
    if (sortOrder !== undefined) updatedSubcategory.sortOrder = sortOrder;
    if (visible !== undefined) updatedSubcategory.visible = visible;

    // Check for duplicate name if name is being updated
    if (name !== undefined && name.toLowerCase() !== currentItems[subIndex].name.toLowerCase()) {
      const isDuplicateName = currentItems.some((item, idx) => idx !== subIndex && item.name.toLowerCase() === name.toLowerCase());
      if (isDuplicateName) {
        return NextResponse.json({ message: "A subcategory with this name already exists in this category." }, { status: 409 });
      }
    }


    currentItems[subIndex] = updatedSubcategory;

    const updatedStoreCategory = await prisma.storeCategory.update({
      where: { id },
      data: {
        items: currentItems, // Update the entire JSON array
      },
    });

    return NextResponse.json(updatedSubcategory, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating subcategory ${subId} in store category ${id}:`, error);
    return NextResponse.json({ message: "Failed to update subcategory", error: error.message }, { status: 500 });
  }
}

// DELETE /api/store-categories/[id]/subcategories/[subId]
// Deletes a subcategory from a specific StoreCategory's 'items' JSON array.
export async function DELETE(request: Request, { params }: { params: { id: string; subId: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id, subId } = params; // StoreCategory ID and Subcategory ID

  try {
    const storeCategory = await prisma.storeCategory.findUnique({
      where: { id },
    });

    if (!storeCategory) {
      return NextResponse.json({ message: "Parent store category not found" }, { status: 404 });
    }

    let currentItems: SubcategoryJson[] = (storeCategory.items as SubcategoryJson[] | null) || [];
    const initialLength = currentItems.length;

    const updatedItems = currentItems.filter(sub => sub.id !== subId);

    if (updatedItems.length === initialLength) {
      return NextResponse.json({ message: "Subcategory not found within this category" }, { status: 404 });
    }

    // Re-assign sortOrder for remaining items if necessary (optional, but good practice for consistency)
    const reorderedItems = updatedItems.map((item, index) => ({ ...item, sortOrder: index }));

    const updatedStoreCategory = await prisma.storeCategory.update({
      where: { id },
      data: {
        items: reorderedItems, // Update the entire JSON array
      },
    });

    return NextResponse.json({ message: "Subcategory deleted successfully", deletedSubId: subId }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting subcategory ${subId} from store category ${id}:`, error);
    return NextResponse.json({ message: "Failed to delete subcategory", error: error.message }, { status: 500 });
  }
}
