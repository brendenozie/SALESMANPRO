import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// POST /api/product
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      companyId,
      name,
      description,
      longDescription, // New: Add longDescription
      quantity, // Int
      images, // Json[] (array of URLs)
      video, // String?
      productCategoryId, // String? @db.ObjectId
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
      dimensions, // Corrected: From dimension to dimensions
      material, // String[]
      costPrice, // Float
      sellingPrice, // Corrected: From salesPrice to sellingPrice
      finalPrice, // Float?
      profitMargin, // Float?
      discount, // Int?
      pricingTiers, // New: Json[]
      startDealDate, // DateTime? (ISO string or null)
      endDealDate, // DateTime? (ISO string or null)
      author, // String? (Books)
      publisher, // String? (Books)
      isbn, // String? (Books)
      fabricComposition, // String? (Clothing)
      careInstructions, // String? (Clothing)
      energyRating, // String? (Appliances)
      warrantyPeriod, // String? (Appliances)
      applianceDimensions, // String? (Appliances)
      ingredients, // String? (Beauty)
      usageInstructions, // String? (Beauty)
      expirationDate, // DateTime? (ISO string or null) (Beauty)
      isAvailable, // Boolean
      isOnOffer, // Boolean
      isFlashDeal, // Boolean
      isNewArrival, // Boolean
      isDiscounted, // Boolean
      isFeatured, // Boolean
      delivery, // Boolean
      paymentOption, // String?
      amenities, // String[]
      contact, // String?
      contactName, // String?
      email, // String?
      location, // Json?
      locationId, // String? @db.ObjectId
      locationName, // String?
      latitude, // Float?
      longitude, // Float?
      propertyTypeId, // String? @db.ObjectId
      bathrooms, // Int?
      area, // String?
      bedrooms, // Int?
      studios, // Int?
      serviceSchedule, // String?
      year, // New: Int? (e.g., vehicle year or service year)
      make, // String?
      trim, // String?
      type, // String?
      mileage, // String?
      engineType, // String?
      engineSize, // Float?
      horsepower, // New: Int?
      torque, // New: Int?
      fuelType, // New: String?
      fuelEconomy, // New: String?
      transmission, // String?
      drivetrain, // String?
      vin, // String?
      logbookStatus, // String?
      serviceHistory, // String?
      negotiable, // Boolean?
      financingAvailable, // Boolean?
      tradeIn, // Boolean?
      features, // New: Json[] (for vehicle features)
      previousOwners, // New: Int?
      tireCondition, // New: String?
      accidentalHistory, // New: Boolean?
      digitalUrl, // String?
      autoDeliver, // Boolean?
      status, // ListingStatus enum?
      collectionId, // String? @db.ObjectId

      // Commission fields (for CommissionRate model)
      commissionType, // String
      commissionRate, // Float
      commissionStartDate, // DateTime? (ISO string or null)
      commissionEndDate, // DateTime? (ISO string or null)

      // Service/Booking related fields
      hourlyRate,
      minimumHours,
      minNoticePeriod,
      maxBookingAhead,
      totalCapacity,
      deliveryMethod,
      fulfillmentStatus,
      providerRating,
      bookingSlots,
    } = body;

    // ———————————————
    // 1. Validate REQUIRED fields
    // ———————————————
    if (
      !name ||
      !companyId ||
      costPrice === undefined ||
      sellingPrice === undefined || // Corrected: sellingPrice
      commissionType === undefined ||
      commissionRate === undefined
    ) {
      return NextResponse.json(
        { message: "Missing required fields: name, companyId, costPrice, sellingPrice, commissionType, commissionRate." }, // Corrected message
        { status: 400 }
      );
    }

    // ———————————————
    // 2. Parse numeric values
    // ———————————————
    const parsedCostPrice = parseFloat(costPrice as any);
    const parsedSellingPrice = parseFloat(sellingPrice as any); // Corrected: sellingPrice
    const parsedCommissionRate = parseFloat(commissionRate as any);

    let parsedProfitMargin = profitMargin !== undefined ? parseFloat(profitMargin as any) : 0;
    let parsedDiscount = discount !== undefined ? parseInt(discount as any, 10) : 0;

    const parsedQuantity = quantity !== undefined ? parseInt(quantity as any, 10) : 1; // Corrected: parse quantity
    const parsedEngineSize = engineSize !== undefined ? parseFloat(engineSize as any) : null;
    const parsedHorsepower = horsepower !== undefined ? parseInt(horsepower as any, 10) : null;
    const parsedTorque = torque !== undefined ? parseInt(torque as any, 10) : null;
    const parsedPreviousOwners = previousOwners !== undefined ? parseInt(previousOwners as any, 10) : null;
    const parsedYear = year !== undefined ? parseInt(year as any, 10) : null;
    const parsedBathrooms = bathrooms !== undefined ? parseInt(bathrooms as any, 10) : null;
    const parsedBedrooms = bedrooms !== undefined ? parseInt(bedrooms as any, 10) : null;
    const parsedStudios = studios !== undefined ? parseInt(studios as any, 10) : null;
    const parsedHourlyRate = hourlyRate !== undefined ? parseFloat(hourlyRate as any) : null;
    const parsedMinimumHours = minimumHours !== undefined ? parseInt(minimumHours as any, 10) : null;
    const parsedTotalCapacity = totalCapacity !== undefined ? parseInt(totalCapacity as any, 10) : null;
    const parsedProviderRating = providerRating !== undefined ? parseFloat(providerRating as any) : null;


    if (
      isNaN(parsedCostPrice) ||
      isNaN(parsedSellingPrice) || // Corrected
      isNaN(parsedCommissionRate) ||
      (discount !== undefined && isNaN(parsedDiscount)) ||
      (quantity !== undefined && isNaN(parsedQuantity)) || // Validate quantity
      (engineSize !== undefined && isNaN(parsedEngineSize ?? NaN)) ||
      (horsepower !== undefined && isNaN(parsedHorsepower ?? NaN)) ||
      (torque !== undefined && isNaN(parsedTorque ?? NaN)) ||
      (previousOwners !== undefined && isNaN(parsedPreviousOwners ?? NaN)) ||
      (year !== undefined && isNaN(parsedYear ?? NaN)) ||
      (bathrooms !== undefined && isNaN(parsedBathrooms ?? NaN)) ||
      (bedrooms !== undefined && isNaN(parsedBedrooms ?? NaN)) ||
      (studios !== undefined && isNaN(parsedStudios ?? NaN)) ||
      (hourlyRate !== undefined && isNaN(parsedHourlyRate ?? NaN)) ||
      (minimumHours !== undefined && isNaN(parsedMinimumHours ?? NaN)) ||
      (totalCapacity !== undefined && isNaN(parsedTotalCapacity ?? NaN)) ||
      (providerRating !== undefined && isNaN(parsedProviderRating ?? NaN))
    ) {
      return NextResponse.json(
        { message: "Invalid number format for one or more numeric fields." },
        { status: 400 }
      );
    }

    // If profitMargin wasn't provided, recalc from cost/selling:
    if (profitMargin === undefined && parsedCostPrice > 0) {
      parsedProfitMargin = +(((parsedSellingPrice - parsedCostPrice) / parsedCostPrice) * 100).toFixed(1);
    }

    // ———————————————
    // 3. Parse dates
    // ———————————————
    const parsedStartDealDate = startDealDate ? new Date(startDealDate) : null;
    const parsedEndDealDate = endDealDate ? new Date(endDealDate) : null;
    const parsedExpirationDate = expirationDate ? new Date(expirationDate) : null;

    // Commission dates
    const parsedCommissionStart = commissionStartDate ? new Date(commissionStartDate) : new Date();
    const parsedCommissionEnd = commissionEndDate ? new Date(commissionEndDate) : null;

    // ———————————————
    // 4. Parse tags & arrays (ensure they are arrays, default to empty)
    // ———————————————
    const parsedTags = Array.isArray(tags) ? tags : [];
    const parsedColor = Array.isArray(color) ? color : [];
    const parsedSize = Array.isArray(size) ? size : [];
    const parsedMaterial = Array.isArray(material) ? material : [];
    const parsedAmenities = Array.isArray(amenities) ? amenities : [];
    const parsedFeatures = Array.isArray(features) ? features : []; // New: parse features
    const parsedPricingTiers = Array.isArray(pricingTiers) ? pricingTiers : []; // New: parse pricingTiers
    const parsedBookingSlots = Array.isArray(bookingSlots) ? bookingSlots : [];


    // ———————————————
    // 5. Prepare location numbers
    // ———————————————
    const parsedLatitude = latitude !== undefined ? parseFloat(latitude as any) : null; // Changed to null for prisma
    const parsedLongitude = longitude !== undefined ? parseFloat(longitude as any) : null; // Changed to null for prisma

    // ———————————————
    // 6. Upsert (create or update) the Product record
    // ———————————————
    let productRecord;
    const productData = {
      // — relations —
      productCategory: productCategoryId ? { connect: { id: productCategoryId } } : undefined,
      company: companyId ? { connect: { id: companyId } } : undefined,
      myLocation: locationId ? { connect: { id: locationId } } : undefined, // Connect location

      // — basic fields —
      name,
      description,
      longDescription: longDescription || null, // New: Add longDescription
      quantity: parsedQuantity, // Use parsed quantity

      // — media —
      images: Array.isArray(images) ? images : [],
      video: video || null,

      // — category hierarchy —
      category: category || null,
      subCategory: subCategory || null,
      subCategoryName: subCategoryName || null,
      tags: parsedTags,

      // — branding & specs —
      brand: brand || null,
      model: model || null,
      color: parsedColor,
      size: parsedSize,
      weight: weight || null,
      condition: condition || null,
      dimensions: dimensions || null, // Corrected: dimensions
      material: parsedMaterial,

      // — pricing —
      costPrice: parsedCostPrice,
      sellingPrice: parsedSellingPrice, // Corrected: sellingPrice
      finalPrice: finalPrice !== undefined ? parseFloat(finalPrice as any) : parsedSellingPrice,
      profitMargin: parsedProfitMargin,
      discount: parsedDiscount,
      pricingTiers: parsedPricingTiers, // New: Add pricingTiers

      // — deal scheduling —
      startDealDate: parsedStartDealDate,
      endDealDate: parsedEndDealDate,

      // — category‐specific —
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
      isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true, // Default to true if not provided
      isOnOffer: typeof isOnOffer === 'boolean' ? isOnOffer : false,
      isFlashDeal: typeof isFlashDeal === 'boolean' ? isFlashDeal : false,
      isNewArrival: typeof isNewArrival === 'boolean' ? isNewArrival : false,
      isDiscounted: typeof isDiscounted === 'boolean' ? isDiscounted : false,
      isFeatured: typeof isFeatured === 'boolean' ? isFeatured : false,

      // — delivery & payment —
      delivery: typeof delivery === 'boolean' ? delivery : false,
      paymentOption: paymentOption || "AT SHOP",

      // — amenities —
      amenities: parsedAmenities,

      // — location & contact —
      contact: contact || null,
      contactName: contactName || null,
      email: email || null,
      location: location || null, // Storing JSON directly
      locationName: locationName || null,
      latitude: parsedLatitude,
      longitude: parsedLongitude,

      // — property‐specific —
      propertyType: propertyTypeId ? { connect: { id: propertyTypeId } } : undefined, // Connect propertyType
      bathrooms: parsedBathrooms, // Use parsed number
      area: area || null,
      bedrooms: parsedBedrooms, // Use parsed number
      studios: parsedStudios, // Use parsed number
      serviceSchedule: serviceSchedule || null,

      // — year & scheduling —
      year: parsedYear, // New: Add year
      // Note: availabilityStart and availabilityEnd are not in the current Product model fields
      // If you've added them to Product schema, include them here:
      // availabilityStart: parsedAvailabilityStart,
      // availabilityEnd: parsedAvailabilityEnd,

      // — vehicle‐specific —
      make: make || null,
      trim: trim || null,
      type: type || null,
      mileage: mileage || null,
      engineType: engineType || null,
      engineSize: parsedEngineSize,
      horsepower: parsedHorsepower, // New: Add horsepower
      torque: parsedTorque, // New: Add torque
      fuelType: fuelType || null, // New: Add fuelType
      fuelEconomy: fuelEconomy || null, // New: Add fuelEconomy
      transmission: transmission || null,
      drivetrain: drivetrain || null,
      vin: vin || null,
      logbookStatus: logbookStatus || null,
      serviceHistory: serviceHistory || null,
      negotiable: typeof negotiable === 'boolean' ? negotiable : false,
      financingAvailable: typeof financingAvailable === 'boolean' ? financingAvailable : false,
      tradeIn: typeof tradeIn === 'boolean' ? tradeIn : false,
      features: parsedFeatures, // New: Add features

      // — ownership & pricing (new) —
      previousOwners: parsedPreviousOwners, // New: Add previousOwners
      tireCondition: tireCondition || null, // New: Add tireCondition
      accidentalHistory: typeof accidentalHistory === 'boolean' ? accidentalHistory : false, // New: Add accidentalHistory

      // — digital goods —
      digitalUrl: digitalUrl || null,
      autoDeliver: typeof autoDeliver === 'boolean' ? autoDeliver : false,

      // — service/booking related —
      hourlyRate: parsedHourlyRate,
      minimumHours: parsedMinimumHours,
      minNoticePeriod: minNoticePeriod || null,
      maxBookingAhead: maxBookingAhead || null,
      totalCapacity: parsedTotalCapacity,
      deliveryMethod: deliveryMethod || null,
      fulfillmentStatus: fulfillmentStatus || null,
      providerRating: parsedProviderRating,
      bookingSlots: parsedBookingSlots,

      // — admin/meta —
      status: status || "ACTIVE",
      collection: collectionId ? { connect: { id: collectionId } } : undefined, // Connect collection

      // — timestamps —
      updatedAt: new Date(),
    };

    if (id) {
      // ——————— Update existing product ———————
      productRecord = await prisma.product.update({
        where: { id },
        data: productData,
      });
    } else {
      // ——————— Create new product ———————
      productRecord = await prisma.product.create({
        data: {
          ...productData,
          createdAt: new Date(), // Set createdAt only on creation
        },
      });
    }

    // ———————————————
    // 7. Upsert CommissionRate record (if CommissionRate is a separate model linked to Product)
    // ———————————————
    // Ensure CommissionRate model in schema has `productId String @unique @db.ObjectId`
    // and `product Product @relation(fields: [productId], references: [id])`
    const commissionRateRecord = await prisma.commissionRate.upsert({
      where: { productId: productRecord.id },
      update: {
        commissionType,
        commissionRate: parsedCommissionRate,
        startDate: parsedCommissionStart,
        endDate: parsedCommissionEnd,
      },
      create: {
        productId: productRecord.id,
        commissionType,
        commissionRate: parsedCommissionRate,
        startDate: parsedCommissionStart,
        endDate: parsedCommissionEnd,
      },
    });

    return NextResponse.json(
      { product: productRecord, commissionRate: commissionRateRecord },
      { status: productRecord ? 200 : 201 } // Return 200 for update, 201 for create
    );
  } catch (error) {
    console.error("Product save error:", error);
    // More specific error handling could be added here based on error type
    return NextResponse.json(
      { message: "Failed to process product. Internal server error." },
      { status: 500 }
    );
  }
}