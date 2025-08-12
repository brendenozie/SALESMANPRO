// app/api/admin/fees/route.ts
// import { NextResponse } from 'next/server';
// import prisma from "@/server/db/prismadb"; // Adjust path as needed


// app/api/admin/locations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth"; // Adjust path as per your project structure
// import { prisma } from "@/lib/prisma"; // Adjust path as per your project structure
// import { Prisma } from "@prisma/client"; // Import Prisma for types

import prisma from "@/server/db/prismadb";

// GET: Retrieve all Location records
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();

    // Authenticate the user (assuming only admins can manage global locations)
    // You might want to add a role check here: if (!session?.user?.isAdmin) { ... }
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const locations = await prisma.location.findMany({
      orderBy: {
        sortOrder: 'asc', // Order by sortOrder for consistent tree building
      },
      // You can include related data if needed, but for the tree view, basic fields are enough
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        latitude: true,
        longitude: true,
        seoTitle: true,
        seoDescription: true,
        metaKeywords: true,
        sortOrder: true,
        visible: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        status: true,
        parentId: true,
        localization: true,
        attributes: true,
      },
    });

    return NextResponse.json({ data: locations });

  } catch (error) {
    console.error("Error retrieving locations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new Location record
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    // Authenticate and authorize (e.g., check for admin role)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // if (!session.user.isAdmin) { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

    const {
      name,
      slug,
      description,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      seoTitle,
      seoDescription,
      metaKeywords,
      sortOrder,
      visible,
      parentId,
      localization,
      attributes,
      status,
    } = await req.json();

    // Basic validation
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    // Ensure slug is unique
    const existingLocation = await prisma.location.findUnique({
      where: { slug },
    });
    if (existingLocation) {
      return NextResponse.json({ error: "Location with this slug already exists" }, { status: 409 });
    }

    const newLocation = await prisma.location.create({
      data: {
        name,
        slug,
        description,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        latitude,
        longitude,
        seoTitle,
        seoDescription,
        metaKeywords: metaKeywords || [], // Ensure it's an array
        sortOrder: sortOrder ?? 0,
        visible: visible ?? true,
        createdBy: session.user.id, // Record who created it
        status: status ?? 'ACTIVE', // Default status
        parentId: parentId || null, // Connect to parent if provided
        localization: localization || null, // Store JSON
        attributes: attributes || null, // Store JSON
      },
    });

    return NextResponse.json(newLocation, { status: 201 });

  } catch (error: any) {
    console.error("Error creating location:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handles GET requests for all fee records
// app/api/locations/route.ts
// This file will handle:
// - POST /api/locations (Create new location)
// - GET /api/locations (Get all locations with filters/pagination)

/**
 * POST /api/locations
 * Creates a new Location record.
 * Expected body: { name, slug, description?, addressLine1?, ..., parentId?, localization?, attributes?, createdBy? }
 */
// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     // Basic validation: Ensure required fields are present
//     if (!body.name || !body.slug) {
//       return NextResponse.json({ message: 'Name and slug are required.' }, { status: 400 });
//     }

//     // Check if slug already exists to prevent duplicates
//     const existingLocation = await prisma.location.findUnique({
//       where: { slug: body.slug },
//     });

//     if (existingLocation) {
//       return NextResponse.json({ message: `Location with slug '${body.slug}' already exists.` }, { status: 409 });
//     }

//     const newLocation = await prisma.location.create({
//       data: {
//         name: body.name,
//         slug: body.slug,
//         description: body.description,
//         addressLine1: body.addressLine1,
//         addressLine2: body.addressLine2,
//         city: body.city,
//         state: body.state,
//         postalCode: body.postalCode,
//         country: body.country,
//         latitude: body.latitude,
//         longitude: body.longitude,
//         seoTitle: body.seoTitle,
//         seoDescription: body.seoDescription,
//         metaKeywords: body.metaKeywords || [], // Ensure it's an array
//         sortOrder: body.sortOrder ?? 0,
//         visible: body.visible ?? true,
//         status: body.status ?? 'active',
//         parentId: body.parentId, // Prisma will handle ObjectId conversion if valid
//         localization: body.localization,
//         attributes: body.attributes,
//         createdBy: body.createdBy, // In a real app, this would come from authenticated user
//       },
//     });

//     return NextResponse.json(newLocation, { status: 201 });
//   } catch (error) {
//     console.error('Error creating location:', error);
//     // More specific error handling can be added here (e.g., PrismaClientKnownRequestError)
//     return NextResponse.json({ message: 'Failed to create location.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
//   }
// }

/**
 * GET /api/locations
 * Retrieves a list of Location records with optional filtering, pagination, and sorting.
 * Query parameters: name, slug, city, country, parentId, visible, status, page, limit, sortBy, sortOrder
 */
// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);

//     // Pagination
//     const page = parseInt(searchParams.get('page') || '1', 10);
//     const limit = parseInt(searchParams.get('limit') || '10', 10);
//     const skip = (page - 1) * limit;

//     // Filtering
//     const where: any = {};
//     if (searchParams.has('name')) {
//       where.name = { contains: searchParams.get('name'), mode: 'insensitive' };
//     }
//     if (searchParams.has('slug')) {
//       where.slug = searchParams.get('slug');
//     }
//     if (searchParams.has('city')) {
//       where.city = { contains: searchParams.get('city'), mode: 'insensitive' };
//     }
//     if (searchParams.has('country')) {
//       where.country = { contains: searchParams.get('country'), mode: 'insensitive' };
//     }
//     if (searchParams.has('parentId')) {
//       where.parentId = searchParams.get('parentId');
//     } else if (searchParams.get('parentId') === 'null') { // To fetch top-level locations
//       where.parentId = null;
//     }
//     if (searchParams.has('visible')) {
//       where.visible = searchParams.get('visible') === 'true';
//     }
//     if (searchParams.has('status')) {
//       where.status = searchParams.get('status');
//     }

//     // Sorting
//     const sortBy = searchParams.get('sortBy') || 'createdAt';
//     const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';
//     const orderBy: any = { [sortBy]: sortOrder };

//     const [locations, totalItems] = await prisma.$transaction([
//       prisma.location.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy,
//         // Optionally include relations if needed for list view, e.g., parent or children count
//         // include: {
//         //   parent: { select: { id: true, name: true } },
//         //   _count: {
//         //     select: { children: true }
//         //   }
//         // }
//       }),
//       prisma.location.count({ where }),
//     ]);

//     const totalPages = Math.ceil(totalItems / limit);

//     return NextResponse.json({
//       data: locations,
//       pagination: {
//         totalItems,
//         totalPages,
//         currentPage: page,
//         itemsPerPage: limit,
//       },
//     }, { status: 200 });
//   } catch (error) {
//     // console.error('Error fetching locations:', error);
//     return NextResponse.json({ message: 'Failed to fetch locations.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
//   }
// }
