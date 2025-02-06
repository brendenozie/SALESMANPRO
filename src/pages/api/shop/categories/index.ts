import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../server/db/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = 1, limit = 6 } = req.query;

    const currentPage = parseInt(page as string, 10) || 1;
    const itemsPerPage = parseInt(limit as string, 10) || 6;

    const skip = (currentPage - 1) * itemsPerPage;
    const take = itemsPerPage;

    // Fetch categories along with their embedded subcategories
    const categories = await prisma.productCategory.findMany({
      skip: skip,
      take: take,
    });

    const totalCategories = await prisma.productCategory.count();

    res.status(200).json({
      categories,
      totalPages: Math.ceil(totalCategories / take),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch product categories" });
  }
}
