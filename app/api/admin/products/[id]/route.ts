// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust path if needed

// PUT /api/products/:id
// Updates a specific product (dish)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      name,
      description,
      images,
      productCategoryId,
      costPrice,
      sellingPrice,
      discount,
      isAvailable,
      isOnOffer,
      isFlashDeal,
      isNewArrival,
      isDiscounted,
      isFeatured,
      ingredients,
    } = body;

    let finalPrice;
    if (sellingPrice !== undefined && discount !== undefined) {
      finalPrice = sellingPrice * (1 - discount / 100);
    } else if (sellingPrice !== undefined) {
      // If only salesPrice is updated, calculate finalPrice based on existing discount
      const existingProduct = await prisma.product.findUnique({ where: { id }, select: { discount: true } });
      finalPrice = sellingPrice * (1 - (existingProduct?.discount || 0) / 100);
    } else if (discount !== undefined) {
      // If only discount is updated, calculate finalPrice based on existing salesPrice
      const existingProduct = await prisma.product.findUnique({ where: { id }, select: { sellingPrice: true } });
      finalPrice = (existingProduct?.sellingPrice || 0) * (1 - discount / 100);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        images: images || undefined,
        productCategory: productCategoryId ? { connect: { id: productCategoryId } } : undefined,
        costPrice: costPrice !== undefined ? costPrice : undefined,
        sellingPrice: sellingPrice !== undefined ? sellingPrice : undefined,
        finalPrice: finalPrice !== undefined ? finalPrice : undefined,
        discount: discount !== undefined ? discount : undefined,
        isAvailable: typeof isAvailable === 'boolean' ? isAvailable : undefined,
        isOnOffer: typeof isOnOffer === 'boolean' ? isOnOffer : undefined,
        isFlashDeal: typeof isFlashDeal === 'boolean' ? isFlashDeal : undefined,
        isNewArrival: typeof isNewArrival === 'boolean' ? isNewArrival : undefined,
        isDiscounted: typeof isDiscounted === 'boolean' ? isDiscounted : (discount > 0),
        isFeatured: typeof isFeatured === 'boolean' ? isFeatured : undefined,
        ingredients: ingredients || undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error(`Error updating product with ID ${params.id}:`, error);
    if ((error as any).code === 'P2025') { // Not Found
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update product', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/products/:id
// Deletes a specific product (dish)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting product with ID ${params.id}:`, error);
    if ((error as any).code === 'P2025') { // Not Found
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete product', error: (error as Error).message }, { status: 500 });
  }
}
