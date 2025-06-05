// File: /pages/api/product/route.ts  (or wherever your Next.js “/api/product” lives)

import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed

// POST /api/product
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      companyId,
      name,
      description,
      // Inventory / stock (if you added a scalar quantity)
      quantity,                 // Int?

      // Media
      images,                   // Json[] (array of URLs)
      video,                    // String?

      // Category hierarchy
      productCategoryId,        // String? @db.ObjectId
      category,                 // String?
      subCategory,              // Json? (e.g. { name: "...", ... })
      subCategoryName,          // String?

      // Tagging & branding
      tags,                     // String[]
      brand,                    // String?
      model,                    // String?

      // Basic specs
      color,                    // String[]
      size,                     // String[]
      weight,                   // String?
      condition,                // String?
      dimension,                // String?
      material,                 // String[]

      // Profit & pricing
      costPrice,                // Float
      salesPrice,               // Float
      finalPrice,               // Float?
      profitMargin,             // Float?

      discount,                 // Int?

      // Deal scheduling
      startDealDate,            // DateTime? (ISO string or null)
      endDealDate,              // DateTime? (ISO string or null)

      // Category‐specific
      author,                   // String? (Books)
      publisher,                // String? (Books)
      isbn,                     // String? (Books)

      fabricComposition,        // String? (Clothing)
      careInstructions,         // String? (Clothing)

      energyRating,             // String? (Appliances)
      warrantyPeriod,           // String? (Appliances)
      applianceDimensions,      // String? (Appliances)

      ingredients,              // String? (Beauty)
      usageInstructions,        // String? (Beauty)
      expirationDate,           // DateTime? (ISO string or null) (Beauty)

      // Flags
      isAvailable,              // Boolean
      isOnOffer,                // Boolean
      isFlashDeal,              // Boolean
      isNewArrival,             // Boolean
      isDiscounted,             // Boolean
      isFeatured,               // Boolean

      // Delivery & payment options (market‐specific, but stored on Product)
      delivery,                 // Boolean
      paymentOption,            // String?

      // Amenities
      amenities,                // String[]

      // Location & contact
      contact,                  // String?
      contactName,              // String?
      email,                    // String?
      location,                 // Json? (GeoJSON or whatever)
      locationId,               // String? @db.ObjectId
      locationName,             // String?
      latitude,                 // Float?
      longitude,                // Float?

      // Property‐specific
      propertyTypeId,           // String? @db.ObjectId
      bathrooms,                // String?
      area,                     // String?
      bedrooms,                 // Json?
      studios,                  // Json?
      serviceSchedule,          // String?

      // Vehicle‐specific
      make,                     // String?
      trim,                     // String?
      type,                     // String?
      mileage,                  // String?
      engineType,               // String?
      engineSize,               // String?
      transmission,             // String?
      drivetrain,               // String?
      vin,                      // String?
      logbookStatus,            // String?
      serviceHistory,           // String?
      negotiable,               // Boolean?
      financingAvailable,       // Boolean?
      tradeIn,                  // Boolean?

      // Digital goods
      digitalUrl,               // String?
      autoDeliver,              // Boolean?

      // “Admin” / meta
      status,                   // ListingStatus enum?
      collectionId,             // String? @db.ObjectId

      // Commission is handled separately (we’ll upsert a CommissionRate record below)
      commissionType,           // String
      commissionRate,           // Float
      commissionStartDate,      // DateTime? (ISO string or null)
      commissionEndDate,        // DateTime? (ISO string or null)
    } = body;

    // ———————————————
    // 1. Validate REQUIRED fields
    // ———————————————
    if (
      !name ||
      !companyId ||
      costPrice === undefined ||
      salesPrice === undefined ||
      commissionType === undefined ||
      commissionRate === undefined
    ) {
      return NextResponse.json(
        { message: "Missing required fields: name, companyId, costPrice, salesPrice, commissionType, commissionRate." },
        { status: 400 }
      );
    }

    // ———————————————
    // 2. Parse numeric values
    // ———————————————
    const parsedCostPrice = parseFloat(costPrice as any);
    const parsedSalesPrice = parseFloat(salesPrice as any);
    const parsedCommissionRate = parseFloat(commissionRate as any);
    let parsedProfitMargin = profitMargin !== undefined ? parseFloat(profitMargin as any) : 0;
    let parsedDiscount = discount !== undefined ? parseInt(discount as any, 10) : 0;

    if (
      isNaN(parsedCostPrice) ||
      isNaN(parsedSalesPrice) ||
      isNaN(parsedCommissionRate) ||
      (discount !== undefined && isNaN(parsedDiscount))
    ) {
      return NextResponse.json(
        { message: "Invalid number format for costPrice, salesPrice, commissionRate, or discount." },
        { status: 400 }
      );
    }

    // If profitMargin wasn't provided, recalc from cost/sales:
    if (profitMargin === undefined && parsedCostPrice > 0) {
      parsedProfitMargin = +(((parsedSalesPrice - parsedCostPrice) / parsedCostPrice) * 100).toFixed(1);
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
    // 4. Parse tags & arrays
    // ———————————————
    const parsedTags = Array.isArray(tags) ? tags : [];

    const parsedColor = Array.isArray(color) ? color : [];
    const parsedSize = Array.isArray(size) ? size : [];
    const parsedMaterial = Array.isArray(material) ? material : [];
    const parsedAmenities = Array.isArray(amenities) ? amenities : [];
    const parsedBedrooms = bedrooms || {};
    const parsedStudios = studios || {};

    // ———————————————
    // 5. Prepare location numbers
    // ———————————————
    const parsedLatitude = latitude !== undefined ? parseFloat(latitude as any) : undefined;
    const parsedLongitude = longitude !== undefined ? parseFloat(longitude as any) : undefined;

    // ———————————————
    // 6. Upsert (create or update) the Product record
    // ———————————————
    let productRecord;
    if (id) {
      // ——————— Update existing product ———————
      productRecord = await prisma.product.update({
        where: { id },
        data: {
          // — relations —
          productCategory: productCategoryId ? { connect: { id: productCategoryId } } : undefined,
          company: companyId ? { connect: { id: companyId } } : undefined,

          // — basic fields —
          name,
          description,
          // quantity: quantity !== undefined ? parseInt(quantity as any, 10) : undefined,

          // — media —
          images: Array.isArray(images) ? images : [],
          video: video || null,

          // — category hierarchy —
          category: category || "",
          subCategory: subCategory || {},
          subCategoryName: subCategoryName || "",
          tags: parsedTags,

          // — branding & specs —
          brand: brand || "",
          model: model || "",
          color: parsedColor,
          size: parsedSize,
          weight: weight || "",
          condition: condition || "",
          dimension: dimension || "",
          material: parsedMaterial,

          // — pricing —
          costPrice: parsedCostPrice,
          salesPrice: parsedSalesPrice,
          finalPrice: finalPrice !== undefined ? parseFloat(finalPrice as any) : parsedSalesPrice,
          profitMargin: parsedProfitMargin,
          discount: parsedDiscount,

          // — deal scheduling —
          startDealDate: parsedStartDealDate,
          endDealDate: parsedEndDealDate,

          // — category‐specific —
          author: author || "",
          publisher: publisher || "",
          isbn: isbn || "",
          fabricComposition: fabricComposition || "",
          careInstructions: careInstructions || "",
          energyRating: energyRating || "",
          warrantyPeriod: warrantyPeriod || "",
          applianceDimensions: applianceDimensions || "",
          ingredients: ingredients || "",
          usageInstructions: usageInstructions || "",
          expirationDate: parsedExpirationDate,

          // — flags —
          isAvailable: Boolean(isAvailable),
          isOnOffer: Boolean(isOnOffer),
          isFlashDeal: Boolean(isFlashDeal),
          isNewArrival: Boolean(isNewArrival),
          isDiscounted: Boolean(isDiscounted),
          isFeatured: Boolean(isFeatured),

          // — delivery & payment —
          delivery: Boolean(delivery),
          paymentOption: paymentOption || "AT SHOP",

          // — amenities —
          amenities: parsedAmenities,

          // — location & contact —
          contact: contact || "",
          contactName: contactName || "",
          email: email || "",
          location: location || {}, 
          locationId: locationId || undefined,
          locationName: locationName || "",
          latitude: isNaN(parsedLatitude ?? NaN) ? null : parsedLatitude,
          longitude: isNaN(parsedLongitude ?? NaN) ? null : parsedLongitude,

          // — property‐specific —
          propertyTypeId: propertyTypeId || undefined,
          bathrooms: bathrooms || "",
          area: area || "",
          bedrooms: parsedBedrooms,
          studios: parsedStudios,
          serviceSchedule: serviceSchedule || "",

          // — vehicle‐specific —
          make: make || "",
          trim: trim || "",
          type: type || "",
          mileage: mileage || "",
          engineType: engineType || "",
          engineSize: engineSize || "",
          transmission: transmission || "",
          drivetrain: drivetrain || "",
          vin: vin || "",
          logbookStatus: logbookStatus || "",
          serviceHistory: serviceHistory || "",
          negotiable: Boolean(negotiable),
          financingAvailable: Boolean(financingAvailable),
          tradeIn: Boolean(tradeIn),

          // — digital goods —
          digitalUrl: digitalUrl || "",
          autoDeliver: Boolean(autoDeliver),

          // — admin/meta —
          status: status || "ACTIVE",
          collectionId: collectionId || undefined,

          // — timestamps —
          updatedAt: new Date(),
        },
      });
    } else {
      // ——————— Create new product ———————
      productRecord = await prisma.product.create({
        data: {
          // — relations —
          productCategory: productCategoryId ? { connect: { id: productCategoryId } } : undefined,
          company: companyId ? { connect: { id: companyId } } : undefined,

          // — basic fields —
          name,
          description,
          // quantity: quantity !== undefined ? parseInt(quantity as any, 10) : 0,

          // — media —
          images: Array.isArray(images) ? images : [],
          video: video || null,

          // — category hierarchy —
          category: category || "",
          subCategory: subCategory || {},
          subCategoryName: subCategoryName || "",
          tags: parsedTags,

          // — branding & specs —
          brand: brand || "",
          model: model || "",
          color: parsedColor,
          size: parsedSize,
          weight: weight || "",
          condition: condition || "",
          dimension: dimension || "",
          material: parsedMaterial,

          // — pricing —
          costPrice: parsedCostPrice,
          salesPrice: parsedSalesPrice,
          finalPrice: finalPrice !== undefined ? parseFloat(finalPrice as any) : parsedSalesPrice,
          profitMargin: parsedProfitMargin,
          discount: parsedDiscount,

          // — deal scheduling —
          startDealDate: parsedStartDealDate,
          endDealDate: parsedEndDealDate,

          // — category‐specific —
          author: author || "",
          publisher: publisher || "",
          isbn: isbn || "",
          fabricComposition: fabricComposition || "",
          careInstructions: careInstructions || "",
          energyRating: energyRating || "",
          warrantyPeriod: warrantyPeriod || "",
          applianceDimensions: applianceDimensions || "",
          ingredients: ingredients || "",
          usageInstructions: usageInstructions || "",
          expirationDate: parsedExpirationDate,

          // — flags —
          isAvailable: Boolean(isAvailable),
          isOnOffer: Boolean(isOnOffer),
          isFlashDeal: Boolean(isFlashDeal),
          isNewArrival: Boolean(isNewArrival),
          isDiscounted: Boolean(isDiscounted),
          isFeatured: Boolean(isFeatured),

          // — delivery & payment —
          delivery: Boolean(delivery),
          paymentOption: paymentOption || "AT SHOP",

          // — amenities —
          amenities: parsedAmenities,

          // — location & contact —
          contact: contact || "",
          contactName: contactName || "",
          email: email || "",
          location: location || {},
          locationId: locationId || undefined,
          locationName: locationName || "",
          latitude: isNaN(parsedLatitude ?? NaN) ? null : parsedLatitude,
          longitude: isNaN(parsedLongitude ?? NaN) ? null : parsedLongitude,

          // — property‐specific —
          propertyTypeId: propertyTypeId || undefined,
          bathrooms: bathrooms || "",
          area: area || "",
          bedrooms: parsedBedrooms,
          studios: parsedStudios,
          serviceSchedule: serviceSchedule || "",

          // — vehicle‐specific —
          make: make || "",
          trim: trim || "",
          type: type || "",
          mileage: mileage || "",
          engineType: engineType || "",
          engineSize: engineSize || "",
          transmission: transmission || "",
          drivetrain: drivetrain || "",
          vin: vin || "",
          logbookStatus: logbookStatus || "",
          serviceHistory: serviceHistory || "",
          negotiable: Boolean(negotiable),
          financingAvailable: Boolean(financingAvailable),
          tradeIn: Boolean(tradeIn),

          // — digital goods —
          digitalUrl: digitalUrl || "",
          autoDeliver: Boolean(autoDeliver),

          // — admin/meta —
          status: status || "ACTIVE",
          collectionId: collectionId || undefined,

          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // ———————————————
    // 7. Upsert CommissionRate record
    // ———————————————
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
      { status: 201 }
    );
  } catch (error) {
    console.error("Product save error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
