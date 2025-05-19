import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed. Use GET." });
  }

  const { companyId } = req.query;

  // Validate sellerId
  if (!companyId || typeof companyId !== "string") {
    return res.status(400).json({ message: "Invalid or missing sellerId." });
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
    return res.status(500).json({
      message: "An error occurred while fetching marketplace products.",
      error: error.message || "Unknown error",
    });
  }
}
