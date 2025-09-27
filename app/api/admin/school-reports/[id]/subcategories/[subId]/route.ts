// app/api/store-categories/[id]/subcategories/[subId]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Helper type for subcategories stored in JSON
type SubcategoryJson = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
};

// --- PATCH: Update a subcategory ---
async function updateSubcategory(req: NextRequest, { params }: { params: { id: string; subId: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id, subId } = params;

  try {
    const body = await req.json();
    const { name, slug, sortOrder, visible } = body;

    const storeCategory = await prisma.storeCategory.findUnique({ where: { id } });
    if (!storeCategory) return formatResponse(false, null, "Parent store category not found", 404);

    let currentItems: SubcategoryJson[] = (storeCategory.items as SubcategoryJson[] | null) || [];
    const subIndex = currentItems.findIndex(sub => sub.id === subId);
    if (subIndex === -1) return formatResponse(false, null, "Subcategory not found within this category", 404);

    const updatedSubcategory = { ...currentItems[subIndex] };
    if (name !== undefined) updatedSubcategory.name = name;
    if (slug !== undefined) updatedSubcategory.slug = slug;
    if (sortOrder !== undefined) updatedSubcategory.sortOrder = sortOrder;
    if (visible !== undefined) updatedSubcategory.visible = visible;

    // Check for duplicate name
    if (name !== undefined && name.toLowerCase() !== currentItems[subIndex].name.toLowerCase()) {
      const isDuplicate = currentItems.some((item, idx) => idx !== subIndex && item.name.toLowerCase() === name.toLowerCase());
      if (isDuplicate) return formatResponse(false, null, "A subcategory with this name already exists in this category.", 409);
    }

    currentItems[subIndex] = updatedSubcategory;

    await prisma.storeCategory.update({
      where: { id },
      data: { items: currentItems },
    });

    return formatResponse(true, updatedSubcategory, "Subcategory updated successfully", 200);
  } catch (error: any) {
    console.error(`Error updating subcategory ${subId} in store category ${id}:`, error);
    return formatResponse(false, null, "Failed to update subcategory", 500);
  }
}

// --- DELETE: Remove a subcategory ---
async function deleteSubcategory(req: NextRequest, { params }: { params: { id: string; subId: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id, subId } = params;

  try {
    const storeCategory = await prisma.storeCategory.findUnique({ where: { id } });
    if (!storeCategory) return formatResponse(false, null, "Parent store category not found", 404);

    let currentItems: SubcategoryJson[] = (storeCategory.items as SubcategoryJson[] | null) || [];
    const initialLength = currentItems.length;
    const updatedItems = currentItems.filter(sub => sub.id !== subId);

    if (updatedItems.length === initialLength) {
      return formatResponse(false, null, "Subcategory not found within this category", 404);
    }

    // Optional: reorder remaining items
    const reorderedItems = updatedItems.map((item, index) => ({ ...item, sortOrder: index }));

    await prisma.storeCategory.update({
      where: { id },
      data: { items: reorderedItems },
    });

    return formatResponse(true, { deletedSubId: subId }, "Subcategory deleted successfully", 200);
  } catch (error: any) {
    console.error(`Error deleting subcategory ${subId} from store category ${id}:`, error);
    return formatResponse(false, null, "Failed to delete subcategory", 500);
  }
}

// ✅ Export handlers wrapped with withApiHandler
export const PATCH = withApiHandler(updateSubcategory);
export const DELETE = withApiHandler(deleteSubcategory);
