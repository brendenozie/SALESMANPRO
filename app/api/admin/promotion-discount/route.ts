// app/api/admin/[adminSlug]/promotions/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path

// Helper to format discount for frontend
const formatDiscount = (value, type) => {
  if (type === 'PERCENTAGE') {
    return `${value}% Off`;
  } else if (type === 'FIXED_AMOUNT') {
    return `$${value} Off`;
  }
  return String(value); // Fallback
};

// GET /api/admin/[adminSlug]/promotions
// Fetches all promotions for a specific company.
export async function GET(request: Request) {
    
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const promotions = await prisma.promotionDiscount.findMany({
      where: {
        companyId: company.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map Prisma Promotion model to a frontend-friendly interface
    const formattedPromotions = promotions.map(promo => ({
      id: promo.id,
      name: promo.name,
      code: promo.code,
      discount: formatDiscount(promo.discountValue, promo.discountType), // Formatted string
      discountValue: promo.discountValue, // Raw value for editing
      discountType: promo.discountType, // Type for editing
      startDate: promo.startDate.toISOString().split('T')[0], // YYYY-MM-DD
      endDate: promo.endDate.toISOString().split('T')[0], // YYYY-MM-DD
      status: promo.status,
      description: promo.description || '',
      imageUrl: promo.imageUrl || '',
    }));

    return NextResponse.json(formattedPromotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json({ message: 'Failed to fetch promotions', error: "error.message" }, { status: 500 });
  }
}

// POST /api/admin/[adminSlug]/promotions
// Creates a new promotion.
export async function POST(request: Request) {
  
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  try {
    const body = await request.json();
    const {
      name,
      code,
      discountValue, // Now a number
      discountType,  // Now an enum value
      startDate,
      endDate,
      status,
      description,
      imageUrl,
    } = body;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    // const companyId = company.id;

    // Basic validation
    if (!name || !code || discountValue === undefined || !discountType || !startDate || !endDate || !status) {
      return NextResponse.json({ message: 'Missing required fields for promotion creation.' }, { status: 400 });
    }

    // Check for unique code
    const existingPromo = await prisma.promotionDiscount.findUnique({
      where: { code: code },
    });
    if (existingPromo) {
      return NextResponse.json({ message: 'A promotion with this code already exists.' }, { status: 409 });
    }

    const newPromotion = await prisma.promotionDiscount.create({
      data: {
        name: name,
        code: code,
        discountValue: parseFloat(discountValue), // Ensure it's a float
        discountType: discountType, // Directly use enum value
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status, // Directly use enum value
        description: description || null,
        imageUrl: imageUrl || null,
        company: {
          connect: { id: companyId },
        },
      },
    });

    // Format the new promotion data for frontend display
    const formattedNewPromotion = {
      id: newPromotion.id,
      name: newPromotion.name,
      code: newPromotion.code,
      discount: formatDiscount(newPromotion.discountValue, newPromotion.discountType),
      discountValue: newPromotion.discountValue,
      discountType: newPromotion.discountType,
      startDate: newPromotion.startDate.toISOString().split('T')[0],
      endDate: newPromotion.endDate.toISOString().split('T')[0],
      status: newPromotion.status,
      description: newPromotion.description || '',
      imageUrl: newPromotion.imageUrl || '',
    };

    return NextResponse.json(formattedNewPromotion, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    // if (error.code === 'P2002') { // Unique constraint violation
    //   return NextResponse.json({ message: 'A promotion with this code already exists.', error: error.message }, { status: 409 });
    // }
    return NextResponse.json({ message: 'Failed to create promotion', error: "error.message" }, { status: 500 });
  }
}
