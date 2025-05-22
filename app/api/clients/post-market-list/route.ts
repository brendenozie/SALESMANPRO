import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


// Utility to safely parse JSON
const parseJsonSafely = (data: any) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return null;
  }
};

// Normalize inputs to array
const normalizeArray = (val: any) => Array.isArray(val) ? val : (val ? [val] : []);

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed. Use POST." });
  }

  const body = req.body;
  const {
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
  } = body;

  if (!sellerId || !sellerType || !productCategoryId) {
    return res.status(400).json({ message: "Missing sellerId, sellerType, or productCategoryId." });
  }

  if (!["CLIENT", "CONSUMER", "AGENT", "ADMIN"].includes(sellerType)) {
    return res.status(400).json({ message: "Invalid seller type." });
  }

  try {
    let createdProductId = productId;
    let newProduct = null;
    let marketplaceListing = null;

    const safeSubCategory = parseJsonSafely(subCategory);
    const safeLocation = parseJsonSafely(location);
    const safeBedrooms = parseJsonSafely(bedrooms);
    const safeStudios = parseJsonSafely(studios);

    const safeTags = normalizeArray(tags);
    const safeColor = normalizeArray(color);
    const safeSize = normalizeArray(size);
    const safeMaterial = normalizeArray(material);
    const safeAmenities = normalizeArray(amenities);
    const safeImages = normalizeArray(images);

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // 1. Create product if not provided
      // if (!productId) {
      //   newProduct = await tx.product.create({
      //     data: {
      //       name: title ?? "Unnamed Product",
      //       description,
      //       category,
      //       subCategory: safeSubCategory,
      //       images: safeImages,
      //       video,
      //       tags: safeTags,
      //       brand,
      //       model,
      //       color: safeColor,
      //       size: safeSize,
      //       weight,
      //       condition,
      //       dimension,
      //       material: safeMaterial,
      //       author,
      //       publisher,
      //       isbn,
      //       fabricComposition,
      //       careInstructions,
      //       energyRating,
      //       warrantyPeriod,
      //       applianceDimensions,
      //       ingredients,
      //       usageInstructions,
      //       expirationDate: expirationDate ? new Date(expirationDate) : null,
      //       companyId: sellerId,
      //       productCategory: { connect: { id: productCategoryId } },
      //       contact,
      //       location: safeLocation,
      //       amenities: safeAmenities,
      //       bedrooms: safeBedrooms,
      //       studios: safeStudios,
      //       costPrice: buyingPrice ?? 0,
      //       salesPrice: sellingPrice ?? 0,
      //       finalPrice: finalPrice ?? 0,
      //       discount: discount ?? 0,
      //     },
      //   });

      //   createdProductId = newProduct.id;
      // }

      const existingListing = await tx.marketplaceListing.findFirst({
        where: {
          sellerId,
          sellerType,
          productId: createdProductId,
        },
      });

      const commonData = {
        sellerId,
        sellerType,
        // product: { connect: { id: createdProductId } },
        ...(createdProductId && {
          product: { connect: { id: createdProductId } },
        }),
        productCategory: { connect: { id: productCategoryId } },
        title: title ?? "New Name",
        description: description ?? "New Description",
        quantity,
        buyingPrice: buyingPrice ?? 0,
        sellingPrice: sellingPrice ?? 0,
        finalPrice: finalPrice ?? 0,
        category,
        subCategory: safeSubCategory,
        tags: safeTags,
        brand,
        model,
        color: safeColor,
        size: safeSize,
        weight,
        condition,
        dimension,
        material: safeMaterial,
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
        location: safeLocation,
        discount,
        images: safeImages,
        video,
        amenities: safeAmenities,
        bedrooms: safeBedrooms,
        studios: safeStudios,
        updatedAt: now,
      };

      if (existingListing) {
        marketplaceListing = await tx.marketplaceListing.update({
          where: { id: existingListing.id },
          data: commonData,
        });
      } else {
        marketplaceListing = await tx.marketplaceListing.create({
          data: {
            ...commonData,
            createdAt: now,
            status: "ACTIVE",
          },
        });
      }
    });

    return res.status(201).json({
      message: "Marketplace listing processed successfully.",
      listing: marketplaceListing,
      product: newProduct ?? undefined,
    });
  } catch (error: any) {
    console.error("❌ Error processing marketplace listing:", error);
    return res.status(500).json({
      message: "An error occurred while processing the marketplace listing.",
      error: error.message ?? "Unknown error",
    });
  }
}
