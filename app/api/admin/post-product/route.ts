import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/product/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";
import { publishProductToMarketplace, syncApprovedSharedFields } from "@/lib/marketplace/publicationService";


// ----------------- Utils -----------------
const parseJsonSafely = (data: any, fallback: any = null) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
};

const normalizeArray = (val: any): any[] =>
  Array.isArray(val) ? val : val ? [val] : [];

const parseDate = (val: any): Date | null => {
  if (typeof val === "string" && !isNaN(Date.parse(val))) {
    return new Date(val);
  }
  return null;
};

const parseNumber = (
  val: any,
  fallback: number | null = null,
): number | null => {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};


// POST or PUT /api/admin/post-product
async function handlePost(req: Request, context: any) {
  const body = await req.json();
  const {
    id,
    publishToMarketplace,
    // Basic
    companyId: bodyCompanyId,
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
    companyStock,
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
    option,
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
    supplierId,
    supplierName,
  } = body;

  // Determine authoritative companyId
  const authCompanyRes = await resolveAuthorizedCompany(
    context?.user || context,
    bodyCompanyId || context?.companyId,
  );
  if (!authCompanyRes.authorized || !authCompanyRes.companyId) {
    return formatResponse(
      false,
      null,
      authCompanyRes.error || "Unauthorized company access",
      authCompanyRes.status || 403,
    );
  }
  const companyId = authCompanyRes.companyId;

  // Determine the true productCategoryId
  const productCategoryId =
    rawProductCategoryId || rawCategory?.categoryId || null;

  // If updating, verify ownership first (IDOR check) and fetch existing product for fallback
  let existingProduct: any = null;
  if (id) {
    existingProduct = await prisma.product.findFirst({
      where: { id, companyId },
    });
    if (!existingProduct) {
      return formatResponse(false, null, "Product not found or not owned by this company.", 404);
    }
  }

  // Fallback to existing product values if updating
  const effectiveName = name || existingProduct?.name;
  const effectiveCostPrice = costPrice != null ? costPrice : existingProduct?.costPrice;
  const effectiveSellingPrice = sellingPrice != null ? sellingPrice : existingProduct?.sellingPrice;

  // Basic validation
  if (!effectiveName || effectiveCostPrice == null || effectiveSellingPrice == null) {
    return formatResponse(false, null, "Missing required fields: name, costPrice, sellingPrice.", 400);
  }

  // Parse primitives
  const rawQuantityVal = companyStock != null ? companyStock : quantity;
  const parsedQuantity =
    rawQuantityVal != null
      ? parseInt(rawQuantityVal as any, 10)
      : (existingProduct?.quantity ?? 1);
  const parsedCostPrice = parseFloat(effectiveCostPrice as any);
  const parsedSellingPrice = parseFloat(effectiveSellingPrice as any);
  const parsedFinalPrice =
    finalPrice != null ? parseFloat(finalPrice as any) : (existingProduct?.finalPrice ?? parsedSellingPrice);
  const parsedProfitMargin =
    profitMargin != null ? parseFloat(profitMargin as any) : (existingProduct?.profitMargin ?? undefined);
  const parsedDiscount = discount != null ? parseInt(discount as any, 10) : (existingProduct?.discount ?? 0);
  const parsedEngineSize =
    engineSize != null ? parseFloat(engineSize as any) : (existingProduct?.engineSize ?? null);
  const parsedHorsepower =
    horsepower != null ? parseInt(horsepower as any, 10) : (existingProduct?.horsepower ?? null);
  const parsedTorque = torque != null ? parseInt(torque as any, 10) : (existingProduct?.torque ?? null);
  const parsedYear = year != null ? parseInt(year as any, 10) : (existingProduct?.year ?? null);
  const parsedBathrooms =
    bathrooms != null ? parseInt(bathrooms as any, 10) : (existingProduct?.bathrooms ?? null);
  const parsedBedrooms = bedrooms != null ? bedrooms : (existingProduct?.bedrooms ?? null);
  const parsedStudios = studios != null ? studios : (existingProduct?.studios ?? null);
  const parsedLatitude = latitude != null ? parseFloat(latitude as any) : (existingProduct?.latitude ?? null);
  const parsedLongitude =
    longitude != null ? parseFloat(longitude as any) : (existingProduct?.longitude ?? null);
  const parsedHourlyRate =
    hourlyRate != null ? parseFloat(hourlyRate as any) : (existingProduct?.hourlyRate ?? null);
  const parsedMinimumHours =
    minimumHours != null ? parseInt(minimumHours as any, 10) : (existingProduct?.minimumHours ?? null);
  const parsedTotalCapacity =
    totalCapacity != null ? parseInt(totalCapacity as any, 10) : (existingProduct?.totalCapacity ?? null);
  const parsedProviderRating =
    providerRating != null ? parseFloat(providerRating as any) : (existingProduct?.providerRating ?? null);

  // Parse arrays
  const parsedTags = tags !== undefined ? (Array.isArray(tags) ? tags : []) : (existingProduct?.tags || []);
  const parsedOption = option !== undefined ? normalizeArray(option) : (existingProduct?.option || []);
  const parsedImages = images !== undefined ? (Array.isArray(images) ? images : []) : (existingProduct?.images || []);
  const parsedVideos = videos !== undefined ? (Array.isArray(videos) ? videos : []) : (existingProduct?.videos || []);
  const parsedColor = color !== undefined ? (Array.isArray(color) ? color : []) : (existingProduct?.color || []);
  const parsedSize = size !== undefined ? (Array.isArray(size) ? size : []) : (existingProduct?.size || []);
  const parsedMaterial = material !== undefined ? (Array.isArray(material) ? material : []) : (existingProduct?.material || []);
  const parsedFeatures = features !== undefined ? (Array.isArray(features) ? features : []) : (existingProduct?.features || []);
  const parsedPricingTiers = pricingTiers !== undefined ? (Array.isArray(pricingTiers) ? pricingTiers : []) : (existingProduct?.pricingTiers || []);
  const parsedBookingSlots = bookingSlots !== undefined ? (Array.isArray(bookingSlots) ? bookingSlots : []) : (existingProduct?.bookingSlots || []);

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
  const parsedExpirationDate = expirationDate ? new Date(expirationDate) : null;

  // Construct upsert data
  // const data : any =
  // Create or update
  const product = id
    ? await prisma.product.update({
        where: { id },
        data: {
          company: { connect: { id: companyId } },
          name: effectiveName,
          description: description !== undefined ? (description || null) : (existingProduct?.description ?? null),
          longDescription: parsedLongDesc !== null ? parsedLongDesc : (existingProduct?.longDescription ?? null),
          tags: parsedTags,
          images: parsedImages,
          videos: parsedVideos || null,
          productCategory: productCategoryId
            ? { connect: { id: productCategoryId } }
            : undefined,
          category: rawCategory?.displayName || (category !== undefined ? category : existingProduct?.category) || null,
          subCategory: subCategory !== undefined ? subCategory : (existingProduct?.subCategory ?? null),
          subCategoryName: subCategoryName !== undefined ? subCategoryName : (existingProduct?.subCategoryName ?? null),
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
          option: parsedOption,
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
          supplier: supplierId ? { connect: { id: supplierId } } : undefined,
          supplierName: supplierName !== undefined ? (supplierName || null) : undefined,
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
          supplier: supplierId ? { connect: { id: supplierId } } : undefined,
          supplierName: supplierName || null,
        },
      });

  // Synchronize internal inventory holding item
  if (rawQuantityVal != null) {
    try {
      const inv = await prisma.inventoryItem.findFirst({
        where: { productId: product.id },
      });
      if (inv) {
        await prisma.inventoryItem.update({
          where: { id: inv.id },
          data: { quantity: parsedQuantity },
        });
      } else {
        await prisma.inventoryItem.create({
          data: {
            product: { connect: { id: product.id } },
            company: { connect: { id: companyId } },
            quantity: parsedQuantity,
            reorderThreshold: 10,
          },
        });
      }
    } catch (invErr) {
      console.warn("[POST_PRODUCT_INVENTORY_SYNC_ERROR]", invErr);
    }
  }

  // Controlled marketplace publication & shared spec synchronization
  try {
    if (publishToMarketplace) {
      await publishProductToMarketplace(product.id);
    } else if (id) {
      await syncApprovedSharedFields(product.id);
    }
  } catch (syncErr) {
    console.warn("[POST_PRODUCT_MARKETPLACE_SYNC_ERROR]", syncErr);
  }

  try {
    await cacheDel(`tenant:${companyId}:post-product:*`);
    await cacheDel(`admin:post-product:*`);
  } catch (e) {}
  return formatResponse(
    true,
    product,
    "Product saved successfully.",
    id ? 200 : 201,
  );
}

export const POST = withApiHandler(handlePost, {
  requireAuth: true,
  requireTenant: true,
  allowedRoles: ["SUPER_ADMIN", "ADMIN", "COMPANY_ADMIN", "MANAGER"],
});
