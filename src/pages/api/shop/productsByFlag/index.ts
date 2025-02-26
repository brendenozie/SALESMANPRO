import { NextApiRequest, NextApiResponse } from "next";

import prisma, { client } from "@/server/db/prismadb";
import { ta } from "date-fns/locale";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = 1, limit = 6, flag = '' } = req.query;
  
    const currentPage = parseInt(page as string, 10) || 1;
    const itemsPerPage = parseInt(limit as string, 10) || 5;

    const skip = (currentPage - 1) * itemsPerPage;
    const take = itemsPerPage;

    const products = await prisma.marketplaceListing.findMany({
      skip: skip,
      take: take,
      where: {
        [flag as string]: true,
      },
      // include: {
      //   inventoryItem: {
      //     include: {
      //       product: true,
      //     },
      //   },
      // },
    });

    const totalProducts = await prisma.marketplaceListing.count();

    res.status(200).json({
      products,
      totalPages: Math.ceil(totalProducts / take),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}