import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust the path as needed

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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      companyId,
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

    if (!productCategoryId) {
      return NextResponse.json({ message: "Missing Details." }, { status: 400 });
    }

    if (!["CLIENT", "CONSUMER", "AGENT", "ADMIN", "COMPANY"].includes(sellerType)) {
      return NextResponse.json({ message: "Invalid seller type." }, { status: 400 });
    }

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
      const existingListing = await tx.marketplaceListing.findFirst({
        where: {
          companyId,
          productId: createdProductId,
        },
      });

      const commonData = {
        company: { connect: { id: companyId } },
        sellerType,
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

    return NextResponse.json({
      message: "Marketplace listing processed successfully.",
      listing: marketplaceListing,
      product: newProduct ?? undefined,
    }, { status: 201 });

  } catch (error: any) {
    console.error("❌ Error processing marketplace listing:", error);
    return NextResponse.json({
      message: "An error occurred while processing the marketplace listing.",
      error: error.message ?? "Unknown error",
    }, { status: 500 });
  }
}
