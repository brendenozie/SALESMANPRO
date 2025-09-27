// app/api/admin/post-market-list/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// ----------------- Utils -----------------
const parseJsonSafely = (data: any, fallback: any = null) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
};

const normalizeArray = (val: any): any[] => Array.isArray(val) ? val : val ? [val] : [];

const parseDate = (val: any): Date | null => {
  if (typeof val === "string" && !isNaN(Date.parse(val))) {
    return new Date(val);
  }
  return null;
};

const parseNumber = (val: any, fallback: number | null = null): number | null => {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

// ----------------- Handler -----------------
async function handlePost(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const body = await req.json();
  const {
    id,
    companyId,
    sellerId,
    sellerType,
    productId,
    productCategoryId,
    propertyTypeId,
    collectionId,
    name,
    description,
    longDescription,
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
    dimensions,
    material,
    quantity,
    buyingPrice,
    sellingPrice,
    discount,
    tax,
    shippingCost,
    finalPrice,
    profitMargin,
    pricingTiers,
    startDealDate,
    endDealDate,
    availabilityStart,
    availabilityEnd,
    expirationDate,
    isAvailable,
    isOnOffer,
    isFlashDeal,
    isNewArrival,
    isDiscounted,
    isFeatured,
    images,
    video,
    bookingSlots,
    requiredClientInfo,
    minNoticePeriod,
    maxBookingAhead,
    totalCapacity,
    currentBookedCount,
    providerRating,
    hourlyRate,
    minimumHours,
    fulfillmentStatus,
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
    bathrooms,
    area,
    bedrooms,
    studios,
    serviceSchedule,
    amenities,
    make,
    trim,
    type,
    mileage,
    engineType,
    engineSize,
    horsepower,
    torque,
    fuelType,
    fuelEconomy,
    transmission,
    drivetrain,
    vin,
    logbookStatus,
    serviceHistory,
    negotiable,
    financingAvailable,
    tradeIn,
    features,
    previousOwners,
    tireCondition,
    accidentalHistory,
    contact,
    contactName,
    email,
    location,
    locationName,
    latitude,
    longitude,
    commissionType,
    commissionRate,
    commissionStartDate,
    commissionEndDate,
    delivery,
    paymentOption,
    showOnGhuba,
    status,
    updatedAt,
    year,
    digitalUrl,
    autoDeliver
  } = body;

  if (!companyId || !productCategoryId) {
    return formatResponse(false, null, "Missing required fields: companyId or productCategoryId.", 400);
  }

  // Normalize arrays
  const safeTags      = normalizeArray(tags).filter(v => typeof v === "string");
  const safeColor     = normalizeArray(color).filter(v => typeof v === "string");
  const safeSize      = normalizeArray(size).filter(v => typeof v === "string");
  const safeMaterial  = normalizeArray(material).filter(v => typeof v === "string");
  const safeImages    = normalizeArray(images);
  const safeAmenities = normalizeArray(amenities).filter(v => typeof v === "string");
  const safeReqInfo   = normalizeArray(requiredClientInfo).filter(v => typeof v === "string");
  const safeBooking   = normalizeArray(bookingSlots);
  const safePricing   = normalizeArray(pricingTiers);

  // Safe JSON objects
  const safeSubCategory = typeof subCategory === "string" ? parseJsonSafely(subCategory, {}) : subCategory || {};
  const safeLocation    = typeof location === "string" ? parseJsonSafely(location, {}) : location || {};

  // Parse dates
  const parsedStartDeal    = parseDate(startDealDate);
  const parsedEndDeal      = parseDate(endDealDate);
  const parsedAvailStart   = parseDate(availabilityStart);
  const parsedAvailEnd     = parseDate(availabilityEnd);
  const parsedExpiration   = parseDate(expirationDate);

  // Parse numbers
  const parsedQuantity     = parseNumber(quantity, 0) || 0;
  const parsedBuyingPrice  = parseNumber(buyingPrice, 0) || 0;
  const parsedSellingPrice = parseNumber(sellingPrice, 0) || 0;
  const parsedDiscount     = parseNumber(discount, 0) || 0;
  const parsedTax          = parseNumber(tax, 0) || 0;
  const parsedShippingCost = parseNumber(shippingCost, 0) || 0;
  const parsedFinalPrice   = parseNumber(finalPrice, parsedSellingPrice - (parsedSellingPrice * parsedDiscount / 100))!;
  const parsedProfitMargin = parseNumber(profitMargin,
    parsedSellingPrice > 0
      ? ((parsedFinalPrice - parsedBuyingPrice) / parsedBuyingPrice) * 100
      : 0
  )!;

  const parsedBathrooms    = bathrooms !== undefined && bathrooms !== null ? bathrooms.toString() : "0";
  const parsedLatitude     = parseNumber(latitude, null);
  const parsedLongitude    = parseNumber(longitude, null);
  const parsedYear         = parseNumber(year, null);

  const now = new Date();
  const data: any = {
    company: { connect: { id: companyId } },
    ...(sellerId && { seller: { connect: { id: sellerId } } }),
    sellerType,
    ...(productId && { product: { connect: { id: productId } } }),
    productCategory: { connect: { id: productCategoryId } },
    ...(propertyTypeId && { propertyType: { connect: { id: propertyTypeId } } }),
    ...(collectionId && { Collection: { connect: { id: collectionId } } }),

    name: name || "New Name",
    description: description || null,
    longDescription: longDescription || null,
    category,
    subCategory: safeSubCategory,
    subCategoryName,
    tags: safeTags,
    brand,
    model,
    color: safeColor,
    size: safeSize,
    weight,
    condition,
    dimensions,
    material: safeMaterial,
    quantity: parsedQuantity,
    images: safeImages,
    video,
    tax: parsedTax,
    shippingCost: parsedShippingCost,
    discount: parsedDiscount,
    buyingPrice: parsedBuyingPrice,
    sellingPrice: parsedSellingPrice,
    finalPrice: parsedFinalPrice,
    profitMargin: parsedProfitMargin,
    pricingTiers: safePricing,
    startDealDate: parsedStartDeal,
    endDealDate: parsedEndDeal,
    availabilityStart: parsedAvailStart,
    availabilityEnd: parsedAvailEnd,
    expirationDate: parsedExpiration,
    isAvailable: Boolean(isAvailable),
    isOnOffer: Boolean(isOnOffer),
    isFlashDeal: Boolean(isFlashDeal),
    isNewArrival: Boolean(isNewArrival),
    isDiscounted: Boolean(isDiscounted),
    isFeatured: Boolean(isFeatured),
    bathrooms: parsedBathrooms,
    area,
    bedrooms,
    studios,
    serviceSchedule,
    digitalUrl,
    autoDeliver: Boolean(autoDeliver),
    bookingSlots: safeBooking,
    requiredClientInfo: safeReqInfo,
    minNoticePeriod,
    maxBookingAhead,
    fulfillmentStatus,
    totalCapacity,
    currentBookedCount,
    providerRating,
    hourlyRate,
    minimumHours,
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
    make,
    trim,
    type,
    mileage,
    engineType,
    engineSize,
    horsepower,
    torque,
    fuelType,
    fuelEconomy,
    transmission,
    drivetrain,
    vin,
    logbookStatus: serviceHistory || "Full",
    negotiable: Boolean(negotiable),
    financingAvailable: Boolean(financingAvailable),
    tradeIn: Boolean(tradeIn),
    features: features || [],
    previousOwners: parseNumber(previousOwners, null),
    tireCondition,
    accidentalHistory: Boolean(accidentalHistory),
    contact,
    contactName,
    email,
    location: safeLocation,
    locationName,
    latitude: parsedLatitude,
    longitude: parsedLongitude,
    amenities: safeAmenities,
    delivery: Boolean(delivery),
    paymentOption: paymentOption || "AT SHOP",
    showOnGhuba: showOnGhuba ?? true,
    status: status || "ACTIVE",
    updatedAt: now,
    createdAt: now,
    year: parsedYear,
  };

  let listing;
  await prisma.$transaction(async tx => {
    if (id) {
      const existing = await tx.marketplaceListings.findUnique({ where: { id } });
      if (existing) {
        listing = await tx.marketplaceListings.update({ where: { id }, data });
        return;
      }
    }
    listing = await tx.marketplaceListings.create({ data });
  });

  return formatResponse(true, listing, "Marketplace listing processed successfully.", id ? 200 : 201);
}

// Wrap withApiHandler
export const POST = withApiHandler(handlePost);
