import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

// POST /api/product
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
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
    endDate,
  } = req.body;

  // Validate required fields
  if (!name || !costPrice || !salesPrice || !companyId || !commissionType || commissionRate === undefined) {
    return res.status(400).json({
      message: "Missing required fields: name, price, companyId, commissionType, or commissionRate",
    });
  }

  // Validate price fields
  const parsedCostPrice = parseFloat(costPrice);
  const parsedSalesPrice = parseFloat(salesPrice);
  const parsedCommissionRate = parseFloat(commissionRate);

  if (isNaN(parsedCostPrice) || isNaN(parsedSalesPrice) || isNaN(parsedCommissionRate)) {
    return res.status(400).json({
      message: "Invalid number format provided for costPrice, salesPrice, or commissionRate",
    });
  }

  // Ensure valid date objects
  const parsedStartDate = startDate ? new Date(startDate) : new Date();
  const parsedEndDate = endDate ? new Date(endDate) : null;

  if (parsedStartDate && isNaN(parsedStartDate.getTime())) {
    return res.status(400).json({ message: "Invalid startDate format. Provide a valid date." });
  }

  if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
    return res.status(400).json({ message: "Invalid endDate format. Provide a valid date." });
  }

  // Validate optional fields
  const parsedTags = Array.isArray(tags) ? tags : [];

  try {
    let product;

    if (id) {
      // Update existing product
      product = await prisma.product.update({
        where: { id },
        data: {
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
    } else {
      // Create new product
      product = await prisma.product.create({
        data: {
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
    }

    // Create or update commission rate
    
    const commissionRateRecord = await prisma.commissionRate.upsert({
      where: { productId: product.id },
      update: {
        commissionType,
        commissionRate: parsedCommissionRate,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
      create: {
        productId: product.id,
        commissionType,
        commissionRate: parsedCommissionRate,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
    });

    // const commissionRateRecord = await prisma.commissionRate.upsert({
    //   where: { productId: product.id },
    //   update: {
    //     commissionType,
    //     commissionRate: parsedCommissionRate,
    //     startDate: new Date(startDate),
    //     endDate: endDate ? new Date(endDate) : null,
    //   },
    //   create: {
    //     productId: product.id,
    //     commissionType,
    //     commissionRate: parsedCommissionRate,
    //     startDate: startDate ? new Date(startDate) : new Date(),
    //     endDate: endDate ? new Date(endDate) : null,
    //   },
    // });

    res.status(201).json({ product, commissionRate: commissionRateRecord });
  } catch (error) {
    console.error("Error creating or updating product and commission rate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
