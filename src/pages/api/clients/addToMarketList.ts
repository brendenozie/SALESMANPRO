import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed. Use POST." });
  }

  const {
    id,
    sellerId,
    sellerType,
    productId,
    title,
    description,
    quantity,
    buyingPrice,
    sellingPrice,
    finalPrice,
    category,
    subCategory,
    productCategoryId,
    tags,
    brand,
    model,
    color,
    size,
    weight,
    condition,
    dimension,
    material,
    isAvailable,
    isOnOffer,
    isFlashDeal,
    isNewArrival,
    isDiscounted,
    isFeatured,
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
    expirationDate,
    contact,
    location,
    discount
  } = req.body;

  if (!sellerId || !sellerType || !quantity || typeof quantity !== "number") {
    return res.status(400).json({ message: "Invalid or missing request data." });
  }

   if (!["CLIENT", "CONSUMER", "AGENT", "ADMIN"].includes(sellerType)) {
    return res.status(400).json({ message: "Invalid seller type." });
  }

  try {
    // Check if product already exists in market list
    const existingListing = await prisma.marketplaceListing.findFirst({
      where: {
        sellerId,
        sellerType,
        productId
      }
    });

    let marketplaceListing;

    if (existingListing) {
      // Update existing product
      marketplaceListing = await prisma.marketplaceListing.update({
        where: { id: existingListing.id },
        data: {
          sellerId,
          sellerType,
          productCategory: { connect: { id: productCategoryId } },
          product: { connect: { id: productId } },
          quantity,
          buyingPrice: buyingPrice ?? 0,
          sellingPrice: sellingPrice ?? 0,
          finalPrice: finalPrice ?? 0,
          title: title ?? "New Name",
          description: description ?? "New Description",
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
          isAvailable,
          isOnOffer,
          isFlashDeal,
          isNewArrival,
          isDiscounted,
          isFeatured,
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
          updatedAt: new Date(),
          contact,
          location,
          discount
        }
      });
    } else {
      // Create new listing
      marketplaceListing = await prisma.marketplaceListing.create({
        data: {
          sellerId,
          sellerType,
          productCategory: { connect: { id: productCategoryId } },
          product: { connect: { id: productId } },
          quantity,
          buyingPrice: buyingPrice ?? 0,
          sellingPrice: sellingPrice ?? 0,
          finalPrice: finalPrice ?? 0,
          title: title ?? "New Name",
          description: description ?? "New Description",
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
          isAvailable,
          isOnOffer,
          isFlashDeal,
          isNewArrival,
          isDiscounted,
          isFeatured,
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
          createdAt: new Date(),
          updatedAt: new Date(),
          contact,
          location,
          discount,
          status: "ACTIVE",
        }
      });
    }

    return res.status(201).json({
      message: "Marketplace listing processed successfully.",
      listing: marketplaceListing
    });
  } catch (error: any) {
    console.error("Error processing marketplace listing:", error);
    return res.status(500).json({
      message: "An error occurred while processing the marketplace listing.",
      error: error.message ?? "Unknown error"
    });
  }
}
