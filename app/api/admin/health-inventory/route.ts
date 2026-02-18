import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


async function getServices(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  // --- Parameter Parsing ---
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
  
    const cacheKey = `admin:health-inventory:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  try {
    if (company) {
      await cacheSet(cacheKey, company, 60);
    }
  } catch (e) {}

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  // 2. Build Where Clause
  const whereClause: any = {
    companyId: company.id,
    status: "ACTIVE", // Only fetch active services
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

  // 3. Fetch Data in Transaction
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
        duration: true,
        createdAt: true,
        status: true,
        category: true,
      },
    }),
    prisma.marketplaceListings.count({ where: whereClause }),
  ]);

  // 4. Format Response Data
  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.sellingPrice,
    duration: service.duration || 'N/A',
    status: service.status,
    category: service.category || 'Uncategorized',
  }));

  return formatResponse(true, {
    services: formattedServices,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  }, "Services list fetched successfully", 200);
}


async function createService(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const body = await request.json();

  const { name, description, price, duration, categoryId, status = "ACTIVE", images = [] } = body;

  // --- Input Validation ---
  if (!name || !description || price === undefined || !categoryId) {
    return formatResponse(
      false,
      null,
      "Missing required fields: name, description, price, categoryId",
      400
    );
  }

  // 1. Find Company
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  // 2. Verify ProductCategory Existence and Ownership
  const productCategory = await prisma.productCategory.findUnique({
    where: { id: categoryId, companyId: company.id },
    select: { id: true, name: true }
  });
  if (!productCategory) {
    return formatResponse(false, null, "Service category not found or not associated with this company", 404);
  }

  // 3. Create Service and Update Category Count in a Transaction
  const [newService] = await prisma.$transaction([
    // Create a new marketplaceListing
    prisma.marketplaceListings.create({
      data: {
        companyId: company.id,
        name,
        description,
        sellingPrice: parseFloat(price),
        buyingPrice: parseFloat(price),
        quantity: 1, // Services usually have a quantity of 1 per booking
        isAvailable: true,
        productCategoryId: productCategory.id,
        category: productCategory.name,
        status,
        duration,
        images: images,
        finalPrice: parseFloat(price),
        subCategory: {},
        tags: [],
        sellerType: "COMPANY",
      },
    }),

    // Update productCount for the category
    prisma.productCategory.update({
      where: { id: productCategory.id },
      data: { productCount: { increment: 1 } },
    }),
  ]);

  
    try { await cacheDel(`admin:health-inventory:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newService, "Service created successfully", 201);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(getServices);
export const POST = withApiHandler(createService);
