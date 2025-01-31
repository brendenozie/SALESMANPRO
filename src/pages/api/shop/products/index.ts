import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../server/db/prismadb";
import { ta } from "date-fns/locale";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = 1, limit = 6 } = req.query;
    

  const currentPage = parseInt(page as string, 10) || 1;
  const itemsPerPage = parseInt(limit as string, 10) || 5;

  const skip = (currentPage - 1) * itemsPerPage;
  const take = itemsPerPage;

    const products = await prisma.clientInventory.findMany({
      skip: skip,
      take: take,
      include: {
        inventoryItem: {
            include: {
                product: true, // Include related Product details
          },
        },
        client: true,
      },
    });

    const totalProducts = await prisma.clientInventory.count();

    res.status(200).json({
      products,
      totalPages: Math.ceil(totalProducts / take),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}