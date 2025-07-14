// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path if necessary

// GET /api/categories
// Fetches all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { properties: true }, // Count associated properties
        },
        parentCategory: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Flatten the _count for easier consumption
    const formattedCategories = categories.map(cat => ({
      ...cat,
      propertyCount: cat._count.properties,
      _count: undefined, // Remove the raw _count object
    }));

    return NextResponse.json(formattedCategories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Failed to fetch categories', error: error.message }, { status: 500 });
  }
}

// POST /api/categories
// Creates a new category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, parentCategoryId } = body;

    if (!name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
        parentCategoryId,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') { // Unique constraint violation
      return NextResponse.json({ message: 'Category with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create category', error: error.message }, { status: 500 });
  }
}