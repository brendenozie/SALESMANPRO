import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { MarketplaceListingStatus } from "@prisma/client";

// Define the core logic for the GET handler
async function handleGetService(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
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
    return formatResponse(false, null, "Invalid sortBy parameter", 400);
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return formatResponse(false, null, "Invalid sortOrder parameter", 400);
  }

  // 1. Find Company
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  // 2. Build Where Clause
  const whereClause: any = {
    companyId: company.id,
    status: MarketplaceListingStatus.ACTIVE, // Only active services
  };

  if (categoryFilter && categoryFilter !== 'All') {
    whereClause.category = categoryFilter;
  }

  if (searchKeyword) {
    whereClause.OR = [
      { name: { contains: searchKeyword, mode: 'insensitive' } },
      { description: { contains: searchKeyword, mode: 'insensitive' } },
    ];
  }

  // 3. Fetch Data with Pagination
  const [services, totalItems] = await prisma.$transaction([
    prisma.marketplaceListings.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        sellingPrice: true,
        duration: true,
        createdAt: true,
        status: true,
        category: true,
      },
    }),
    prisma.marketplaceListings.count({ where: whereClause }),
  ]);

  // 4. Format Results
  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.sellingPrice,
    duration: service.duration || 'N/A',
    status: service.status,
    category: service.category || 'Uncategorized',
  }));

  // 5. Return Success Response
  return formatResponse(true, {
    services: formattedServices,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  }, "Services fetched successfully", 200);
}


// Define the core logic for the POST handler
async function handleCreateService(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const body = await request.json();

  const { name, description, price, duration, categoryId, status = "ACTIVE", images = [] } = body;

  if (!name || !description || price === undefined || !categoryId) {
    return formatResponse(false, null, "Missing required fields: name, description, price, categoryId", 400);
  }

  // 1. Find Company
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  // 2. Verify ProductCategory
  const productCategory = await prisma.productCategory.findUnique({
    where: { id: categoryId, companyId: company.id },
    select: { id: true, name: true }
  });
  if (!productCategory) {
    return formatResponse(false, null, "Service category not found or not associated with this company", 404);
  }

  // 3. Create new service (MarketplaceListing)
  const servicePrice = parseFloat(price);
  const newService = await prisma.marketplaceListings.create({
    data: {
      companyId: company.id,
      name,
      description,
      sellingPrice: servicePrice,
      buyingPrice: servicePrice,
      quantity: 1, // Services are bookable units
      isAvailable: true,
      productCategoryId: productCategory.id,
      category: productCategory.name,
      status: status as MarketplaceListingStatus,
      duration,
      images: images,
      finalPrice: servicePrice,
      // Default values for other required marketplaceListings fields
      subCategory: {},
      tags: [],
      sellerType: "COMPANY",
    },
  });

  // 4. Update productCount for the category
  await prisma.productCategory.update({
    where: { id: productCategory.id },
    data: { productCount: { increment: 1 } },
  });

  // 5. Return Success Response
  return formatResponse(true, { service: newService }, "Service created successfully", 201);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(handleGetService);
export const POST = withApiHandler(handleCreateService);
