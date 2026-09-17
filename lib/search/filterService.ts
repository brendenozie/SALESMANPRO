/**
 * lib/search/filterService.ts
 *
 * Query builder and facet resolution for generic and category-specific filters.
 * Ensures zero-injection, type-safe filtering across MongoDB/Prisma.
 */

import prisma from "@/server/db/prismadb";
import { Prisma } from "@prisma/client";
import {
  SearchFilterParams,
  SearchScope,
  AvailableFiltersResponseDTO,
  FilterFacetGroup,
} from "./types";
import { CategoryService, CATEGORY_SPECS } from "./categoryService";
import { cacheGet, cacheSet } from "@/lib/cache";

export class FilterService {
  /**
   * Translates SearchFilterParams into Prisma where conditions for marketplaceListings.
   */
  public static buildPrismaWhereFilters(
    filters: SearchFilterParams = {},
    scope: SearchScope = "GHUBA",
    companyId?: string
  ): Prisma.marketplaceListingsWhereInput {
    const where: Prisma.marketplaceListingsWhereInput = {};

    // 1. Mandatory publication & visibility rules
    where.status = "ACTIVE" as any;
    where.isAvailable = filters.isAvailable !== false;

    if (scope === "GHUBA") {
      where.showOnGhuba = true;
      where.ghubaAdminApproved = true;
      where.ghubaStatus = "APPROVED";
      where.company = {
        OR: [{ showOnGhuba: true }, { showOnGhuba: { isSet: false } }],
      };
    } else if (scope === "STORE" && companyId) {
      where.companyId = companyId;
    }

    // 2. Generic Price Range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.finalPrice = {
        ...(filters.minPrice !== undefined && !isNaN(filters.minPrice) && {
          gte: filters.minPrice,
        }),
        ...(filters.maxPrice !== undefined && !isNaN(filters.maxPrice) && {
          lte: filters.maxPrice,
        }),
      };
    }

    // 3. Category & SubCategory Filters
    if (filters.category && filters.category.length > 0) {
      where.OR = where.OR || [];
      // Support matching by category string or relation
      where.OR.push(
        { category: { in: filters.category } },
        { productCategory: { name: { in: filters.category, mode: "insensitive" } } },
        { productCategory: { slug: { in: filters.category, mode: "insensitive" } } }
      );
    }

    if (filters.subCategory && filters.subCategory.length > 0) {
      where.subCategoryName = { in: filters.subCategory, mode: "insensitive" };
    }

    // 4. Brand
    if (filters.brand && filters.brand.length > 0) {
      where.brand = { in: filters.brand, mode: "insensitive" };
    }

    // 5. Condition
    if (filters.condition && filters.condition.length > 0) {
      where.condition = { in: filters.condition, mode: "insensitive" };
    }

    // 6. Location
    if (filters.location && filters.location.trim()) {
      where.locationName = { contains: filters.location.trim(), mode: "insensitive" };
    }

    // 7. Seller / Store
    if (filters.sellerId) {
      where.companyId = filters.sellerId;
    }

    // 8. Tags
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    // 9. Category-Specific: Vehicles
    if (filters.make && filters.make.length > 0) {
      where.make = { in: filters.make, mode: "insensitive" };
    }
    if (filters.model && filters.model.length > 0) {
      where.model = { in: filters.model, mode: "insensitive" };
    }
    if (filters.transmission && filters.transmission.length > 0) {
      where.transmission = { in: filters.transmission, mode: "insensitive" };
    }
    if (filters.fuelType && filters.fuelType.length > 0) {
      where.fuelType = { in: filters.fuelType, mode: "insensitive" };
    }
    if (filters.bodyType && filters.bodyType.length > 0) {
      where.type = { in: filters.bodyType, mode: "insensitive" };
    }
    if (filters.yearFrom !== undefined || filters.yearTo !== undefined) {
      where.year = {
        ...(filters.yearFrom !== undefined && { gte: filters.yearFrom }),
        ...(filters.yearTo !== undefined && { lte: filters.yearTo }),
      };
    }

    // 10. Category-Specific: Property
    if (filters.rentOrSale && filters.rentOrSale !== "ALL") {
      where.listingTransactionType = filters.rentOrSale as any;
    }
    if (filters.bathrooms && filters.bathrooms.length > 0) {
      where.bathrooms = { in: filters.bathrooms };
    }

    return where;
  }

  /**
   * Resolves dynamic filter options (facets, price bounds, category attributes)
   * available for a given category and scope.
   */
  public static async getAvailableFilters(params: {
    category?: string;
    scope?: SearchScope;
    companyId?: string;
  }): Promise<AvailableFiltersResponseDTO> {
    const scope = params.scope || "GHUBA";
    const cacheKey = `filter:facets:${scope}:${params.companyId || "all"}:${params.category || "all"}`;

    try {
      const cached = await cacheGet<AvailableFiltersResponseDTO>(cacheKey);
      if (cached) return cached;
    } catch {}

    const baseWhere: Prisma.marketplaceListingsWhereInput = {
      status: "ACTIVE" as any,
      isAvailable: true,
      ...(scope === "GHUBA"
        ? { showOnGhuba: true, ghubaAdminApproved: true, ghubaStatus: "APPROVED" }
        : { companyId: params.companyId }),
    };

    if (params.category) {
      baseWhere.OR = [
        { category: params.category },
        { productCategory: { name: { equals: params.category, mode: "insensitive" } } },
        { productCategory: { slug: { equals: params.category, mode: "insensitive" } } },
      ];
    }

    // 1. Fetch available brands and price bounds in parallel
    const [priceAgg, rawListings] = await Promise.all([
      prisma.marketplaceListings.aggregate({
        where: baseWhere,
        _min: { finalPrice: true },
        _max: { finalPrice: true },
      }),
      prisma.marketplaceListings.findMany({
        where: baseWhere,
        select: {
          brand: true,
          condition: true,
          category: true,
          subCategoryName: true,
          make: true,
        },
        take: 300,
      }),
    ]);

    // Compute distinct brand counts
    const brandCounts = new Map<string, number>();
    const conditionCounts = new Map<string, number>();
    const subCategoryCounts = new Map<string, number>();

    for (const item of rawListings) {
      if (item.brand) {
        brandCounts.set(item.brand, (brandCounts.get(item.brand) || 0) + 1);
      }
      if (item.condition) {
        conditionCounts.set(item.condition, (conditionCounts.get(item.condition) || 0) + 1);
      }
      if (item.subCategoryName) {
        subCategoryCounts.set(
          item.subCategoryName,
          (subCategoryCounts.get(item.subCategoryName) || 0) + 1
        );
      }
    }

    const brandOptions = Array.from(brandCounts.entries())
      .map(([b, count]) => ({ value: b, label: b, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);

    const conditionOptions = Array.from(conditionCounts.entries())
      .map(([c, count]) => ({ value: c, label: c, count }))
      .sort((a, b) => b.count - a.count);

    const subCatOptions = Array.from(subCategoryCounts.entries())
      .map(([s, count]) => ({ value: s, label: s, count }))
      .sort((a, b) => b.count - a.count);

    const genericFilters: FilterFacetGroup[] = [
      {
        key: "brand",
        title: "Brand",
        type: "checkbox",
        options: brandOptions,
      },
      {
        key: "condition",
        title: "Condition",
        type: "checkbox",
        options: conditionOptions,
      },
      ...(subCatOptions.length > 0
        ? [
            {
              key: "subCategory",
              title: "Subcategory",
              type: "checkbox" as const,
              options: subCatOptions,
            },
          ]
        : []),
    ];

    // 2. Resolve Category-Specific attributes
    let categorySpecificFilters: FilterFacetGroup[] = [];
    const spec = CategoryService.resolveCategorySpec(params.category);
    if (spec && spec.attributes) {
      categorySpecificFilters = spec.attributes;
    }

    const response: AvailableFiltersResponseDTO = {
      categoryName: spec?.name || params.category,
      categorySlug: spec?.slug,
      priceRange: {
        min: priceAgg._min.finalPrice || 0,
        max: priceAgg._max.finalPrice || 500000,
      },
      genericFilters,
      categorySpecificFilters,
    };

    await cacheSet(cacheKey, response, 600).catch(() => {});
    return response;
  }
}
