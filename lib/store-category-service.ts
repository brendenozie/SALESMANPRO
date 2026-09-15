/**
 * lib/store-category-service.ts
 *
 * Direct database access layer for store categories and merchant inventory.
 * Eliminates flaky internal HTTP hops during Server Component rendering.
 */

import prisma from "@/server/db/prismadb";
import { IStoreCategory } from "@/types/typings";

export async function getStoreCategoriesByCompanyId(companyId: string): Promise<IStoreCategory[]> {
  if (!companyId) return [];

  try {
    const rawCategories = await prisma.storeCategory.findMany({
      where: { companyId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            icon: true,
            allBrands: true,
            tags: true,
            subcategories: true,
            description: true,
            longDescription: true,
            seoTitle: true,
            seoDescription: true,
            metaKeywords: true,
            sortOrder: true,
            visible: true,
            isFeatured: true,
            showInHomepage: true,
            attributes: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    if (rawCategories.length > 0) {
      return rawCategories.map((sc: any) => ({
        id: sc.id,
        companyId: sc.companyId,
        categoryId: sc.categoryId || sc.category?.id,
        displayName: sc.displayName || sc.category?.name || "Category",
        icon: sc.icon || sc.category?.icon,
        sortOrder: sc.sortOrder ?? 0,
        visible: sc.visible ?? true,
        subcategories: Array.isArray(sc.subcategories)
          ? sc.subcategories.map((sub: any) => ({
              id: sub._id?.$oid || sub.id,
              name: sub.name,
              slug: sub.slug,
              sortOrder: sub.sortOrder,
              visible: sub.visible,
            }))
          : Array.isArray(sc.category?.subcategories)
            ? sc.category.subcategories.map((sub: any) => ({
                id: sub._id?.$oid || sub.id,
                name: sub.name,
                slug: sub.slug,
                sortOrder: sub.sortOrder,
                visible: sub.visible,
              }))
            : [],
        allBrands: sc.allBrands || [],
        category: {
          id: sc.category?.id || sc.categoryId,
          name: sc.category?.name || sc.displayName || "Category",
          slug: sc.category?.slug,
          description: sc.category?.description,
          longDescription: sc.category?.longDescription,
          seoTitle: sc.category?.seoTitle,
          seoDescription: sc.category?.seoDescription,
          metaKeywords: sc.category?.metaKeywords,
          sortOrder: sc.category?.sortOrder ?? sc.sortOrder ?? 0,
          visible: sc.category?.visible ?? sc.visible ?? true,
          isFeatured: sc.category?.isFeatured,
          showInHomepage: sc.category?.showInHomepage,
          attributes: sc.category?.attributes,
          subcategories: Array.isArray(sc.category?.subcategories)
            ? sc.category.subcategories.map((sub: any) => ({
                id: sub._id?.$oid || sub.id,
                name: sub.name,
                slug: sub.slug,
                sortOrder: sub.sortOrder,
                visible: sub.visible,
              }))
            : [],
          icon: sc.category?.icon || sc.icon,
          image: sc.category?.image || sc.image,
        },
      }));
    }

    // Fallback: If storeCategory records haven't been explicitly created yet,
    // find product categories that are actively linked to this company's products
    const productCategories = await prisma.productCategory.findMany({
      where: {
        products: { some: { companyId } },
      },
      take: 50,
      orderBy: { sortOrder: "asc" },
    });

    return productCategories.map((pc: any) => ({
      id: pc.id,
      companyId,
      categoryId: pc.id,
      displayName: pc.name,
      icon: pc.icon,
      sortOrder: pc.sortOrder ?? 0,
      visible: pc.visible ?? true,
      subcategories: Array.isArray(pc.subcategories)
        ? pc.subcategories.map((sub: any) => ({
            id: sub._id?.$oid || sub.id,
            name: sub.name,
            slug: sub.slug,
            sortOrder: sub.sortOrder,
            visible: sub.visible,
          }))
        : [],
      allBrands: pc.allBrands || [],
      category: {
        id: pc.id,
        name: pc.name,
        slug: pc.slug,
        description: pc.description,
        longDescription: pc.longDescription,
        seoTitle: pc.seoTitle,
        seoDescription: pc.seoDescription,
        metaKeywords: pc.metaKeywords,
        sortOrder: pc.sortOrder ?? 0,
        visible: pc.visible ?? true,
        isFeatured: pc.isFeatured,
        showInHomepage: pc.showInHomepage,
        attributes: pc.attributes,
        subcategories: Array.isArray(pc.subcategories)
          ? pc.subcategories.map((sub: any) => ({
              id: sub._id?.$oid || sub.id,
              name: sub.name,
              slug: sub.slug,
              sortOrder: sub.sortOrder,
              visible: sub.visible,
            }))
          : [],
        icon: pc.icon,
        image: pc.image,
      },
    }));
  } catch (err) {
    console.error("[GET_STORE_CATEGORIES_ERROR]", err);
    return [];
  }
}

export async function getStoreInventoryProducts(
  companyId: string,
  page: number = 1,
  limit: number = 50
): Promise<any[]> {
  if (!companyId) return [];

  const skip = Math.max(0, (page - 1) * limit);

  try {
    const products = await prisma.product.findMany({
      where: { companyId },
      include: {
        inventoryItems: { include: { AgentInventory: true } },
        productCategory: { include: { StoreCategory: true } },
        CommissionRate: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => {
      const overrideCat =
        p.productCategory?.StoreCategory.find((sc) => sc.companyId === p.companyId) ||
        null;
      const inventoryIds = p.inventoryItems.map((inv) => inv.id);
      const companyStock = p.inventoryItems.reduce(
        (sum, inv) => sum + (inv.quantity || 0),
        0
      );
      const agentStock = p.inventoryItems.reduce(
        (sum, inv) =>
          sum +
          inv.AgentInventory.reduce((aSum, ai) => aSum + (ai.quantity || 0), 0),
        0
      );

      return {
        id: p.id,
        companyId: p.companyId!,
        name: p.name,
        description: p.description || "",
        longDescription: p.longDescription || "",
        tags: p.tags,
        category: overrideCat,
        productCategoryId: p.productCategoryId || "",
        subCategory: p.subCategory || null,
        subCategoryName: p.subCategoryName || "",
        brand: p.brand || null,
        model: p.model || "",
        color: p.color || null,
        size: p.size || null,
        weight: p.weight || "",
        condition: p.condition || "",
        dimensions: p.dimensions || "",
        material: p.material || null,
        images: p.images,
        videos: p.videos || null,
        digitalUrl: p.digitalUrl || "",
        autoDeliver: p.autoDeliver || false,
        isAvailable: p.isAvailable || false,
        isOnOffer: p.isOnOffer || false,
        isFlashDeal: p.isFlashDeal || false,
        isNewArrival: p.isNewArrival || false,
        isDiscounted: p.isDiscounted || false,
        isFeatured: p.isFeatured || false,
        costPrice: p.costPrice || 0,
        sellingPrice: p.sellingPrice || 0,
        discount: p.discount || 0,
        finalPrice: p.finalPrice || 0,
        profitMargin: p.profitMargin || 0,
        pricingTiers: p.pricingTiers || [],
        startDealDate: p.startDealDate?.toISOString() || null,
        endDealDate: p.endDealDate?.toISOString() || null,
        commissionRate: p.CommissionRate?.commissionRate || 0,
        commissionType: p.CommissionRate?.commissionType || "COST",
        make: p.make || "",
        trim: p.trim || "",
        type: p.type || "",
        mileage: p.mileage || "",
        engineType: p.engineType || "",
        engineSize: p.engineSize || 0,
        horsepower: p.horsepower || 0,
        torque: p.torque || 0,
        fuelType: p.fuelType || "",
        fuelEconomy: p.fuelEconomy || "",
        transmission: p.transmission || "",
        drivetrain: p.drivetrain || "",
        vin: p.vin || "",
        logbookStatus: p.logbookStatus || "",
        serviceHistory: p.serviceHistory || "",
        inventoryIds,
        companyStock,
        agentStock,
        totalStock: companyStock + agentStock,
        createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: p.updatedAt?.toISOString() || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error("[GET_STORE_INVENTORY_PRODUCTS_ERROR]", err);
    return [];
  }
}

export async function getStoreMarketplaceListings(
  companyId: string,
  page: number = 1,
  limit: number = 20
) {
  if (!companyId) {
    return { results: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }

  const offset = Math.max(0, (page - 1) * limit);

  try {
    const [total, listings] = await Promise.all([
      prisma.marketplaceListings.count({ where: { companyId } }),
      prisma.marketplaceListings.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: { productCategory: true },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      results: listings || [],
      meta: { page, limit, total, totalPages },
    };
  } catch (err) {
    console.error("[GET_STORE_MARKETPLACE_LISTINGS_ERROR]", err);
    return { results: [], meta: { page, limit, total: 0, totalPages: 1 } };
  }
}
