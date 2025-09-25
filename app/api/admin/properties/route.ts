// app/api/properties/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust path if necessary
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// GET /api/properties
// Fetches all properties, with optional filtering
export async function GET(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const locationId = searchParams.get('locationId');
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status'); // e.g., 'AVAILABLE', 'SOLD'
    const type = searchParams.get('type');     // e.g., 'For Sale', 'For Rent'
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const searchTerm = searchParams.get('searchTerm'); // Search by title, address, description

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (locationId) {
      where.locationId = locationId;
    }
    if (agentId) {
      where.agentId = agentId;
    }
    if (status) {
      where.status = status; // Prisma will automatically map string to enum
    }
    if (type) {
      where.type = type;
    }
    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        category: true, // Include category details
        location: true, // Include location details
        agent: {
          select: { id: true, name: true, email: true } // Select specific agent fields
        },
      },
      orderBy: {
        createdAt: 'desc', // Order by most recent
      },
    });

    return NextResponse.json(properties);
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ message: 'Failed to fetch properties', error: error.message }, { status: 500 });
  }
}

// POST /api/properties
// Creates a new property
export async function POST(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const body = await request.json();
    const {
      title,
      description,
      price,
      currency,
      type,
      status,
      categoryId,
      locationId,
      agentId,
      bedrooms,
      bathrooms,
      areaSqFt,
      plotSizeAcres,
      yearBuilt,
      address,
      photos,
      features,
    } = body;

    // Basic validation
    if (!title || !price || !type || !status || !categoryId || !locationId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newProperty = await prisma.property.create({
      data: {
        title,
        description,
        price,
        currency,
        type,
        status,
        categoryId,
        locationId,
        agentId,
        bedrooms,
        bathrooms,
        areaSqFt,
        plotSizeAcres,
        yearBuilt,
        address,
        photos: photos || [],
        features: features || [],
      },
    });

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json({ message: 'Failed to create property', error: error.message }, { status: 500 });
  }
}