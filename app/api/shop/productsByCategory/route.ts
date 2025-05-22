import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = 1, limit = 6, categoryId } = req.query;

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
  
  
    const currentPage = parseInt(page as string, 10) || 1;
    const itemsPerPage = parseInt(limit as string, 10) || 5;

    const skip = (currentPage - 1) * itemsPerPage;
    const take = itemsPerPage;
    const categoryIdStr = Array.isArray(categoryId) ? categoryId[0] : categoryId;

    const products = await prisma.marketplaceListing.findMany({
      skip: skip,
      take: take,
      where: {
          product: {
            productCategoryId: categoryIdStr,
          },
      },
      include: {
            product: true,
      },
    });

    const totalProducts = await prisma.marketplaceListing.count();

    res.status(200).json({
      products,
      totalPages: Math.ceil(totalProducts / take),
    });
  } catch (error) {
    NextResponse.json({ error: 'Failed to fetch products' });
  }
}