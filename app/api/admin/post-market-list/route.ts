// app/api/marketplace-list/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Utility to safely parse JSON strings into objects (or return fallback)
const parseJsonSafely = (data: any, fallback: any = null) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
};

// Normalize anything into an array (if it isn’t already)
const normalizeArray = (val: any): any[] =>
  Array.isArray(val) ? val : val ? [val] : [];

// Parse a date string into Date or null
const parseDate = (val: any): Date | null => {
  if (typeof val === "string" && !isNaN(Date.parse(val))) {
    return new Date(val);
  }
  return null;
};

// Parse a number or string into number or fallback
const parseNumber = (val: any, fallback: number | null = null): number | null => {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Destructure all expected fields
    const {
      id,
      companyId,
      sellerId,
      sellerType,
      productId,
      productCategoryId,
      category,
      subCategory,
      subCategoryName,
      tags,
      brand,
      model,
      color,
      size,
      weight,
      condition,
      dimension,
      material,
      name,
      description,
      quantity,
      images,
      video,
      profitMargin,
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
      discount,
      isAvailable,
      isOnOffer,
      isFlashDeal,
      isNewArrival,
      isDiscounted,
      isFeatured,
      bathrooms,
      area,
      bedrooms,
      studios,
      propertyTypeId,
      serviceSchedule,
      digitalUrl,
      autoDeliver,
      buyingPrice,
      sellingPrice,
      finalPrice,
      tax,
      shippingCost,
      startDealDate,
      endDealDate,
      availabilityStart,
      availabilityEnd,
      bookingSlots,
      minNoticePeriod,
      maxBookingAhead,
      pricingTiers,
      requiredClientInfo,
      fulfillmentStatus,
      totalCapacity,
      currentBookedCount,
      providerRating,
      hourlyRate,
      minimumHours,
      deliveryMethod,
      contact,
      email,
      contactName,
      location,
      locationId,
      locationName,
      latitude,
      longitude,
      amenities,
      delivery,
      paymentOption,
      showOnGhuba,
      status,
      collectionId,
    } = body;

    // Basic required-field validation
    if (!companyId || !productCategoryId) {
      return NextResponse.json(
        { message: "Missing required fields: companyId or productCategoryId." },
        { status: 400 }
      );
    }

    // Validate sellerType enum
    const validSellerTypes = ["INDIVIDUAL", "COMPANY", "ADMIN"];
    if (sellerType && !validSellerTypes.includes(sellerType)) {
      return NextResponse.json(
        { message: `Invalid sellerType. Must be one of ${validSellerTypes.join(", ")}.` },
        { status: 400 }
      );
    }

    // Normalize and parse fields
    const safeTags      = normalizeArray(tags).filter((v) => typeof v === 'string');
    const safeColor     = normalizeArray(color).filter((v) => typeof v === 'string');
    const safeSize      = normalizeArray(size).filter((v) => typeof v === 'string');
    const safeMaterial  = normalizeArray(material).filter((v) => typeof v === 'string');
    const safeImages    = normalizeArray(images);
    const safeAmenities = normalizeArray(amenities).filter((v) => typeof v === 'string');
    const safeReqInfo   = normalizeArray(requiredClientInfo).filter((v) => typeof v === 'string');
    const safeBooking   = normalizeArray(bookingSlots);
    const safePricing   = normalizeArray(pricingTiers);

    // Single-object JSON fields
    const safeSubCategory =
      typeof subCategory === "string"
        ? parseJsonSafely(subCategory, {})
        : subCategory || {};
    const safeLocation =
      typeof location === "string"
        ? parseJsonSafely(location, {})
        : location || {};
    const safeBedrooms =
      typeof bedrooms === "string"
        ? parseJsonSafely(bedrooms, {})
        : bedrooms || {};
    const safeStudios =
      typeof studios === "string"
        ? parseJsonSafely(studios, {})
        : studios || {};

    // Dates & numbers
    const parsedExpiration   = parseDate(expirationDate);
    const parsedStartDeal     = parseDate(startDealDate);
    const parsedEndDeal       = parseDate(endDealDate);
    const parsedAvailStart    = parseDate(availabilityStart);
    const parsedAvailEnd      = parseDate(availabilityEnd);

    const parsedQuantity      = parseNumber(quantity, 0) || 0;
    const parsedBuyingPrice   = parseNumber(buyingPrice, 0) || 0;
    const parsedSellingPrice  = parseNumber(sellingPrice, 0) || 0;
    const parsedDiscount      = parseNumber(discount, 0) || 0;
    const parsedProfitMargin  = parseNumber(profitMargin, 0) || 0;
    const parsedFinalPrice    =
      finalPrice !== undefined
        ? parseNumber(finalPrice, parsedSellingPrice - (parsedSellingPrice * (parsedDiscount / 100)))
        : parsedSellingPrice - (parsedSellingPrice * (parsedDiscount / 100));

    const parsedTax           = parseNumber(tax, 0) || 0;
    const parsedShippingCost  = parseNumber(shippingCost, 0) || 0;

    const parsedTotalCapacity      = parseNumber(totalCapacity, 0);
    const parsedCurrentBookedCount = parseNumber(currentBookedCount, 0) || 0;
    const parsedProviderRating     = parseNumber(providerRating, null);
    const parsedHourlyRate         = parseNumber(hourlyRate, null);
    const parsedMinHours           = parseNumber(minimumHours, null);

    const parsedLatitude   = parseNumber(latitude, null);
    const parsedLongitude  = parseNumber(longitude, null);

    // Build commonData
    const now = new Date();
    const commonData: any = {
      
      company:    { connect: { id: companyId } },
      ...(sellerId && { seller: { connect: { id: sellerId } } }),
      sellerType,

      ...(productId && { product: { connect: { id: productId } } }),
      productCategory: { connect: { id: productCategoryId } },
      
      ...(propertyTypeId && { propertyType: { connect: { id: propertyTypeId } } }),
      ...(collectionId && { Collection: { connect: { id: collectionId } } }),

      name: name || "New Name",
      description: description || "New Description",

      quantity: parsedQuantity,
      images: safeImages,
      video: video || null,

      category: category || null,
      subCategory: safeSubCategory,
      subCategoryName: subCategoryName || null,
      tags: safeTags,
      brand: brand || null,
      model: model || null,
      color: safeColor,
      size: safeSize,
      weight: weight || null,
      condition: condition || null,
      dimension: dimension || null,
      material: safeMaterial,

      profitMargin: parsedProfitMargin,
      discount: parsedDiscount,
      buyingPrice: parsedBuyingPrice,
      sellingPrice: parsedSellingPrice,
      finalPrice: parsedFinalPrice,
      tax: parsedTax,
      shippingCost: parsedShippingCost,

      startDealDate: parsedStartDeal,
      endDealDate: parsedEndDeal,

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
      expirationDate: parsedExpiration,

      isAvailable: Boolean(isAvailable),
      isOnOffer: Boolean(isOnOffer),
      isFlashDeal: Boolean(isFlashDeal),
      isNewArrival: Boolean(isNewArrival),
      isDiscounted: Boolean(isDiscounted),
      isFeatured: Boolean(isFeatured),

      bathrooms: bathrooms || null,
      area: area || null,
      bedrooms: safeBedrooms,
      studios: safeStudios,
      serviceSchedule: serviceSchedule || null,

      digitalUrl: digitalUrl || null,
      autoDeliver: Boolean(autoDeliver),

      bookingSlots: safeBooking,
      minNoticePeriod: minNoticePeriod || null,
      maxBookingAhead: maxBookingAhead || null,
      pricingTiers: safePricing,
      requiredClientInfo: safeReqInfo,
      fulfillmentStatus: fulfillmentStatus || null,

      totalCapacity: parsedTotalCapacity,
      currentBookedCount: parsedCurrentBookedCount,
      providerRating: parsedProviderRating,
      hourlyRate: parsedHourlyRate,
      minimumHours: parsedMinHours,
      deliveryMethod: deliveryMethod || null,

      contact: contact || null,
      contactName: contactName || null,
      email: email || null,
      location: safeLocation,
      locationName: locationName || null,
      latitude: parsedLatitude,
      longitude: parsedLongitude,

      amenities: safeAmenities,

      delivery: Boolean(delivery),
      paymentOption: paymentOption || "AT SHOP",
      showOnGhuba: showOnGhuba !== undefined ? Boolean(showOnGhuba) : true,

      status: status || "ACTIVE",
      updatedAt: now,
    };

    let listing;
    await prisma.$transaction(async (tx) => {
      if (id) {
        const existing = await tx.marketplaceListings.findUnique({ where: { id } });
        if (existing) {
          listing = await tx.marketplaceListings.update({ where: { id }, data: commonData });
          return;
        }
      }
      listing = await tx.marketplaceListings.create({ data: { ...commonData, createdAt: now } });
    });

    return NextResponse.json(
      { message: "Marketplace listing processed successfully.", listing },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error processing marketplace listing:", error);
    return NextResponse.json(
      { message: "An error occurred while processing the marketplace listing.", code: error?.code },
      { status: 500 }
    );
  }
}
