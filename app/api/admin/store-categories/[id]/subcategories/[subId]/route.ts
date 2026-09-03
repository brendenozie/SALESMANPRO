import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/store-categories/[id]/subcategories/[subId]/route.ts
import prisma from "@/server/db/prismadb";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Helper type for subcategories
type SubcategoryJson = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
};

// PATCH - Update a subcategory
async function patchSubcategory(req: Request, { params }: { params: { id: string; subId: string } }) {
  
  
  const { id, subId } = params;
  const body = await req.json();
  const { name, slug, sortOrder, visible } = body;

  try {
    const storeCategory = await prisma.storeCategory.findUnique({ where: { id } });
    if (!storeCategory) return formatResponse(false, null, "Parent store category not found", 404);

    let currentItems: SubcategoryJson[] = (storeCategory.subcategories as SubcategoryJson[] | null) || [];
    const subIndex = currentItems.findIndex(sub => sub.id === subId);
    if (subIndex === -1) return formatResponse(false, null, "Subcategory not found within this category", 404);

    const updatedSub = { ...currentItems[subIndex] };
    if (name !== undefined) updatedSub.name = name;
    if (slug !== undefined) updatedSub.slug = slug;
    if (sortOrder !== undefined) updatedSub.sortOrder = sortOrder;
    if (visible !== undefined) updatedSub.visible = visible;

    // Check duplicate name
    if (name !== undefined && name.toLowerCase() !== currentItems[subIndex].name.toLowerCase()) {
      const isDuplicate = currentItems.some((item, idx) => idx !== subIndex && item.name.toLowerCase() === name.toLowerCase());
      if (isDuplicate) return formatResponse(false, null, "A subcategory with this name already exists in this category", 409);
    }

    currentItems[subIndex] = updatedSub;
    await prisma.storeCategory.update({ where: { id }, data: { subcategories: currentItems } });

    
    try {
      await cacheDel(`tenant:${slug}:subcategories:*`);
      await cacheDel(`admin:subcategories:*`);
    } catch (e) {}
    return formatResponse(true, updatedSub, "Subcategory updated successfully", 200);
  } catch (err: any) {
    console.error(`Error updating subcategory ${subId} in store category ${id}:`, err);
    return formatResponse(false, null, err.message || "Failed to update subcategory", 500);
  }
}

// DELETE - Remove a subcategory
async function deleteSubcategory(req: Request, { params }: { params: { id: string; subId: string } }) {
  
  const { id, subId } = params;

  try {
    const storeCategory = await prisma.storeCategory.findUnique({ where: { id } });
    if (!storeCategory) return formatResponse(false, null, "Parent store category not found", 404);

    let currentItems: SubcategoryJson[] = (storeCategory.subcategories as SubcategoryJson[] | null) || [];
    const filteredItems = currentItems.filter(sub => sub.id !== subId);

    if (filteredItems.length === currentItems.length)
      return formatResponse(false, null, "Subcategory not found within this category", 404);

    // Optional: reorder sortOrder
    const reorderedItems = filteredItems.map((item, idx) => ({ ...item, sortOrder: idx }));
    await prisma.storeCategory.update({ where: { id }, data: { subcategories: reorderedItems } });

    
    try {
      await cacheDel(`tenant:${id}:subcategories:*`);
      await cacheDel(`admin:subcategories:*`);
    } catch (e) {}
    return formatResponse(true, { deletedSubId: subId }, "Subcategory deleted successfully", 200);
  } catch (err: any) {
    console.error(`Error deleting subcategory ${subId} from store category ${id}:`, err);
    return formatResponse(false, null, err.message || "Failed to delete subcategory", 500);
  }
}

// Export wrapped handlers
export const PATCH = withApiHandler(patchSubcategory);
export const DELETE = withApiHandler(deleteSubcategory);
