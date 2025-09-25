import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";


export default async function GET( req : Request ) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed. Use GET." });
  }

  const { sellerId } = req.query;
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
  

  // Validate sellerId
  if (!sellerId || typeof sellerId !== "string") {
    return NextResponse.json({ message: "Invalid or missing sellerId." });
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
    return NextResponse.json({
      message: "An error occurred while fetching marketplace products.",
      error: error.message || "Unknown error",
    });
  }
}
