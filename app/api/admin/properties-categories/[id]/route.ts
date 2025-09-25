// app/api/categories/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path if necessary
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// GET /api/categories/:id
// Fetches a single category by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { id } = params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { properties: true },
        },
        parentCategory: {
          select: { id: true, name: true }
        }
      },
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const formattedCategory = {
      ...category,
      propertyCount: category._count.properties,
      _count: undefined,
    };

    return NextResponse.json(formattedCategory);
  } catch (error: any) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ message: 'Failed to fetch category', error: error.message }, { status: 500 });
  }
}

// PUT /api/categories/:id
// Updates an existing category
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { id } = params;
    const body = await request.json();
    const { name, description, parentCategoryId } = body;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        parentCategoryId,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Category not found for update' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Category with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to update category', error: error.message }, { status: 500 });
  }
}

// DELETE /api/categories/:id
// Deletes a category
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { id } = params;

    // Optional: Check if category has associated properties before deleting
    const propertiesCount = await prisma.property.count({
      where: { categoryId: id },
    });

    if (propertiesCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete category. It is associated with ${propertiesCount} properties.` },
        { status: 409 } // Conflict
      );
    }

    await prisma.category.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Category not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete category', error: error.message }, { status: 500 });
  }
}