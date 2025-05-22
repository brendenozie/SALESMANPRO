import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../server/db/prismadb";

// POST /api/product
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const {
    id,
    companyId,
    sellerType,
    name,
    description,
    quantity,
    image,
    productCategoryId,
    category,
    subCategory,
    tags,
    brand,
    model,
    color,
    size,
    weight,
    condition,
    dimension,
    material,
    finalPrice,
    discount,
    isAvailable,
    isOnOffer,
    isFlashDeal,
    isNewArrival,
    isDiscounted,
    isFeatured,
    costPrice,
    salesPrice,
    startDealDate,
    endDealDate,
    author,
    publisher,
    isbn,
    fabricComposition,
    careInstructions,
    energyRating,
    warrantyPeriod,
    applianceDimensions,
    ingredients,
    usageInstructions,
    startDate,
    endDate,
    expirationDate,    
    commissionRate,
    commissionType, // Default to "Percentage"
    contact,
    location
  }  = req.body;
  
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
              productCategory: { connect: {id:productCategoryId}},
              tags: parsedTags,
              costPrice: parsedCostPrice,
              salesPrice: parsedSalesPrice,
              finalPrice: finalPrice ?? 0,
              name: name ?? "New Name",
              description: description ?? "New Description",
              category: category,
              subCategory: subCategory,
              brand: brand,
              model: model,
              color: color,
              size: size,
              weight: weight,
              discount:discount,
              condition: condition,
              dimension: dimension,
              material: material,
              isAvailable: isAvailable,
              isOnOffer: isOnOffer,
              isFlashDeal: isFlashDeal,
              isNewArrival: isNewArrival,
              isDiscounted: isDiscounted,
              isFeatured: isFeatured,
              company: { connect: {id:companyId}},
              // Extended category-specific fields
              author: author || null,
              publisher: publisher || null,
              isbn: isbn || null,
              fabricComposition: fabricComposition || null,
              careInstructions: careInstructions || null,
              energyRating: energyRating || null,
              warrantyPeriod: warrantyPeriod || null,
              applianceDimensions: applianceDimensions || null,
              ingredients: ingredients || null,
              usageInstructions: usageInstructions || null,
              expirationDate: expirationDate ? new Date(expirationDate) : null,
              startDealDate: startDealDate,
              endDealDate   :endDealDate,
              updatedAt: new Date(),
              contact:contact,
              location:location
        },
      });
    } else {
      product = await prisma.product.create({
            data: { 
              productCategory: { connect: {id:productCategoryId}},
              tags: parsedTags,
              costPrice: parsedCostPrice,
              salesPrice: parsedSalesPrice,
              finalPrice: finalPrice ?? 0,
              name: name ?? "New Name",
              description: description ?? "New Description",
              category: category,
              subCategory: subCategory,
              brand: brand,
              model: model,
              color: color,
              size: size,
              weight: weight,
              discount:discount,
              condition: condition,
              dimension: dimension,
              material: material,
              isAvailable: isAvailable,
              isOnOffer: isOnOffer,
              isFlashDeal: isFlashDeal,
              isNewArrival: isNewArrival,
              isDiscounted: isDiscounted,
              isFeatured: isFeatured,
              company: { connect: {id:companyId}},
              // Extended category-specific fields
              author: author || null,
              publisher: publisher || null,
              isbn: isbn || null,
              fabricComposition: fabricComposition || null,
              careInstructions: careInstructions || null,
              energyRating: energyRating || null,
              warrantyPeriod: warrantyPeriod || null,
              applianceDimensions: applianceDimensions || null,
              ingredients: ingredients || null,
              usageInstructions: usageInstructions || null,
              expirationDate: expirationDate ? new Date(expirationDate) : null,
              startDealDate: startDealDate,
              endDealDate   :endDealDate,
              createdAt: new Date(),
              updatedAt: new Date(),
              contact:contact,
              location:location,
              status: "ACTIVE",
            }
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

    res.status(201).json({ product, commissionRate: commissionRateRecord });
  } catch (error) {
    console.error("Error creating or updating product and commission rate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
