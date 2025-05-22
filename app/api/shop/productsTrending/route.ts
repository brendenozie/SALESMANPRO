import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method Not Allowed" });
  }

  try {
    // Fetch top 10 trending products based on engagement metrics
    const trendingProducts = await prisma.productMetrics.findMany({
      orderBy: [
        { purchases: "desc" },
        { favorites: "desc" },
        { views: "desc" },
      ],
      take: 10,
      include: {
        product: true, // Include product details
      },
    });

    return res.status(200).json(trendingProducts);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
