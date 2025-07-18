// app/api/admin/inventory/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const companyId = url.searchParams.get('companyId');
  const limit     = Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10));
  const page      = Math.max(1, parseInt(url.searchParams.get('page')  || '1', 10));

  if (!companyId) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
  }

  const skip = (page - 1) * limit;

  try {
    // Fetch all products for this company, including any inventory and nested relations
    const products = await prisma.product.findMany({
      where: { companyId },
      include: {
        inventoryItems: { include: { AgentInventory: true } },
        productCategory: { include: { StoreCategory: true } },
        CommissionRate: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const items = products.map((p) => {
      // find override category if exists
      const overrideCat = p.productCategory?.StoreCategory.find(
        (sc) => sc.companyId === p.companyId
      ) || null;

      // collect inventory IDs
      const inventoryIds = p.inventoryItems.map((inv) => inv.id);
      // aggregate stocks
      const companyStock = p.inventoryItems.reduce(
        (sum, inv) => sum + (inv.quantity || 0), 0
      );
      const agentStock = p.inventoryItems.reduce(
        (sum, inv) => sum + inv.AgentInventory.reduce(
          (aSum, ai) => aSum + (ai.quantity || 0), 0
        ), 0
      );

      // flatten full product schema
      const productItem = {
        id:                 p.id,
        companyId:          p.companyId!,
        name:               p.name,
        description:        p.description   || '',
        longDescription:    p.longDescription || '',
        tags:               p.tags,
        category:           overrideCat,
        subCategory:        p.subCategory   || null,
        subCategoryName:    p.subCategoryName || '',
        brand:              p.brand         || null,
        model:              p.model         || '',
        color:              p.color         || null,
        size:               p.size          || null,
        weight:             p.weight        || '',
        condition:          p.condition     || '',
        dimensions:         p.dimensions    || '',
        material:           p.material      || null,
        images:             p.images,
        video:              p.video         || null,
        digitalUrl:         p.digitalUrl    || '',
        autoDeliver:        p.autoDeliver   || false,
        isAvailable:        p.isAvailable   || false,
        isOnOffer:          p.isOnOffer     || false,
        isFlashDeal:        p.isFlashDeal   || false,
        isNewArrival:       p.isNewArrival  || false,
        isDiscounted:       p.isDiscounted  || false,
        isFeatured:         p.isFeatured    || false,
        costPrice:          p.costPrice     || 0,
        sellingPrice:       p.sellingPrice  || 0,
        discount:           p.discount      || 0,
        finalPrice:         p.finalPrice    || 0,
        profitMargin:       p.profitMargin  || 0,
        pricingTiers:       p.pricingTiers  || [],
        startDealDate:      p.startDealDate?.toISOString() || null,
        endDealDate:        p.endDealDate?.toISOString()   || null,
        commissionRate:     p.CommissionRate?.commissionRate || 0,
        commissionType:     p.CommissionRate?.commissionType || 'COST',
        // add any other custom fields here…

        // vehicle-specific
        make:               p.make             || '',
        trim:               p.trim             || '',
        type:               p.type             || '',
        mileage:            p.mileage          || '',
        engineType:         p.engineType       || '',
        engineSize:         p.engineSize       || 0,
        horsepower:         p.horsepower       || 0,
        torque:             p.torque           || 0,
        fuelType:           p.fuelType         || '',
        fuelEconomy:        p.fuelEconomy      || '',
        transmission:       p.transmission     || '',
        drivetrain:         p.drivetrain       || '',
        vin:                p.vin              || '',
        logbookStatus:      p.logbookStatus    || '',
        serviceHistory:     p.serviceHistory   || '',
        negotiable:         p.negotiable       || false,
        financingAvailable: p.financingAvailable || false,
        tradeIn:            p.tradeIn          || false,
        features:           p.features         || [],
        previousOwners:     p.previousOwners   || 0,
        tireCondition:      p.tireCondition    || '',
        accidentalHistory:  p.accidentalHistory|| null,
        // media & publishing
        author:             p.author           || '',
        publisher:          p.publisher        || '',
        isbn:               p.isbn             || '',
        // textile
        fabricComposition:  p.fabricComposition|| '',
        careInstructions:   p.careInstructions || '',
        // appliances & electronics
        energyRating:       p.energyRating     || '',
        warrantyPeriod:     p.warrantyPeriod   || '',
        applianceDimensions:p.applianceDimensions|| '',
        // consumables
        ingredients:        p.ingredients      || '',
        usageInstructions:  p.usageInstructions|| '',
        expirationDate:     p.expirationDate?.toISOString() || null,
        // real-estate
        bedrooms:           p.bedrooms         || 0,
        studios:            p.studios          || 0,
        bathrooms:          p.bathrooms        || 0,
        area:               p.area             || '',
        propertyTypeId:     p.propertyTypeId   || '',
        serviceSchedule:    p.serviceSchedule  || '',
        availabilityStart:  p.availabilityStart?.toISOString() || null,
        availabilityEnd:    p.availabilityEnd?.toISOString()   || null,
        location:           p.location         || {},
        locationName:       p.locationName     || '',
        latitude:           p.latitude         || 0,
        longitude:          p.longitude        || 0,
        contact:            p.contact          || '',
        contactName:        p.contactName      || '',
        email:              p.email            || '',
        status:             p.status           || '',
        collectionId:       p.collectionId     || '',
        // service bookings
        hourlyRate:         p.hourlyRate       || 0,
        minimumHours:       p.minimumHours     || 0,
        minNoticePeriod:    p.minNoticePeriod  || '',
        maxBookingAhead:    p.maxBookingAhead  || 0,
        totalCapacity:      p.totalCapacity    || 0,
        deliveryMethod:     p.deliveryMethod   || '',
        fulfillmentStatus:  p.fulfillmentStatus|| '',
        providerRating:     p.providerRating   || 0,
        bookingSlots:       p.bookingSlots     || [],
      };

      return {
        id:             p.id,
        name:           p.name,
        companyId:      p.companyId,
        inventoryIds,
        companyStock,
        agentStock,
        sales:          0,
        productItem,
        category:       overrideCat,
        costPrice:      p.costPrice,
        salesPrice:     p.sellingPrice,
      };
    });

    return NextResponse.json({
      data:   items,
      paging: { page, limit, total: items.length },
    });
  } catch (error) {
    console.error('GET inventory error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
