import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed. Use POST." });
  }

  const { sellerId, sellerType, productId, quantity, buyingPrice, sellingPrice,
    category ,
        subCategory,
        tags    ,
        brand       ,
        model       ,
        color       ,
        size        ,
        weight      ,
        condition   ,
        dimension   ,
        material    ,
        isAvailable ,
        isOnOffer  ,
        isFlashDeal,
        isNewArrival,
        isDiscounted,
        isFeatured,
   } = req.body;

  if (!sellerId || !sellerType || !productId || !quantity || typeof quantity !== "number") {
    return res.status(400).json({ message: "Invalid or missing request data." });
  }

  if (!["CLIENT", "CONSUMER"].includes(sellerType)) {
    return res.status(400).json({ message: "Invalid seller type." });
  }

  try {
    const marketplaceListing = await prisma.marketplaceListing.create({
      data: {
        sellerId,
        sellerType,
        product: { connect: { id: productId } }, 
        quantity,
        buyingPrice: buyingPrice ?? 0,
        sellingPrice: sellingPrice ?? 0,
        title: "New Name",
        description: "New Description",
        createdAt: new Date(),
        updatedAt: new Date(),
        category :category,
        subCategory: subCategory,
        tags    :tags,
        brand       :brand,
        model       :model,
        color       :color,
        size        :size,
        weight      :weight,
        condition   :condition,
        dimension   :dimension,
        material    :material,
        isAvailable :isAvailable,
        isOnOffer  :isOnOffer,
        isFlashDeal:isFlashDeal,
        isNewArrival:isNewArrival,
        isDiscounted:isDiscounted,
        isFeatured:isFeatured,
      },
    });

    return res.status(201).json({
      message: "Marketplace listing created successfully.",
      listing: marketplaceListing,
    });
  } catch (error: any) {
    console.error("Error creating marketplace listing:", error);
    return res.status(500).json({
      message: "An error occurred while creating the marketplace listing.",
      error: error.message ?? "Unknown error",
    });
  }
}
