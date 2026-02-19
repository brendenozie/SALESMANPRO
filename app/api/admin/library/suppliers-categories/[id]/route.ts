import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { formatResponse } from "@/lib/formatResponse";

const prisma = new PrismaClient();

// GET: Fetch all categories for a specific company
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

  const cacheKey = `admin:suppliers-categories:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const categories = await prisma.librarySupplierCategory.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });

  try {
    if (categories) {
      await cacheSet(cacheKey, categories, 60);
    }
  } catch (e) {}

    return formatResponse(true, categories, "Categories fetched", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch categories", 500);
  }
}

// POST: Create a new category
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, companyId } = body;

    if (!name || !companyId) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    const category = await prisma.librarySupplierCategory.create({
      data: { name, companyId },
    });

    
    try { await cacheDel(`admin:suppliers-categories:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, category, "Category created", 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return formatResponse(false, null, "Category name already exists", 409);
    }
    return formatResponse(false, null, "Failed to create category", 500);
  }
}

// PATCH: Update an existing category
export async function PATCH(
  req: Request,
  { params }: { params: { id: string[] } }
) {
  try {
    const categoryId = params.id?.[0];
    const body = await req.json();
    const { name } = body;

    if (!categoryId) return formatResponse(false, null, "ID required", 400);

    const updated = await prisma.librarySupplierCategory.update({
      where: { id: categoryId },
      data: { name },
    });

    try { await cacheDel(`admin:suppliers-categories:${updated.companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updated, "Category updated", 200);
  } catch (error) {
    return formatResponse(false, null, "Update failed", 500);
  }
}

// DELETE: Remove a category
export async function DELETE(
  req: Request,
  { params }: { params: { id: string[] } }
) {
  try {
    const categoryId = params.id?.[0];

    if (!categoryId) return formatResponse(false, null, "ID required", 400);

    await prisma.librarySupplierCategory.delete({
      where: { id: categoryId },
    });

    try { await cacheDel(`admin:suppliers-categories:${categoryId}`); } catch (e) {}
    return formatResponse(true, null, "Category deleted", 200);
  } catch (error) {
    return formatResponse(false, null, "Delete failed", 500);
  }
}