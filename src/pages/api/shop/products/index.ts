import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../server/db/prismadb";
import { Prisma } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {  
        page = "1",
        limit = "5",
        search,
        brand,
        category,
        subCategory,
        minPrice,
        maxPrice,
        sort,
        availability
    } = req.query;

    console.log('search', search);
    console.log('brand', brand);
    console.log('category', category);
    console.log('subCategory', subCategory);
    console.log('minPrice', minPrice);
    console.log('maxPrice', maxPrice);
    console.log('sort', sort);
    console.log('availability', availability);

    const currentPage = parseInt(page as string, 10) || 1;
    const itemsPerPage = parseInt(limit as string, 10) || 5;
    const skip = (currentPage - 1) * itemsPerPage;
    const take = itemsPerPage;

    const whereClause: Prisma.MarketplaceListingWhereInput = {
      title: search ? { contains: search as string, mode: 'insensitive' } : undefined,
      sellingPrice: {
        gte: minPrice && !isNaN(Number(minPrice)) ? parseInt(minPrice as string, 10) : undefined,
        lte: maxPrice && !isNaN(Number(maxPrice)) ? parseInt(maxPrice as string, 10) : undefined,
      },
      isAvailable: availability === "true" ? true : undefined,
        product: {
          AND: [
            brand ? { brand: { in: Array.isArray(brand) ? brand : [brand] } } : undefined,
            subCategory ? { subCategory: { in: Array.isArray(subCategory) ? subCategory : [subCategory] } } : undefined,
            category ? { category: { in: Array.isArray(category) ? category : [category] } } : undefined,
          ].filter(Boolean) as Prisma.ProductWhereInput[],
        },
    };

    console.log('whereClause', whereClause);

    // Fetch filtered products
    const products = await prisma.marketplaceListing.findMany({
      where: whereClause,
      skip,
      take,
      include: {
            product: true,
      },
    });

    // Get total filtered count for pagination
    const totalProducts = await prisma.marketplaceListing.count({
      where: whereClause,
    });

    res.status(200).json({
      products,
      totalPages: Math.ceil(totalProducts / itemsPerPage),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}
