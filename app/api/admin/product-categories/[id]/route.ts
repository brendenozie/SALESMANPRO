import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// GET a single category by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.productCategory.findUnique({
      where: { id: params.id }
    });

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching category", error }, { status: 500 });
  }
}

// PUT: Update category by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const { id, ...rest }  = data;
    const category = await prisma.productCategory.update({
      where: { id: params.id },
      data:rest,
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: "Error updating category", error }, { status: 500 });
  }
}

// DELETE: Remove category by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await prisma.productCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Category deleted", deleted });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting category", error }, { status: 500 });
  }
}
