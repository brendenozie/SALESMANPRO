// File: /pages/api/marketplace-list/route.ts (or whatever your path is)

import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed

// Utility to safely parse JSON strings into objects (or return null)
const parseJsonSafely = (data: any) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return null;
  }
};

// Normalize anything into an array (if it isn’t already)
const normalizeArray = (val: any) =>
  Array.isArray(val) ? val : val ? [val] : [];

// POST /api/post-market-list
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Destructure every field that MarketplaceListing expects
    const {
      id,                      // String?     (for updates)
      companyId,               // String?     @db.ObjectId
      sellerId,                // String?     @db.ObjectId
      sellerType,              // SellerType? enum
      productId,               // String?     @db.ObjectId
      title,                   // String      @default("New Name")
      description,             // String?     @default("New Description")
      quantity,                // Int
      images,                  // Json[]      (array of URLs)
      video,                   // String?
      productCategoryId,       // String      @db.ObjectId
      category,                // String?
      subCategory,             // Json?
      subCategoryName,         // String?
      tags,                    // String[]
      brand,                   // String?
      model,                   // String?
      color,                   // String[]
      size,                    // String[]
      weight,                  // String?
      condition,               // String?
      dimension,               // String?
      material,                // String[]
      profitMargin,            // Float?
      discount,                // Int?       @default(0)
      buyingPrice,             // Float
      sellingPrice,            // Float
      finalPrice,              // Float?     @default(0)
      isAvailable,             // Boolean    @default(true)
      isOnOffer,               // Boolean    @default(false)
      isFlashDeal,             // Boolean    @default(false)
      isNewArrival,            // Boolean    @default(false)
      isDiscounted,            // Boolean    @default(false)
      isFeatured,              // Boolean    @default(false)

      // Delivery & payment
      delivery,                // Boolean    @default(false)
      paymentOption,           // String     @default("AT SHOP")
      showOnGhuba,             // Boolean    @default(true)

      // Deal scheduling
      startDealDate,           // DateTime?
      endDealDate,             // DateTime?

      // Contact & location
      contact,                 // String?
      contactName,             // String?
      email,                   // String?
      location,                // Json?      (GeoJSON or similar)
      locationId,              // String?    @db.ObjectId
      locationName,            // String?
      latitude,                // Float?
      longitude,               // Float?

      // Pricing breakdown
      tax,                     // Float?     @default(0)
      shippingCost,            // Float?     @default(0)

      // Availability scheduling
      availabilityStart,       // DateTime?
      availabilityEnd,         // DateTime?

      // Category-specific fields
      author,                  // String?    (Books)
      publisher,               // String?    (Books)
      isbn,                    // String?    (Books)
      fabricComposition,       // String?    (Clothing/Fashion)
      careInstructions,        // String?    (Clothing/Fashion)
      energyRating,            // String?    (Home Appliances)
      warrantyPeriod,          // String?    (Home Appliances)
      applianceDimensions,     // String?    (Home Appliances)
      ingredients,             // String?    (Beauty Products)
      usageInstructions,       // String?    (Beauty Products)
      expirationDate,          // DateTime?  (Beauty Products)

      // Amenities
      amenities,               // String[]

      // Property-specific fields
      propertyTypeId,          // String?    @db.ObjectId
      bathrooms,               // String?
      area,                    // String?
      bedrooms,                // Json?
      studios,                 // Json?
      serviceSchedule,         // String?

      // Vehicle-specific fields
      make,                    // String?
      trim,                    // String?
      type,                    // String?
      mileage,                 // String?
      engineType,              // String?
      engineSize,              // String?
      transmission,            // String?
      drivetrain,              // String?
      vin,                     // String?
      logbookStatus,           // String?
      serviceHistory,          // String?
      negotiable,              // Boolean?  @default(false)
      financingAvailable,      // Boolean?  @default(false)
      tradeIn,                 // Boolean?  @default(false)

      // Digital goods
      digitalUrl,              // String?
      autoDeliver,             // Boolean?  @default(false)

      // Admin/Admin-only fields
      status,                  // ListingStatus @default(ACTIVE)
      collectionId,            // String?   @db.ObjectId
    } = body;

    // 2. BASIC validation:
    if (!productCategoryId || !companyId) {
      return NextResponse.json(
        { message: "Missing required fields: companyId or productCategoryId." },
        { status: 400 }
      );
    }
    if (!["CLIENT", "CONSUMER", "AGENT", "ADMIN", "COMPANY"].includes(sellerType)) {
      return NextResponse.json(
        { message: "Invalid sellerType. Must be one of CLIENT, CONSUMER, AGENT, ADMIN, COMPANY." },
        { status: 400 }
      );
    }

    // 3. Normalize / parse JSON arrays and objects
    const safeSubCategory   = parseJsonSafely(subCategory)   || {};
    const safeLocation      = parseJsonSafely(location)      || {};
    const safeBedrooms      = parseJsonSafely(bedrooms)      || {};
    const safeStudios       = parseJsonSafely(studios)       || {};

    const safeTags          = normalizeArray(tags);
    const safeColor         = normalizeArray(color);
    const safeSize          = normalizeArray(size);
    const safeMaterial      = normalizeArray(material);
    const safeAmenities     = normalizeArray(amenities);
    const safeImages        = normalizeArray(images);

    // 4. Parse floats
    const parsedQuantity       = parseInt(quantity  as any, 10) || 0;
    const parsedBuyingPrice    = parseFloat(buyingPrice  as any) || 0;
    const parsedSellingPrice   = parseFloat(sellingPrice as any) || 0;
    const parsedFinalPrice     = parseFloat(finalPrice as any)   || 0;
    const parsedProfitMargin   = profitMargin !== undefined
      ? parseFloat(profitMargin as any)
      : parsedSellingPrice > 0 && parsedBuyingPrice > 0
        ? +(((parsedSellingPrice - parsedBuyingPrice) / parsedBuyingPrice) * 100).toFixed(1)
        : 0;
    const parsedDiscount       = discount !== undefined ? parseInt(discount as any, 10) : 0;
    const parsedTax            = tax !== undefined ? parseFloat(tax as any) : 0;
    const parsedShippingCost   = shippingCost !== undefined ? parseFloat(shippingCost as any) : 0;

    const parsedLatitude       = latitude !== undefined ? parseFloat(latitude as any) : null;
    const parsedLongitude      = longitude !== undefined ? parseFloat(longitude as any) : null;

    // 5. Parse dates
    const parsedExpirationDate   = expirationDate  ? new Date(expirationDate)   : null;
    const parsedStartDealDate    = startDealDate   ? new Date(startDealDate)    : null;
    const parsedEndDealDate      = endDealDate     ? new Date(endDealDate)      : null;
    const parsedAvailabilityStart = availabilityStart ? new Date(availabilityStart) : null;
    const parsedAvailabilityEnd   = availabilityEnd   ? new Date(availabilityEnd)   : null;

    // 6. Prepare the common data object
    //    (we’ll spread this into both create and update)
    const now = new Date();
    const commonData: any = {
      // — relations —
      company:          { connect: { id: companyId } },
      ...(sellerId ? { seller: { connect: { id: sellerId } } } : {}),
      ...(productId ? { product: { connect: { id: productId } } } : {}),
      productCategory:  { connect: { id: productCategoryId } },

      // — title & description —
      title:            title || "New Name",
      description:      description || "New Description",

      // — inventory & media —
      quantity:         parsedQuantity,
      images:           safeImages,
      video:            video || null,

      // — category hierarchy & tagging —
      category:         category || "",
      subCategory:      safeSubCategory,
      subCategoryName:  subCategoryName || "",
      tags:             safeTags,

      // — branding & specs —
      brand:            brand || "",
      model:            model || "",
      color:            safeColor,
      size:             safeSize,
      weight:           weight || "",
      condition:        condition || "",
      dimension:        dimension || "",
      material:         safeMaterial,

      // — profit & pricing —
      profitMargin:     parsedProfitMargin,
      discount:         parsedDiscount,
      buyingPrice:      parsedBuyingPrice,
      sellingPrice:     parsedSellingPrice,
      finalPrice:       parsedFinalPrice,

      // — deal scheduling —
      startDealDate:    parsedStartDealDate,
      endDealDate:      parsedEndDealDate,

      // — category-specific —
      author:           author || "",
      publisher:        publisher || "",
      isbn:             isbn || "",
      fabricComposition: fabricComposition || "",
      careInstructions: careInstructions || "",
      energyRating:     energyRating || "",
      warrantyPeriod:   warrantyPeriod || "",
      applianceDimensions: applianceDimensions || "",
      ingredients:      ingredients || "",
      usageInstructions: usageInstructions || "",
      expirationDate:   parsedExpirationDate,

      // — flags —
      isAvailable:      Boolean(isAvailable),
      isOnOffer:        Boolean(isOnOffer),
      isFlashDeal:      Boolean(isFlashDeal),
      isNewArrival:     Boolean(isNewArrival),
      isDiscounted:     Boolean(isDiscounted),
      isFeatured:       Boolean(isFeatured),

      // — marketplace-specific —
      delivery:         Boolean(delivery),
      paymentOption:    paymentOption || "AT SHOP",
      showOnGhuba:      showOnGhuba !== undefined ? Boolean(showOnGhuba) : true,

      // — contact & location —
      contact:          contact || "",
      contactName:      contactName || "",
      email:            email || "",
      location:         safeLocation,
      locationId:       locationId || undefined,
      locationName:     locationName || "",
      latitude:         parsedLatitude,
      longitude:        parsedLongitude,

      // — pricing breakdown —
      tax:              parsedTax,
      shippingCost:     parsedShippingCost,

      // — availability scheduling —
      availabilityStart: parsedAvailabilityStart,
      availabilityEnd:   parsedAvailabilityEnd,

      // — amenities —
      amenities:        safeAmenities,

      // — property-specific —
      propertyTypeId:   propertyTypeId || undefined,
      bathrooms:        bathrooms || "",
      area:             area || "",
      bedrooms:         safeBedrooms,
      studios:          safeStudios,
      serviceSchedule:  serviceSchedule || "",

      // — vehicle-specific —
      make:             make || "",
      trim:             trim || "",
      type:             type || "",
      mileage:          mileage || "",
      engineType:       engineType || "",
      engineSize:       engineSize || "",
      transmission:     transmission || "",
      drivetrain:       drivetrain || "",
      vin:              vin || "",
      logbookStatus:    logbookStatus || "",
      serviceHistory:   serviceHistory || "",
      negotiable:       Boolean(negotiable),
      financingAvailable: Boolean(financingAvailable),
      tradeIn:          Boolean(tradeIn),

      // — digital goods —
      digitalUrl:       digitalUrl || "",
      autoDeliver:      Boolean(autoDeliver),

      // — admin/meta —
      status:           status || "ACTIVE",
      collectionId:     collectionId || undefined,

      // — timestamps —
      updatedAt:        now,
    };

    // 7. Upsert within a transaction
    let marketplaceListing;
    await prisma.$transaction(async (tx) => {
      const existingListing = await tx.marketplaceListing.findFirst({
        where: {
          companyId,
          productId:  productId,
          id: id 
        },
      });

      if (existingListing) {
        // Update
        marketplaceListing = await tx.marketplaceListing.update({
          where: { id: existingListing.id },
          data: {
            ...commonData,
          },
        });
      } else {
        // Create
        marketplaceListing = await tx.marketplaceListing.create({
          data: {
            ...commonData,
            createdAt: now,
          },
        });
      }
    });

    return NextResponse.json(
      {
        message: "Marketplace listing processed successfully.",
        listing: marketplaceListing,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error processing marketplace listing:", error);
    return NextResponse.json(
      {
        message: "An error occurred while processing the marketplace listing.",
        error: error.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
