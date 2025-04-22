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
    discount,
    images,
    video,
    amenities,
    bedrooms,
    studios
  } = req.body;

  if (!sellerId || !sellerType || !productCategoryId) {
    return res.status(400).json({ message: "Invalid or missing request data." });
  }

  if (!["CLIENT", "CONSUMER", "AGENT", "ADMIN"].includes(sellerType)) {
    return res.status(400).json({ message: "Invalid seller type." });
  }

  try {
    let createdProductId = productId;

    // 1. If no productId is passed, create the product
    if (!productId) {
      const newProduct = await prisma.product.create({
        data: {
          name: title ?? "Unnamed Product",
          description,
          category,
          subCategory,
          images,
          video,
          tags,
          brand,
          model,
          color,
          size,
          weight,
          condition,
          dimension,
          material,
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
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          companyId: sellerId, // Assuming seller is a company
          productCategory: { connect: { id: productCategoryId } },
          contact,
          location,
          amenities,
          bedrooms,
          studios,
          costPrice: buyingPrice ?? 0,
          salesPrice: sellingPrice ?? 0,
          finalPrice: finalPrice ?? 0,
          discount,        
        },
      });

      createdProductId = newProduct.id;
    }

    // 2. Check if marketplace listing already exists
    const existingListing = await prisma.marketplaceListing.findFirst({
      where: {
        sellerId,
        sellerType,
        productId: createdProductId,
      },
    });

    let marketplaceListing;

    const commonData = {
      sellerId,
      sellerType,
      productCategory: { connect: { id: productCategoryId } },
      product: { connect: { id: createdProductId } },
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
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      contact,
      location,
      discount,
      images,
      video,
      amenities,
      bedrooms,
      studios,
      updatedAt: new Date(),
    };

    if (existingListing) {
      // 3. Update the existing listing
      marketplaceListing = await prisma.marketplaceListing.update({
        where: { id: existingListing.id },
        data: commonData,
      });
    } else {
      // 4. Create a new listing
      marketplaceListing = await prisma.marketplaceListing.create({
        data: {
          ...commonData,
          createdAt: new Date(),
          status: "ACTIVE",
        },
      });
    }

    return res.status(201).json({
      message: "Marketplace listing processed successfully.",
      listing: marketplaceListing,
    });
  } catch (error: any) {
    console.error("Error processing marketplace listing:", error);
    return res.status(500).json({
      message: "An error occurred while processing the marketplace listing.",
      error: error.message ?? "Unknown error",
    });
  }
}
