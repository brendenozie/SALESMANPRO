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

// POST /api/marketplace-list
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Destructure ALL fields that MarketplaceListing expects, including new ones
    const {
      id, // String? (for updates)
      companyId, // String? @db.ObjectId
      sellerId, // String? @db.ObjectId
      sellerType, // SellerType? enum
      productId, // String? @db.ObjectId
      title, // String @default("New Name")
      description, // String? @default("New Description")
      quantity, // Int
      images, // Json[] (array of URLs)
      video, // String?
      productCategoryId, // String @db.ObjectId
      category, // String?
      subCategory, // Json?
      subCategoryName, // String?
      tags, // String[]
      brand, // String?
      model, // String?
      color, // String[]
      size, // String[]
      weight, // String?
      condition, // String?
      dimension, // String?
      material, // String[]
      profitMargin, // Float?
      discount, // Int? @default(0)
      buyingPrice, // Float
      sellingPrice, // Float
      finalPrice, // Float? @default(0)
      isAvailable, // Boolean @default(true)
      isOnOffer, // Boolean @default(false)
      isFlashDeal, // Boolean @default(false)
      isNewArrival, // Boolean @default(false)
      isDiscounted, // Boolean @default(false)
      isFeatured, // Boolean @default(false)

      // Delivery & payment
      delivery, // Boolean @default(false)
      paymentOption, // String @default("AT SHOP")
      showOnGhuba, // Boolean @default(true)

      // Deal scheduling
      startDealDate, // DateTime?
      endDealDate, // DateTime?

      // Contact & location
      contact, // String?
      contactName, // String?
      email, // String?
      location, // Json? (GeoJSON or similar)
      locationId, // String? @db.ObjectId
      locationName, // String?
      latitude, // Float?
      longitude, // Float?

      // Pricing breakdown
      tax, // Float? @default(0)
      shippingCost, // Float? @default(0)

      // Availability scheduling
      availabilityStart, // DateTime?
      availabilityEnd, // DateTime?

      // Category-specific fields (Books, Fashion, Appliances, Beauty)
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

      // Amenities
      amenities, // String[]

      // Property-specific fields
      propertyTypeId,
      bathrooms,
      area,
      bedrooms,
      studios,
      serviceSchedule,

      // Vehicle-specific fields
      make,
      trim,
      type,
      mileage,
      engineType,
      engineSize,
      transmission,
      drivetrain,
      vin,
      logbookStatus,
      serviceHistory,
      negotiable,
      financingAvailable,
      tradeIn,

      // Digital goods
      digitalUrl,
      autoDeliver,

      // NEW SERVICE-SPECIFIC FIELDS
      bookingSlots, // Json[]
      minNoticePeriod, // String?
      maxBookingAhead, // String?
      pricingTiers, // Json[]
      requiredClientInfo, // String[]
      fulfillmentStatus, // String?
      totalCapacity, // Int?
      currentBookedCount, // Int?
      providerRating, // Float?
      hourlyRate, // Float?
      minimumHours, // Int?
      deliveryMethod, // String? (e.g., "On-site", "Remote/Virtual", "At Location")

      // Admin/Admin-only fields
      status, // ListingStatus @default(ACTIVE)
      collectionId, // String? @db.ObjectId
    } = body;

    // 2. BASIC validation:
    if (!productCategoryId || !companyId) {
      return NextResponse.json(
        { message: "Missing required fields: companyId or productCategoryId." },
        { status: 400 }
      );
    }
    // Validate sellerType against your enum
    // Assuming SellerType is defined as 'INDIVIDUAL' | 'COMPANY' in your Prisma schema
    const validSellerTypes = ['INDIVIDUAL', 'COMPANY', 'ADMIN']; // Add other valid types if they exist in your enum
    if (sellerType && !validSellerTypes.includes(sellerType)) {
      return NextResponse.json(
        { message: `Invalid sellerType. Must be one of ${validSellerTypes.join(', ')}.` },
        { status: 400 }
      );
    }
    // Basic validation for required service fields for a service listing if applicable
    // You might want to add more robust validation here based on `productCategoryId`
    // For example, if productCategoryId is for 'Services', then ensure `hourlyRate` or `pricingTiers` are present.

    // 3. Normalize / parse JSON arrays and objects
    const safeSubCategory = parseJsonSafely(subCategory) || {};
    const safeLocation = parseJsonSafely(location) || {};
    const safeBedrooms = parseJsonSafely(bedrooms) || {};
    const safeStudios = parseJsonSafely(studios) || {};

    const safeTags = normalizeArray(tags);
    const safeColor = normalizeArray(color);
    const safeSize = normalizeArray(size);
    const safeMaterial = normalizeArray(material);
    const safeAmenities = normalizeArray(amenities);
    const safeImages = normalizeArray(images);

    // NEW: Normalize and parse service-specific JSON arrays
    const safeBookingSlots = normalizeArray(bookingSlots).map(parseJsonSafely);
    const safePricingTiers = normalizeArray(pricingTiers).map(parseJsonSafely);
    const safeRequiredClientInfo = normalizeArray(requiredClientInfo);

    // 4. Parse numbers (integers and floats)
    const parsedQuantity = parseInt(quantity as any, 10) || 0;
    const parsedBuyingPrice = parseFloat(buyingPrice as any) || 0;
    const parsedSellingPrice = parseFloat(sellingPrice as any) || 0;
    // Calculate finalPrice if not provided, assuming discount is applied
    const calculatedFinalPrice = finalPrice !== undefined
        ? parseFloat(finalPrice as any)
        : (parsedSellingPrice - (parsedSellingPrice * ( (discount || 0) / 100 )));
    const parsedProfitMargin = profitMargin !== undefined
      ? parseFloat(profitMargin as any)
      : parsedSellingPrice > 0 && parsedBuyingPrice > 0
      ? +(((parsedSellingPrice - parsedBuyingPrice) / parsedBuyingPrice) * 100).toFixed(1)
      : 0;
    const parsedDiscount = discount !== undefined ? parseInt(discount as any, 10) : 0;
    const parsedTax = tax !== undefined ? parseFloat(tax as any) : 0;
    const parsedShippingCost = shippingCost !== undefined ? parseFloat(shippingCost as any) : 0;

    const parsedLatitude = latitude !== undefined ? parseFloat(latitude as any) : null;
    const parsedLongitude = longitude !== undefined ? parseFloat(longitude as any) : null;

    // NEW: Parse service-specific numbers
    const parsedTotalCapacity = totalCapacity !== undefined ? parseInt(totalCapacity as any, 10) : null;
    const parsedCurrentBookedCount = currentBookedCount !== undefined ? parseInt(currentBookedCount as any, 10) : null;
    const parsedProviderRating = providerRating !== undefined ? parseFloat(providerRating as any) : null;
    const parsedHourlyRate = hourlyRate !== undefined ? parseFloat(hourlyRate as any) : null;
    const parsedMinimumHours = minimumHours !== undefined ? parseInt(minimumHours as any, 10) : null;


    // 5. Parse dates
    const parsedExpirationDate = expirationDate ? new Date(expirationDate) : null;
    const parsedStartDealDate = startDealDate ? new Date(startDealDate) : null;
    const parsedEndDealDate = endDealDate ? new Date(endDealDate) : null;
    const parsedAvailabilityStart = availabilityStart ? new Date(availabilityStart) : null;
    const parsedAvailabilityEnd = availabilityEnd ? new Date(availabilityEnd) : null;

    // 6. Prepare the common data object for Prisma
    const now = new Date();
    const commonData: any = {
      // — relations —
      company: { connect: { id: companyId } },
      ...(sellerId ? { seller: { connect: { id: sellerId } } } : {}),
      sellerType: sellerType || undefined, // Set sellerType
      ...(productId ? { product: { connect: { id: productId } } } : {}),
      productCategory: { connect: { id: productCategoryId } },
      ...(locationId ? { myLocation: { connect: { id: locationId } } } : {}), // Connect to Location model
      ...(propertyTypeId ? { propertyType: { connect: { id: propertyTypeId } } } : {}), // Connect to PropertyType model
      ...(collectionId ? { Collection: { connect: { id: collectionId } } } : {}), // Connect to Collection model

      // — title & description —
      title: title || "New Name",
      description: description || "New Description",

      // — inventory & media —
      quantity: parsedQuantity,
      images: safeImages,
      video: video || null,

      // — category hierarchy & tagging —
      category: category || null, // Ensure null if not provided, matches model
      subCategory: safeSubCategory,
      subCategoryName: subCategoryName || null, // Ensure null if not provided
      tags: safeTags,

      // — branding & specs —
      brand: brand || null,
      model: model || null,
      color: safeColor,
      size: safeSize,
      weight: weight || null,
      condition: condition || null,
      dimension: dimension || null,
      material: safeMaterial,

      // — profit & pricing —
      profitMargin: parsedProfitMargin,
      discount: parsedDiscount,
      buyingPrice: parsedBuyingPrice,
      sellingPrice: parsedSellingPrice,
      finalPrice: calculatedFinalPrice, // Use calculated finalPrice

      // — deal scheduling —
      startDealDate: parsedStartDealDate,
      endDealDate: parsedEndDealDate,

      // — category-specific —
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
      expirationDate: parsedExpirationDate,

      // — flags —
      isAvailable: Boolean(isAvailable),
      isOnOffer: Boolean(isOnOffer),
      isFlashDeal: Boolean(isFlashDeal),
      isNewArrival: Boolean(isNewArrival),
      isDiscounted: Boolean(isDiscounted),
      isFeatured: Boolean(isFeatured),

      // — marketplace-specific —
      delivery: Boolean(delivery),
      paymentOption: paymentOption || "AT SHOP",
      showOnGhuba: showOnGhuba !== undefined ? Boolean(showOnGhuba) : true,

      // — contact & location —
      contact: contact || null,
      contactName: contactName || null,
      email: email || null,
      location: safeLocation, // JSON field for broader location data
      locationName: locationName || null,
      latitude: parsedLatitude,
      longitude: parsedLongitude,

      // — pricing breakdown —
      tax: parsedTax,
      shippingCost: parsedShippingCost,

      // — availability scheduling —
      availabilityStart: parsedAvailabilityStart,
      availabilityEnd: parsedAvailabilityEnd,

      // — amenities —
      amenities: safeAmenities,

      // — property-specific —
      bathrooms: bathrooms || null,
      area: area || null,
      bedrooms: safeBedrooms,
      studios: safeStudios,
      serviceSchedule: serviceSchedule || null,

      // — vehicle-specific —
      make: make || null,
      trim: trim || null,
      type: type || null,
      mileage: mileage || null,
      engineType: engineType || null,
      engineSize: engineSize || null,
      transmission: transmission || null,
      drivetrain: drivetrain || null,
      vin: vin || null,
      logbookStatus: logbookStatus || null,
      serviceHistory: serviceHistory || null,
      negotiable: Boolean(negotiable),
      financingAvailable: Boolean(financingAvailable),
      tradeIn: Boolean(tradeIn),

      // — digital goods —
      digitalUrl: digitalUrl || null,
      autoDeliver: Boolean(autoDeliver),

      // NEW SERVICE-SPECIFIC FIELDS
      bookingSlots: safeBookingSlots,
      minNoticePeriod: minNoticePeriod || null,
      maxBookingAhead: maxBookingAhead || null,
      pricingTiers: safePricingTiers,
      requiredClientInfo: safeRequiredClientInfo,
      fulfillmentStatus: fulfillmentStatus || null,
      totalCapacity: parsedTotalCapacity,
      currentBookedCount: parsedCurrentBookedCount, // Typically updated separately or calculated
      providerRating: parsedProviderRating, // Typically updated separately or calculated
      hourlyRate: parsedHourlyRate,
      minimumHours: parsedMinimumHours,
      deliveryMethod: deliveryMethod || null,

      // — admin/meta —
      status: status || "ACTIVE", // Use provided status or default
      // collectionId is already handled by connect relation
      
      // — timestamps —
      updatedAt: now,
    };

    // 7. Upsert within a transaction
    let marketplaceListing;
    await prisma.$transaction(async (tx) => {
      // Find an existing listing by ID if provided, or by companyId and productId
      // Prioritize `id` for updates
      const whereClause: any = {};
      if (id) {
        whereClause.id = id;
      } else {
        whereClause.companyId = companyId;
        // Optionally add productId here if a listing is uniquely identified by company + product
        // For services, `productId` might be null, so consider your unique constraint logic.
        // If `productId` is truly unique for a listing (even for services where it might be null),
        // you might still use it for uniqueness in combination with companyId.
        // For new service listings, `id` will be null, and you'd typically just create.
      }

      const existingListing = id ? await tx.marketplaceListing.findUnique({ where: { id } }) : null;
      // If no ID is provided for an update, or no existing listing found by ID,
      // consider if you need to find by other means (e.g., if a service can have multiple listings per company).
      // For a POST, it's generally a CREATE. If 'id' is present, it's an UPDATE.

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
        // Remove `id` from data when creating, as Prisma handles auto-generation
        const { id: _, ...createData } = commonData; 
        marketplaceListing = await tx.marketplaceListing.create({
          data: {
            ...createData,
            createdAt: now,
            // Ensure companyId is explicitly set for create if it's not part of the `connect` operation due to conditional logic
            companyId: companyId,
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
    
    // console.error("❌ Error processing marketplace listing:", error);
         return NextResponse.json(
            {
               message: "An error occurred while processing the marketplace listing.",
               // If 'error' has a 'code' property and you want to include it:
               code: error.code // Ensure 'error' object has a 'code' property
             },
             { status: 500 }
          );
          
  }
}