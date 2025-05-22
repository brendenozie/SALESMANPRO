import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


const getBestSellingProducts = async (req: NextApiRequest, res: NextApiResponse) => {
  const { startDate, endDate } = req.query;

  try {
    const bestSellingProducts = await prisma.product.findMany({
      // include: {
      //   orders: {
      //     where: {
      //       createdAt: {
      //         gte: startDate ? new Date(startDate as string) : undefined,
      //         lte: endDate ? new Date(endDate as string) : undefined,
      //       },
      //     },
      //     select: {
      //       quantity: true,
      //     },
      //   },
      // },
    });

    const productData = bestSellingProducts.map((product) => ({
      id: product.id,
      name: product.name,
      // totalSold: product.orders.reduce((sum, order) => sum + order.quantity, 0),
    }));

    // productData.sort((a, b) => b.totalSold - a.totalSold); // Sort by sales in descending order

    res.status(200).json(productData);
  } catch (error) {
    console.error("Error fetching best-selling products:", error);
    res.status(500).json({ error: "Failed to fetch best-selling products" });
  }
};

export default getBestSellingProducts;
