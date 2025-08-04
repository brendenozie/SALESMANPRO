// pages/api/campaigns/[id].js
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; 


// =======================================================================
// GET a single product by ID
// Endpoint: /api/products/[id]
// =======================================================================
export async function GET_BY_ID(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Failed to fetch product', error: (error as Error).message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

// =======================================================================
// PUT/PATCH update a product by ID
// Endpoint: /api/products/[id]
// =======================================================================
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...body,
        // Handle dates separately if they exist in the body
        startDealDate: body.startDealDate ? new Date(body.startDealDate) : undefined,
        endDealDate: body.endDealDate ? new Date(body.endDealDate) : undefined,
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to update product', error: (error as Error).message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

// =======================================================================
// DELETE a product by ID
// Endpoint: /api/products/[id]
// =======================================================================
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 204 });
  } catch (error) {
    console.error('Error deleting product:', error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to delete product', error: (error as Error).message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

