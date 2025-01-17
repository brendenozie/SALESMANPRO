import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";

// POST /api/product

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { name, description, category, tags, price, companyId, productCategoryId } = req.body;

  // Validate required fields
  if ( !name || !price || !companyId) {
    return res.status(400).json({ message: 'Missing required fields: wiDate, wiAmount, userId, name, price, or companyId' });
  }

  // Validate price
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice)) {
    return res.status(400).json({ message: 'Invalid number format provided for price' });
  }

  // Validate optional fields
  const parsedTags = Array.isArray(tags) ? tags : [];

  try {
    // Create product entry
    const result = await prisma.product.create({
      data: {
        name,
        description,
        category,
        tags: parsedTags,
        price: parsedPrice,
        companyId,
        productCategoryId,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
