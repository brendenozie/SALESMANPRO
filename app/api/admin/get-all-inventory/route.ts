import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const limit     = Math.max(1, parseInt(searchParams.get('limit') || '50', 10));
  const page      = Math.max(1, parseInt(searchParams.get('page')  || '1',   10));
  if (!companyId) {
    return NextResponse.json({ message: 'Missing companyId' }, { status: 400 });
  }
  const skip = (page - 1) * limit;

  try {
    // 1) Fetch ALL products for this company, including any inventoryItems (0..n)
    const products = await prisma.product.findMany({
      where: { companyId },
      include: {
        inventoryItems: {
          include: { AgentInventory: true },
        },
        productCategory: {
          include: { StoreCategory: true },
        },
        CommissionRate: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // 2) Map into your InventoryItem shape
    const result = products.map((p) => {
      // Collect inventoryItem IDs
      const inventoryIds = p.inventoryItems.map((inv) => inv.id);

      // Sum company stock (sum of inventoryItems.quantity)
      const companyStock = p.inventoryItems.reduce(
        (sum, inv) => sum + (inv.quantity || 0),
        0
      );

      // Sum agent stock (sum of each inventoryItems.AgentInventory.quantity)
      const agentStock = p.inventoryItems.reduce(
        (sum, inv) =>
          sum +
          inv.AgentInventory.reduce((aSum, ai) => aSum + (ai.quantity || 0), 0),
        0
      );

      // Pick the store‑override category (if any)
      const category = p.productCategory?.StoreCategory.find(
        (sc) => sc.companyId === p.companyId
      ) || null;

      return {
        id:             p.id,
        name:           p.name,
        companyId:      p.companyId!,
        productItem:    p,           // full Prisma Product row (all fields + nested)
        inventoryIds,               // [] when no inventory exists
        category,                   // null when no StoreCategory override
        agentStock,                 // 0 when no AgentInventory
        companyStock,               // 0 when no inventoryItems
        sales:          0,          // stub—replace with your real sales logic
        costPrice:      p.costPrice,
        salesPrice:     p.sellingPrice,
        commissionRate: p.CommissionRate?.commissionRate || 0,
        commissionType: p.CommissionRate?.commissionType || 'COST',
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET inventory error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// import { NextResponse } from 'next/server';
// import prisma from '@/server/db/prismadb';

// // GET /api/admin/get-all-inventory?companyId=xxx&limit=xx&page=xx
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const companyId = searchParams.get('companyId');
//   const limit     = Math.max(1, parseInt(searchParams.get('limit') || '50', 10));
//   const page      = Math.max(1, parseInt(searchParams.get('page')  || '1', 10));
//   if (!companyId) {
//     return NextResponse.json({ message: 'Missing companyId' }, { status: 400 });
//   }
//   const skip = (page - 1) * limit;

//   try {
//     // Fetch all inventoryItems for this company, along with nested product and agent inventories
//     const rows = await prisma.inventoryItem.findMany({
//       where: { companyId },
//       include: {
//         product: {
//           include: {
//             productCategory: { include: { StoreCategory: true } },
//             CommissionRate: true,
//           },
//         },
//         AgentInventory: true,
//       },
//       skip,
//       take: limit,
//       orderBy: { createdAt: 'desc' },
//     });

//     // Map each inventory row into full InventoryItem shape
//     const items = rows.map((row) => {
//       const p = row.product!;

//       // Flattened productItem payload
//       const productItem = {
//         id:          p.id,
//         companyId:   p.companyId!,
//         name:        p.name,
//         description: p.description || '',
//         longDescription: p.longDescription || '',
//         tags:        p.tags,
//         category:    p.productCategory?.StoreCategory.find(sc => sc.companyId === p.companyId) || null,
//         subCategory: p.subCategory || null,
//         subCategoryName: p.subCategoryName || '',
//         brand:       p.brand || null,
//         model:       p.model || '',
//         color:       p.color,
//         size:        p.size,
//         weight:      p.weight || '',
//         condition:   p.condition || '',
//         dimensions:  p.dimensions || '',
//         material:    p.material,
//         images:      p.images,
//         video:       p.video,
//         digitalUrl:  p.digitalUrl || '',
//         autoDeliver: p.autoDeliver,
//         isAvailable:   p.isAvailable,
//         isOnOffer:     p.isOnOffer,
//         isFlashDeal:   p.isFlashDeal,
//         isNewArrival:  p.isNewArrival,
//         isDiscounted:  p.isDiscounted,
//         isFeatured:    p.isFeatured,
//         quantity:      row.quantity,
//         costPrice:     p.costPrice,
//         sellingPrice:  p.sellingPrice,
//         discount:      p.discount,
//         finalPrice:    p.finalPrice,
//         profitMargin:  p.profitMargin,
//         pricingTiers:  p.pricingTiers,
//         startDealDate: p.startDealDate?.toISOString() || null,
//         endDealDate:   p.endDealDate?.toISOString()   || null,
//         make:          p.make || '',
//         trim:          p.trim || '',
//         type:          p.type || '',
//         mileage:       p.mileage || '',
//         engineType:    p.engineType || '',
//         engineSize:    p.engineSize ?? 0,
//         horsepower:    p.horsepower ?? 0,
//         torque:        p.torque ?? 0,
//         fuelType:      p.fuelType || '',
//         fuelEconomy:   p.fuelEconomy || '',
//         transmission:  p.transmission || '',
//         drivetrain:    p.drivetrain || '',
//         vin:           p.vin || '',
//         logbookStatus: p.logbookStatus || '',
//         serviceHistory:p.serviceHistory || '',
//         negotiable:        p.negotiable,
//         financingAvailable:p.financingAvailable,
//         tradeIn:           p.tradeIn,
//         features:          p.features,
//         previousOwners:    p.previousOwners ?? 0,
//         tireCondition:     p.tireCondition || '',
//         accidentalHistory: p.accidentalHistory,
//         author:      p.author || '',
//         publisher:   p.publisher || '',
//         isbn:        p.isbn || '',
//         fabricComposition: p.fabricComposition || '',
//         careInstructions:   p.careInstructions || '',
//         energyRating:    p.energyRating || '',
//         warrantyPeriod:  p.warrantyPeriod || '',
//         applianceDimensions: p.applianceDimensions || '',
//         ingredients:       p.ingredients || '',
//         usageInstructions: p.usageInstructions || '',
//         expirationDate:    p.expirationDate?.toISOString() || null,
//         bedrooms:          p.bedrooms,
//         studios:           p.studios,
//         bathrooms:         p.bathrooms,
//         area:              p.area || '',
//         propertyTypeId:    p.propertyTypeId || '',
//         serviceSchedule:   p.serviceSchedule || '',
//         availabilityStart: p.availabilityStart?.toISOString() || '',
//         availabilityEnd:   p.availabilityEnd?.toISOString()   || '',
//         location:      p.location || {},
//         locationName:  p.locationName || '',
//         latitude:      p.latitude,
//         longitude:     p.longitude,
//         contact:       p.contact || '',
//         contactName:   p.contactName || '',
//         email:         p.email || '',
//         status:        p.status,
//         collectionId:  p.collectionId || '',
//         hourlyRate:     p.hourlyRate ?? undefined,
//         minimumHours:   p.minimumHours ?? undefined,
//         minNoticePeriod:p.minNoticePeriod || undefined,
//         maxBookingAhead:p.maxBookingAhead || undefined,
//         totalCapacity:  p.totalCapacity ?? undefined,
//         deliveryMethod: p.deliveryMethod || undefined,
//         fulfillmentStatus:p.fulfillmentStatus || undefined,
//         providerRating: p.providerRating ?? undefined,
//         bookingSlots:   p.bookingSlots,
//       };

//       // Compute stocks and sales
//       const agentStock   = row.AgentInventory.reduce((acc, ai) => acc + (ai.quantity || 0), 0);
//       const companyStock = row.quantity;
//       const sales        = 0; // replace with actual sales logic

//       return {
//         id:               row.id,
//         inventoryId:      row.id,
//         name:             p.name,
//         companyId:        row.companyId!,
//         // product,          // full Prisma product object
//         productItem,      // flattened form
//         category:         productItem.category!,
//         agentStock,
//         companyStock,
//         sales,
//         costPrice:        p.costPrice,
//         salesPrice:       p.sellingPrice,
//         commissionRate:   p.CommissionRate?.commissionRate || 0,
//         commissionType:   p.CommissionRate?.commissionType || 'COST',
//       };
//     });

//     return NextResponse.json(items);
//   } catch (error) {
//     console.error('GET inventory error:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

