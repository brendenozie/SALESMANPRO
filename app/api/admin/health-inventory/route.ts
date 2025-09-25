// app/api/admin/[adminSlug]/services/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const searchKeyword = searchParams.get("search");
  const categoryFilter = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const validSortBy = ["name", "sellingPrice", "createdAt"];
  if (!validSortBy.includes(sortBy)) {
    return NextResponse.json({ message: "Invalid sortBy parameter" }, { status: 400 });
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const whereClause: any = {
      companyId: company.id,
      // Filter for services (assuming services are marketplaceListings with specific characteristics)
      // You might have a dedicated 'isService' flag or filter by category like 'Medical Services'
      // For now, we'll assume all marketplaceListings are potential services if not filtered otherwise.
      status: "ACTIVE", // Only active services
    };

    if (categoryFilter && categoryFilter !== 'All') {
      whereClause.category = categoryFilter; // Assuming category is directly on marketplaceListings
    }

    if (searchKeyword) {
      whereClause.OR = [
        { name: { contains: searchKeyword, mode: 'insensitive' } },
        { description: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    const [services, totalItems] = await prisma.$transaction([
      prisma.marketplaceListings.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          sellingPrice: true,
          duration: true, // Assuming 'duration' field exists for services
          createdAt: true,
          status: true,
          category: true,
        },
      }),
      prisma.marketplaceListings.count({ where: whereClause }),
    ]);

    const formattedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.sellingPrice,
      duration: service.duration || 'N/A', // Assuming duration is a string field
      status: service.status,
      category: service.category || 'Uncategorized',
    }));

    return NextResponse.json({
      services: formattedServices,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug } = params;
  const body = await request.json();

  const { name, description, price, duration, categoryId, status = "ACTIVE", images = [] } = body;

  if (!name || !description || price === undefined || !categoryId) {
    return NextResponse.json({ message: "Missing required fields: name, description, price, categoryId" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Verify ProductCategory exists and belongs to the company
    const productCategory = await prisma.productCategory.findUnique({
      where: { id: categoryId, companyId: company.id },
      select: { id: true, name: true }
    });
    if (!productCategory) {
      return NextResponse.json({ message: "Service category not found or not associated with this company" }, { status: 404 });
    }

    // Create a new marketplaceListing for the service
    const newService = await prisma.marketplaceListings.create({
      data: {
        companyId: company.id,
        name,
        description,
        sellingPrice: parseFloat(price),
        buyingPrice: parseFloat(price), // Assuming buying price is same as selling for simplicity
        quantity: 1, // Services usually have a quantity of 1 per booking
        isAvailable: true, // New services are available by default
        productCategoryId: productCategory.id,
        category: productCategory.name, // Denormalize category name
        status,
        duration, // Assuming 'duration' field exists on marketplaceListings
        images: images, // Assuming images is an array of JSON objects or strings
        finalPrice: parseFloat(price),
        // Default values for other required marketplaceListings fields
        subCategory: {},
        tags: [],
        sellerType: "COMPANY",
      },
    });

    // Update productCount for the category
    await prisma.productCategory.update({
      where: { id: productCategory.id },
      data: { productCount: { increment: 1 } },
    });

    return NextResponse.json(
      { message: "Service created successfully", service: newService },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
