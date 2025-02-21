import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed. Use GET." });
  }

  const { sellerId } = req.query;

  // Validate sellerId
  if (!sellerId || typeof sellerId !== "string") {
    return res.status(400).json({ message: "Invalid or missing sellerId." });
  }

  try {
    // Fetch marketplace products for the seller
    const products = await prisma.marketplaceListing.findMany({
      where: { sellerId },      
      include: {
        productCategory: true, // Include product details
      },
    });

    // Structure response data
    // const marketplaceProducts = products.map((item) => ({
    //   id: item.id,
    //   sellerId: item.sellerId,
    //   sellerType: item.sellerType,
    //   productId: item.productId,
    //   title: item.title,
    //   description: item.description,
    //   quantity: item.quantity,
    //   createdAt: item.createdAt,
    //   updatedAt: item.updatedAt,
    //   salesPrice: item.salesPrice,
    //   discount: item.discount,
    //   isOnOffer: item.isOnOffer,
    //   isFlashDeal: item.isFlashDeal,
    //   isNewArrival: item.isNewArrival,
    //   isDiscounted: item.isDiscounted,
    //   isFeatured: item.isFeatured,
    //   buyingPrice: item.buyingPrice,
    //   sellingPrice: item.sellingPrice,
    //   productName: item.product?.name || "Unknown Product",
    // }));

    return res.status(200).json({ sellerId, products });
  } catch (error: any) {
    console.error("Error fetching marketplace products:", error);
    return res.status(500).json({
      message: "An error occurred while fetching marketplace products.",
      error: error.message || "Unknown error",
    });
  }
}
