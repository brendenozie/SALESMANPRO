import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function GET( req : Request ) {
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed. Use GET." });
  }

  // const { companyId } = req.query;

  const { searchParams } = new URL(req.url);

  const companyId = searchParams.get("companyId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const page = parseInt(searchParams.get("page") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

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
    
    return NextResponse.json({ companyId, products });
  } catch (error: any) {
    console.error("Error fetching marketplace products:", error);
    return NextResponse.json({
      message: "An error occurred while fetching marketplace products.",
      error: error.message || "Unknown error",
    });
  }
}
