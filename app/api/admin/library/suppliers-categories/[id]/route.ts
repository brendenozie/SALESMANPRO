import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch all categories for a specific company
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    const categories = await prisma.librarySupplierCategory.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST: Create a new category
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, companyId } = body;

    if (!name || !companyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const category = await prisma.librarySupplierCategory.create({
      data: { name, companyId },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
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

    if (!categoryId) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updated = await prisma.librarySupplierCategory.update({
      where: { id: categoryId },
      data: { name },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE: Remove a category
export async function DELETE(
  req: Request,
  { params }: { params: { id: string[] } }
) {
  try {
    const categoryId = params.id?.[0];

    if (!categoryId) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.librarySupplierCategory.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}