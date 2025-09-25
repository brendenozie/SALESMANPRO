import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";


// POST /api/product

export default async function GET( req : Request ) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { name, description, category, tags, price, companyId, productCategoryId } = req.body;

  // Validate required fields
  if ( !name || !price || !companyId) {
    return NextResponse.json({ message: 'Missing required fields: wiDate, wiAmount, userId, name, price, or companyId' });
  }

  // Validate price
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice)) {
    return NextResponse.json({ message: 'Invalid number format provided for price' });
  }

  // Validate optional fields
  const parsedTags = Array.isArray(tags) ? tags : [];

  try {
    // Create product entry
    // const result = await prisma.product.create({
    //   data: {
    //     name,
    //     description,
    //     category,
    //     tags: parsedTags,
    //     finalPrice: parsedPrice,
    //     companyId,
    //     productCategoryId,
    //   },
    // });

    res.status(201).json("result");
  } catch (error) {
    console.error("Error creating product:", error);
    NextResponse.json({ message: 'Internal server error' });
  }
}
