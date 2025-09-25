// app/api/product-categories/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust path if needed
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// PUT /api/product-categories/:id
// Updates a specific product category
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = params;
    const body = await request.json();
    const { name, slug, description, image, sortOrder, visible } = body;

    const updatedCategory = await prisma.productCategory.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description || undefined,
        image: image || undefined,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
        visible: typeof visible === 'boolean' ? visible : undefined,
        updatedAt: new Date(),
        updatedBy: 'admin', // Placeholder
      },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error(`Error updating product category with ID ${params.id}:`, error);
    if ((error as any).code === 'P2002' && (error as any).meta?.target.includes('slug')) {
      return NextResponse.json({ message: 'A category with this slug already exists.' }, { status: 409 });
    }
    if ((error as any).code === 'P2025') { // Not Found
      return NextResponse.json({ message: 'Product category not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update product category', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/product-categories/:id
// Deletes a specific product category
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = params;

    await prisma.productCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product category deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting product category with ID ${params.id}:`, error);
    if ((error as any).code === 'P2025') { // Not Found
      return NextResponse.json({ message: 'Product category not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete product category', error: (error as Error).message }, { status: 500 });
  }
}
