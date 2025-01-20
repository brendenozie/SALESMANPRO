import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

// POST /api/product

export default async function handle(req: NextApiRequest, res: NextApiResponse) {

  console.log("1234");
  console.log(req.body);

  const {
    id,
    name,
    description,
    category,
    tags,
    costPrice,
    salesPrice,
    companyId,
    productCategoryId,
    commissionType,
    commissionRate,
    startDate,
    endDate
  } = req.body;

  // Validate required fields
  if (!name || !costPrice || !salesPrice || !companyId || !commissionType || commissionRate === undefined) {
    return res.status(400).json({
      message: "Missing required fields: name, price, companyId, commissionType, commissionRate, or startDate"
    });
  }

  // Validate price
  const parsedCostPrice = parseFloat(costPrice);
  if (isNaN(parsedCostPrice)) {
    return res.status(400).json({ message: "Invalid number format provided for Cost price" });
  }

  // Validate price
  const parsedSalesPrice = parseFloat(salesPrice);
  if (isNaN(parsedSalesPrice)) {
    return res.status(400).json({ message: "Invalid number format provided for Sales price" });
  }

  // Validate commission rate
  const parsedCommissionRate = parseFloat(commissionRate);
  if (isNaN(parsedCommissionRate)) {
    return res.status(400).json({ message: "Invalid number format provided for commission rate" });
  }

  // Validate optional fields
  const parsedTags = Array.isArray(tags) ? tags : [];

  try {
    // Create or update product
    const product = await prisma.product.upsert({
      where: { id },
      update: {
        description,
        category,
        tags: parsedTags,
        costPrice: parsedCostPrice,
        salesPrice: parsedSalesPrice,
        companyId,
        productCategoryId,
      },
      create: {
        name,
        description,
        category,
        tags: parsedTags,        
        costPrice: parsedCostPrice,
        salesPrice: parsedSalesPrice,
        companyId,
        productCategoryId,
      },
    });


    // Create or update commission rate
    const commissionRateRecord = await prisma.commissionRate.upsert({
      where: {
        productId: product.id,
      },
      update: {
        commissionType,
        commissionRate: parsedCommissionRate,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
      create: {
        productId: product.id,
        commissionType,
        commissionRate: parsedCommissionRate,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    res.status(201).json({ product, commissionRate: commissionRateRecord });
  } catch (error) {
    console.error("Error creating or updating product and commission rate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
