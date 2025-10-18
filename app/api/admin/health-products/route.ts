import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET Handler: Fetches a filtered list of active products available for POS use.
 */
async function getPosProducts(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const categoryFilter = searchParams.get("category");
  const searchKeyword = searchParams.get("search");

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
    // Only show listings that are active and marked as available
    status: "ACTIVE",
    isAvailable: true,
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

  // 3. Fetch Products
  const products = await prisma.marketplaceListings.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      sellingPrice: true,
      category: true,
      quantity: true, // Used as current stock quantity
    },
    orderBy: { name: 'asc' },
  });

  // 4. Format Products
  const formattedProducts = products.map((product: any & { id: string, name: string, sellingPrice: number, quantity: number | null }) => ({
    id: product.id,
    name: product.name,
    price: product.sellingPrice,
    category: product.category || 'Uncategorized',
    stock: product.quantity || 0, // Ensure stock defaults to 0 if null
  }));

  return formatResponse(true, formattedProducts, "POS products fetched successfully", 200);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(getPosProducts);
