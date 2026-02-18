import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/store-categories/[id]/subcategories/route.ts
import prisma from "@/server/db/prismadb";
import { v4 as uuidv4 } from "uuid"; // For unique IDs

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

// POST - Add a new subcategory
async function postSubcategory(req: Request, { params }: { params: { id: string } }) {
  
  const { id } = params;

  try {
    const body = await req.json();
    const { name, slug, visible } = body;

    if (!name) return formatResponse(false, null, "Subcategory name is required.", 400);

    const storeCategory = await prisma.storeCategory.findUnique({ where: { id } });
    if (!storeCategory) return formatResponse(false, null, "Parent store category not found", 404);

    const currentItems: SubcategoryJson[] = (storeCategory.subcategories as SubcategoryJson[] | null) || [];

    // Check for duplicate name
    const isDuplicate = currentItems.some(item => item.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) return formatResponse(false, null, "A subcategory with this name already exists in this category.", 409);

    const newSubcategory: SubcategoryJson = {
      id: uuidv4(),
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      sortOrder: currentItems.length,
      visible: visible !== undefined ? visible : true,
    };

    const updatedItems = [...currentItems, newSubcategory];

    await prisma.storeCategory.update({
      where: { id },
      data: { subcategories: updatedItems },
    });

    
    try { await cacheDel(`admin:subcategories:${slug || adminSlug || 'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newSubcategory, "Subcategory added successfully", 201);
  } catch (err: any) {
    console.error(`Error adding subcategory to store category ${id}:`, err);
    return formatResponse(false, null, err.message || "Failed to add subcategory", 500);
  }
}

// Export wrapped handler
export const POST = withApiHandler(postSubcategory);
