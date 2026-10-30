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
        Product: { some: { companyId } },
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

export const getStoreCategories = getStoreCategoriesByCompanyId;

export async function getStoreInventoryProducts(
  companyId: string,
  page: number = 1,
  limit: number = 50
): Promise<any[]> {
  if (!companyId) return [];

  try {
    const { fetchCompanyInventoryProducts } = await import(
      "@/lib/inventory/inventory-service"
    );
    const { results } = await fetchCompanyInventoryProducts(companyId, {
      page,
      limit,
    });
    return results;
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
