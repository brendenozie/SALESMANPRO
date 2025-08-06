// app/api/admin/[adminSlug]/promotions/[promotionId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path

// Helper to format discount for frontend (duplicate for self-containment)
const formatDiscount = (value, type) => {
  if (type === 'PERCENTAGE') {
    return `${value}% Off`;
  } else if (type === 'FIXED_AMOUNT') {
    return `$${value} Off`;
  }
  return String(value);
};

// PUT /api/admin/[adminSlug]/promotions/[promotionId]
// Updates an existing promotion.
export async function PUT(request, { params }) {
  const { adminSlug, promotionId } = params;

  try {
    const body = await request.json();
    const {
      name,
      code,
      discountValue,
      discountType,
      startDate,
      endDate,
      status,
      description,
      imageUrl,
    } = body;

    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      select: { companyId: true, code: true }, // Select code to check for uniqueness if updated
    });

    if (!existingPromotion || existingPromotion.companyId !== company.id) {
      return NextResponse.json({ message: 'Promotion not found or does not belong to this company.' }, { status: 404 });
    }

    // Check if the new code conflicts with another existing promotion (if code is changed)
    if (code && code !== existingPromotion.code) {
      const conflictPromo = await prisma.promotion.findUnique({
        where: { code: code },
      });
      if (conflictPromo) {
        return NextResponse.json({ message: 'Another promotion with this code already exists.' }, { status: 409 });
      }
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        name: name,
        code: code,
        discountValue: parseFloat(discountValue),
        discountType: discountType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status,
        description: description || null,
        imageUrl: imageUrl || null,
      },
    });

    // Format the updated promotion data for frontend display
    const formattedUpdatedPromotion = {
      id: updatedPromotion.id,
      name: updatedPromotion.name,
      code: updatedPromotion.code,
      discount: formatDiscount(updatedPromotion.discountValue, updatedPromotion.discountType),
      discountValue: updatedPromotion.discountValue,
      discountType: updatedPromotion.discountType,
      startDate: updatedPromotion.startDate.toISOString().split('T')[0],
      endDate: updatedPromotion.endDate.toISOString().split('T')[0],
      status: updatedPromotion.status,
      description: updatedPromotion.description || '',
      imageUrl: updatedPromotion.imageUrl || '',
    };

    return NextResponse.json(formattedUpdatedPromotion);
  } catch (error) {
    console.error(`Error updating promotion ${promotionId}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'Promotion not found.' }, { status: 404 });
    }
    if (error.code === 'P2002') { // Unique constraint violation (should be handled by explicit check above)
      return NextResponse.json({ message: 'A promotion with this code already exists.', error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to update promotion', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/[adminSlug]/promotions/[promotionId]
// Deletes a specific promotion.
export async function DELETE(request, { params }) {
  const { adminSlug, promotionId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const promoToDelete = await prisma.promotion.findUnique({
      where: { id: promotionId },
      select: { companyId: true },
    });

    if (!promoToDelete || promoToDelete.companyId !== company.id) {
      return NextResponse.json({ message: 'Promotion not found or does not belong to this company.' }, { status: 404 });
    }

    await prisma.promotion.delete({
      where: { id: promotionId },
    });

    return NextResponse.json({ message: 'Promotion deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting promotion ${promotionId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Promotion not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete promotion', error: error.message }, { status: 500 });
  }
}
