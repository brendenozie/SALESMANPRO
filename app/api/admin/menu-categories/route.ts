// app/api/product-categories/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust path if needed

// GET /api/product-categories
// Fetches all product categories, optionally filtered by companyId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const categories = await prisma.productCategory.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return NextResponse.json({ message: 'Failed to fetch product categories', error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/product-categories
// Creates a new product category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, image, sortOrder, visible, companyId } = body;

    // Basic validation
    if (!name || !slug || !companyId) {
      return NextResponse.json({ message: 'Missing required fields: name, slug, companyId' }, { status: 400 });
    }

    const newCategory = await prisma.productCategory.create({
      data: {
        name,
        slug,
        description: description || '',
        image: image || null,
        sortOrder: parseInt(sortOrder) || 0,
        visible: typeof visible === 'boolean' ? visible : true,
        company: { connect: { id: companyId } },
        // Add other required fields with default or provided values
        longDescription: '', // Default
        seoTitle: name,
        seoDescription: description || name,
        metaKeywords: [],
        createdBy: 'admin', // Placeholder, ideally link to actual user
        updatedBy: 'admin', // Placeholder
        status: 'ACTIVE', // Default status
        allBrands: [],
        tags: [],
        subcategories: {}, // Empty JSON object
        imageAlt: name,
        productCount: 0,
        isFeatured: false,
        showInHomepage: false,
        attributes: {},
        localization: {},
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating product category:', error);
    // Handle unique constraint violation for slug
    if ((error as any).code === 'P2002' && (error as any).meta?.target.includes('slug')) {
      return NextResponse.json({ message: 'A category with this slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create product category', error: (error as Error).message }, { status: 500 });
  }
}
