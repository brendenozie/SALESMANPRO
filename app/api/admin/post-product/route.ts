import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/product/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";


// POST or PUT /api/product
async function handlePost(req: Request) {

  const body = await req.json();
  const {
    id,
    // Basic
    companyId,
    name,
    description,
    longDescription,
    tags,
    // Media
    images,
    videos,
    // Category
    productCategoryId: rawProductCategoryId,
    category: rawCategory,
    subCategory,
    subCategoryName,
    // Inventory & Pricing
    quantity,
    costPrice,
    sellingPrice,
    finalPrice,
    profitMargin,
    discount,
    pricingTiers,
    // Deals
    isOnOffer,
    isFlashDeal,
    isDiscounted,
    isNewArrival,
    isFeatured,
    startDealDate,
    endDealDate,
    // Specifications
    brand,
    model,
    color,
    size,
    weight,
    condition,
    dimensions,
    material,
    // Vehicle specifics
    year,
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
    // Book specifics
    author,
    publisher,
    isbn,
    // Fashion specifics
    fabricComposition,
    careInstructions,
    // Appliance specifics
    energyRating,
    warrantyPeriod,
    applianceDimensions,
    // Beauty specifics
    ingredients,
    usageInstructions,
    expirationDate,
    // Property specifics
    propertyTypeId,
    bathrooms,
    area,
    bedrooms,
    studios,
    serviceSchedule,
    availabilityStart,
    availabilityEnd,
    // Location & contact
    location,
    locationName,
    latitude,
    longitude,
    contact,
    contactName,
    email,
    // Marketplace & fulfillment
    delivery,
    paymentOption,
    showOnGhuba,
    digitalUrl,
    autoDeliver,
    hourlyRate,
    minimumHours,
    minNoticePeriod,
    maxBookingAhead,
    totalCapacity,
    deliveryMethod,
    fulfillmentStatus,
    providerRating,
    bookingSlots,
    // Collections & status
    collectionId,
    status,
    // Defaults & legacy
    tax,
    shippingCost,
    locationId,

    category,
    isAvailable,
    amenities,

    // Commission fields
    commissionType,
    commissionRate,
    commissionStartDate,
    commissionEndDate,

    listingMarketStatus,
    listingSystemStatus,
    listingTransactionType,
  } = body;

  // Determine the true productCategoryId
  const productCategoryId =
    rawProductCategoryId || rawCategory?.categoryId || null;

  // Basic validation
  if (!name || !companyId || costPrice == null || sellingPrice == null) {
    return formatResponse(false, null, "Missing required fields.", 400);
  }

  // Parse primitives
  const parsedQuantity = quantity != null ? parseInt(quantity as any, 10) : 1;
  const parsedCostPrice = parseFloat(costPrice as any);
  const parsedSellingPrice = parseFloat(sellingPrice as any);
  const parsedFinalPrice =
    finalPrice != null ? parseFloat(finalPrice as any) : parsedSellingPrice;
  const parsedProfitMargin =
    profitMargin != null ? parseFloat(profitMargin as any) : undefined;
  const parsedDiscount =
    discount != null ? parseInt(discount as any, 10) : 0;
  const parsedEngineSize =
    engineSize != null ? parseFloat(engineSize as any) : null;
  const parsedHorsepower =
    horsepower != null ? parseInt(horsepower as any, 10) : null;
  const parsedTorque =
    torque != null ? parseInt(torque as any, 10) : null;
  const parsedYear = year != null ? parseInt(year as any, 10) : null;
  const parsedBathrooms =
    bathrooms != null ? parseInt(bathrooms as any, 10) : null;
  const parsedBedrooms =  bedrooms != null ? bedrooms: null;
  const parsedStudios =  studios != null ? studios : null;
  const parsedLatitude =
    latitude != null ? parseFloat(latitude as any) : null;
  const parsedLongitude =
    longitude != null ? parseFloat(longitude as any) : null;
  const parsedHourlyRate =
    hourlyRate != null ? parseFloat(hourlyRate as any) : null;
  const parsedMinimumHours =
    minimumHours != null ? parseInt(minimumHours as any, 10) : null;
  const parsedTotalCapacity =
    totalCapacity != null ? parseInt(totalCapacity as any, 10) : null;
  const parsedProviderRating =
    providerRating != null ? parseFloat(providerRating as any) : null;

  // Parse arrays
  const parsedTags = Array.isArray(tags) ? tags : [];
  const parsedImages = Array.isArray(images) ? images : [];
  const parsedVideos = Array.isArray(videos) ? videos : [];
  const parsedColor = Array.isArray(color) ? color : [];
  const parsedSize = Array.isArray(size) ? size : [];
  const parsedMaterial = Array.isArray(material) ? material : [];
  const parsedFeatures = Array.isArray(features) ? features : [];
  const parsedPricingTiers = Array.isArray(pricingTiers) ? pricingTiers : [];
  const parsedBookingSlots = Array.isArray(bookingSlots) ? bookingSlots : [];

  // Parse dates
  const parsedLongDesc = longDescription || null;
  const parsedStartDealDate = startDealDate ? new Date(startDealDate) : null;
  const parsedEndDealDate = endDealDate ? new Date(endDealDate) : null;
  const parsedAvailabilityStart = availabilityStart
    ? new Date(availabilityStart)
    : null;
  const parsedAvailabilityEnd = availabilityEnd
    ? new Date(availabilityEnd)
    : null;
  const parsedExpirationDate = expirationDate
    ? new Date(expirationDate)
    : null;

  // Construct upsert data
  // const data : any = 
  // Create or update
  const product = id
    ? await prisma.product.update({
        where: { id },
        data: {
          company: { connect: { id: companyId } },
          name,
          description: description || null,
          longDescription: parsedLongDesc,
          tags: parsedTags,
          images: parsedImages,
          videos: parsedVideos || null,
          productCategory: productCategoryId
            ? { connect: { id: productCategoryId } }
            : undefined,
          category: rawCategory?.displayName || null,
          subCategory,
          subCategoryName,
          quantity: parsedQuantity,
          costPrice: parsedCostPrice,
          sellingPrice: parsedSellingPrice,
          finalPrice: parsedFinalPrice,
          profitMargin: parsedProfitMargin,
          discount: parsedDiscount,
          pricingTiers: parsedPricingTiers,
          isOnOffer: !!isOnOffer,
          isFlashDeal: !!isFlashDeal,
          isDiscounted: !!isDiscounted,
          isNewArrival: !!isNewArrival,
          isFeatured: !!isFeatured,
          startDealDate: parsedStartDealDate,
          endDealDate: parsedEndDealDate,
          brand: brand || null,
          model: model || null,
          color: parsedColor,
          size: parsedSize,
          weight: weight || null,
          condition: condition || null,
          dimensions: dimensions || null,
          material: parsedMaterial,
          // Vehicle
          year: parsedYear,
          make: make || null,
          trim: trim || null,
          type: type || null,
          mileage: mileage || null,
          engineType: engineType || null,
          engineSize: parsedEngineSize,
          horsepower: parsedHorsepower,
          torque: parsedTorque,
          fuelType: fuelType || null,
          fuelEconomy: fuelEconomy || null,
          transmission: transmission || null,
          drivetrain: drivetrain || null,
          vin: vin || null,
          logbookStatus: logbookStatus || null,
          serviceHistory: serviceHistory || null,
          negotiable: !!negotiable,
          financingAvailable: !!financingAvailable,
          tradeIn: !!tradeIn,
          features: parsedFeatures,
          previousOwners,
          tireCondition: tireCondition || null,
          accidentalHistory: !!accidentalHistory,
          // Book
          author: author || null,
          publisher: publisher || null,
          isbn: isbn || null,
          // Fashion
          fabricComposition: fabricComposition || null,
          careInstructions: careInstructions || null,
          // Appliance
          energyRating: energyRating || null,
          warrantyPeriod: warrantyPeriod || null,
          applianceDimensions: applianceDimensions || null,
          // Beauty
          ingredients: ingredients || null,
          usageInstructions: usageInstructions || null,
          expirationDate: parsedExpirationDate,
          // Property
          propertyType: propertyTypeId
            ? { connect: { id: propertyTypeId } }
            : undefined,
          bathrooms: parsedBathrooms != null ? String(parsedBathrooms) : null,
          area: area || null,
          bedrooms:
            parsedBedrooms !== null && parsedBedrooms !== undefined
              ? [parsedBedrooms]
              : undefined,
          studios:
            parsedStudios !== null && parsedStudios !== undefined
              ? [parsedStudios]
              : undefined,
          serviceSchedule: serviceSchedule || null,
          availabilityStart: parsedAvailabilityStart,
          availabilityEnd: parsedAvailabilityEnd,
          // Location & contact
          location: location || null,
          locationName: locationName || null,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          contact: contact || null,
          contactName: contactName || null,
          email: email || null,
          locationId: locationId || undefined,
          // Marketplace & fulfillment
          delivery: !!delivery,
          paymentOption: paymentOption || "AT SHOP",
          showOnGhuba: !!showOnGhuba,
          digitalUrl: digitalUrl || null,
          autoDeliver: !!autoDeliver,
          hourlyRate: parsedHourlyRate,
          minimumHours: parsedMinimumHours,
          minNoticePeriod: minNoticePeriod || null,
          maxBookingAhead: maxBookingAhead || null,
          totalCapacity: parsedTotalCapacity,
          deliveryMethod: deliveryMethod || null,
          fulfillmentStatus: fulfillmentStatus || null,
          providerRating: parsedProviderRating,
          bookingSlots: parsedBookingSlots,
          Collection: collectionId
            ? { connect: { id: collectionId } }
            : undefined,
          status: status || "ACTIVE",
          tax: tax != null ? parseFloat(tax as any) : 0,
          shippingCost:
            shippingCost != null ? parseFloat(shippingCost as any) : 0,
          updatedAt: new Date(),

          listingMarketStatus,
          listingSystemStatus,
          listingTransactionType,
        },
      })
    : await prisma.product.create({
        data: {
          company: { connect: { id: companyId } },
          name,
          description: description || null,
          longDescription: parsedLongDesc,
          tags: parsedTags,
          images: parsedImages,
          videos: parsedVideos || null,
          productCategory: productCategoryId
            ? { connect: { id: productCategoryId } }
            : undefined,
          category: rawCategory?.displayName || null,
          subCategory,
          subCategoryName,
          quantity: parsedQuantity,
          costPrice: parsedCostPrice,
          sellingPrice: parsedSellingPrice,
          finalPrice: parsedFinalPrice,
          profitMargin: parsedProfitMargin,
          discount: parsedDiscount,
          pricingTiers: parsedPricingTiers,
          isOnOffer: !!isOnOffer,
          isFlashDeal: !!isFlashDeal,
          isDiscounted: !!isDiscounted,
          isNewArrival: !!isNewArrival,
          isFeatured: !!isFeatured,
          startDealDate: parsedStartDealDate,
          endDealDate: parsedEndDealDate,
          brand: brand || null,
          model: model || null,
          color: parsedColor,
          size: parsedSize,
          weight: weight || null,
          condition: condition || null,
          dimensions: dimensions || null,
          material: parsedMaterial,
          // Vehicle
          year: parsedYear,
          make: make || null,
          trim: trim || null,
          type: type || null,
          mileage: mileage || null,
          engineType: engineType || null,
          engineSize: parsedEngineSize,
          horsepower: parsedHorsepower,
          torque: parsedTorque,
          fuelType: fuelType || null,
          fuelEconomy: fuelEconomy || null,
          transmission: transmission || null,
          drivetrain: drivetrain || null,
          vin: vin || null,
          logbookStatus: logbookStatus || null,
          serviceHistory: serviceHistory || null,
          negotiable: !!negotiable,
          financingAvailable: !!financingAvailable,
          tradeIn: !!tradeIn,
          features: parsedFeatures,
          previousOwners,
          tireCondition: tireCondition || null,
          accidentalHistory: !!accidentalHistory,
          // Book
          author: author || null,
          publisher: publisher || null,
          isbn: isbn || null,
          // Fashion
          fabricComposition: fabricComposition || null,
          careInstructions: careInstructions || null,
          // Appliance
          energyRating: energyRating || null,
          warrantyPeriod: warrantyPeriod || null,
          applianceDimensions: applianceDimensions || null,
          // Beauty
          ingredients: ingredients || null,
          usageInstructions: usageInstructions || null,
          expirationDate: parsedExpirationDate,
          // Property
          propertyType: propertyTypeId
            ? { connect: { id: propertyTypeId } }
            : undefined,
          bathrooms: parsedBathrooms != null ? String(parsedBathrooms) : null,
          area: area || null,
          bedrooms:
            parsedBedrooms !== null && parsedBedrooms !== undefined
              ? [parsedBedrooms]
              : undefined,
          studios:
            parsedStudios !== null && parsedStudios !== undefined
              ? [parsedStudios]
              : undefined,
          serviceSchedule: serviceSchedule || null,
          availabilityStart: parsedAvailabilityStart,
          availabilityEnd: parsedAvailabilityEnd,
          // Location & contact
          location: location || null,
          locationName: locationName || null,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          contact: contact || null,
          contactName: contactName || null,
          email: email || null,
          locationId: locationId || undefined,
          // Marketplace & fulfillment
          delivery: !!delivery,
          paymentOption: paymentOption || "AT SHOP",
          showOnGhuba: !!showOnGhuba,
          digitalUrl: digitalUrl || null,
          autoDeliver: !!autoDeliver,
          hourlyRate: parsedHourlyRate,
          minimumHours: parsedMinimumHours,
          minNoticePeriod: minNoticePeriod || null,
          maxBookingAhead: maxBookingAhead || null,
          totalCapacity: parsedTotalCapacity,
          deliveryMethod: deliveryMethod || null,
          fulfillmentStatus: fulfillmentStatus || null,
          providerRating: parsedProviderRating,
          bookingSlots: parsedBookingSlots,
          Collection: collectionId
            ? { connect: { id: collectionId } }
            : undefined,
          status: status || "ACTIVE",
          tax: tax != null ? parseFloat(tax as any) : 0,
          shippingCost:
            shippingCost != null ? parseFloat(shippingCost as any) : 0,
          updatedAt: new Date(),
          createdAt: new Date(),

          listingMarketStatus,
          listingSystemStatus,
          listingTransactionType,
        },
      });

  
    try { await cacheDel(`admin:post-product:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, product, "Product saved successfully.", id ? 200 : 201);
}

export const POST = withApiHandler(handlePost);
