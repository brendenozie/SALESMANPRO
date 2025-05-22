import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = "1",
      limit = "25",
      search,
      brand,
      category,
      subCategory,
      minPrice,
      maxPrice,
      sort,
      availability,
    } = req.query;

    const currentPage = parseInt(page as string, 10) || 1;
    const itemsPerPage = parseInt(limit as string, 10) || 25;
    const skip = (currentPage - 1) * itemsPerPage;

    const { searchParams } = new URL(req.url);
  
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
  
    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return NextResponse.json(
        { message: "Invalid pagination parameters." },
        { status: 400 }
      );
    }
  

    // Build the root-level where clause
    const whereClause: Prisma.MarketplaceListingWhereInput = {
      // Full-text search on title
      title: search
        ? { contains: search as string, mode: "insensitive" }
        : undefined,

      // Price range filter
      sellingPrice: {
        gte:
          minPrice && !isNaN(Number(minPrice))
            ? parseFloat(minPrice as string)
            : undefined,
        lte:
          maxPrice && !isNaN(Number(maxPrice))
            ? parseFloat(maxPrice as string)
            : undefined,
      },

      // Availability toggle
      isAvailable:
        availability === "true"
          ? true
          : availability === "false"
          ? false
          : undefined,

      // Simple scalar filters
      brand: brand
        ? { in: Array.isArray(brand) ? brand : [brand] }
        : undefined,
      category: category
        ? { in: Array.isArray(category) ? category : [category] }
        : undefined,

        
      // JSON filter on subCategory.name
      // subCategoryName: subCategory
      //   ? { in: Array.isArray(subCategory) ? subCategory : [subCategory] }
      //   : undefined,
      // ...(subCategory
      //   ? {
      //       subCategory: {
      //         path: ["name"],
      //         equals: Array.isArray(subCategory)
      //           ? undefined
      //           : (subCategory as string),
      //         array_contains: Array.isArray(subCategory)
      //           ? subCategory
      //           : undefined,
      //       },
      //     }
      //   : {}),
    };

    // (Optional) Sorting
    const orderBy = sort
      ? { [sort as string]: sort === "asc" || sort === "desc" ? sort : "asc" }
      : undefined;

    // Fetch
    const [products, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where: whereClause,
        skip,
        take: itemsPerPage,
        orderBy: orderBy ? [orderBy] : undefined,
      }),
      prisma.marketplaceListing.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      products,
      totalPages: Math.ceil(total / itemsPerPage),
      currentPage,
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" });
  }
}
