import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function GET( req : Request ) {
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed. Use GET." });
  }

  const { companyId } = req.query;

  // Validate sellerId
  if (!companyId || typeof companyId !== "string") {
    return NextResponse.json({ message: "Invalid or missing sellerId." });
  }

  try {
    // Fetch marketplace products for the seller
    const products = await prisma.marketplaceListing.findMany({
      where: { companyId },      
      include: {
        productCategory: true, // Include product details
      },
    });
    
    return res.status(200).json({ companyId, products });
  } catch (error: any) {
    console.error("Error fetching marketplace products:", error);
    return NextResponse.json({
      message: "An error occurred while fetching marketplace products.",
      error: error.message || "Unknown error",
    });
  }
}
