/**
 * lib/taxonomy/taxonomyService.ts
 *
 * Authoritative Unified Taxonomy Service for SalesmanPro & Ghuba Ecosystem.
 * Bridges Store Categories (CompanyCategory), Store Variants, Product Categories (ProductCategory),
 * Subcategories, Brands, and Marketplace Listings without duplicated logic or hardcoded mocks.
 */

import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";

export interface AuthoritativeCategoryDTO {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
  subcategories: Array<{ name: string; slug: string }>;
  brands: string[];
  isFeatured?: boolean;
}

export interface StoreCategoryDefinition {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

const CACHE_TTL_SECONDS = 300; // 5 minutes

export class TaxonomyService {
  /**
   * Retrieves active Store Categories (business types) from CompanyCategory.
   */
  public static async getStoreCategories(): Promise<StoreCategoryDefinition[]> {
    const cacheKey = "taxonomy:store-categories:active";
    try {
      const cached = await cacheGet<StoreCategoryDefinition[]>(cacheKey);
      if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    } catch {}

    const companyCategories = await prisma.companyCategory.findMany({
      where: { status: "active" },
      select: { id: true, name: true, icon: true },
      orderBy: { name: "asc" },
    });

    const results: StoreCategoryDefinition[] = companyCategories.map((cc) => ({
      id: cc.id,
      name: cc.name.trim(),
      slug: cc.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      icon: cc.icon || null,
    }));

    try {
      await cacheSet(cacheKey, results, CACHE_TTL_SECONDS);
    } catch {}

    return results;
  }

  /**
   * Retrieves all authoritative Product Categories with their real subcategories and brands.
   */
  public static async getProductCategories(companyId?: string): Promise<AuthoritativeCategoryDTO[]> {
    const cacheKey = `taxonomy:product-categories:${companyId || "global"}`;
    try {
      const cached = await cacheGet<AuthoritativeCategoryDTO[]>(cacheKey);
      if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    } catch {}

    const where: any = companyId
      ? { OR: [{ companyId }, { companyId: null }] }
      : { visible: true };

    const records = await prisma.productCategory.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        image: true,
        subcategories: true,
        allBrands: true,
        isFeatured: true,
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      take: 100,
    });

    const parsed: AuthoritativeCategoryDTO[] = records.map((pc) => {
      const name = pc.name?.trim() || "Uncategorized";
      const slug = pc.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      let subcategories: Array<{ name: string; slug: string }> = [];
      if (Array.isArray(pc.subcategories)) {
        subcategories = pc.subcategories
          .map((sub: any) => {
            if (typeof sub === "string") {
              const trimmed = sub.trim();
              return trimmed ? { name: trimmed, slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-") } : null;
            }
            if (sub && typeof sub === "object" && sub.name) {
              const trimmed = String(sub.name).trim();
              return trimmed ? { name: trimmed, slug: sub.slug || trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-") } : null;
            }
            return null;
          })
          .filter(Boolean) as Array<{ name: string; slug: string }>;
      }

      let brands: string[] = [];
      if (Array.isArray(pc.allBrands)) {
        brands = pc.allBrands
          .map((b) => (typeof b === "string" ? b.trim() : ""))
          .filter((b) => b.length > 0);
      }

      return {
        id: pc.id,
        name,
        slug,
        icon: pc.icon || null,
        image: pc.image || null,
        subcategories,
        brands,
        isFeatured: pc.isFeatured ?? false,
      };
    });

    try {
      await cacheSet(cacheKey, parsed, CACHE_TTL_SECONDS);
    } catch {}

    return parsed;
  }

  /**
   * Validates if a string is a valid 24-char ObjectId of an existing ProductCategory.
   */
  public static async validateProductCategoryId(categoryId?: string | null): Promise<boolean> {
    if (!categoryId || typeof categoryId !== "string" || categoryId.length !== 24) {
      return false;
    }

    try {
      const exists = await prisma.productCategory.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });
      return Boolean(exists);
    } catch {
      return false;
    }
  }

  /**
   * Deterministically resolves a Category name, slug, or ID to an authoritative ProductCategory.
   */
  public static async resolveCategory(input?: string | null): Promise<AuthoritativeCategoryDTO | null> {
    if (!input || !input.trim()) return null;
    const clean = input.trim();
    const categories = await this.getProductCategories();

    // 1. Direct ID match
    const byId = categories.find((c) => c.id === clean);
    if (byId) return byId;

    // 2. Exact or case-insensitive name match
    const byName = categories.find((c) => c.name.toLowerCase() === clean.toLowerCase());
    if (byName) return byName;

    // 3. Slug match
    const cleanSlug = clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const bySlug = categories.find((c) => c.slug.toLowerCase() === cleanSlug);
    if (bySlug) return bySlug;

    // 4. Substring / partial match
    const byPartial = categories.find(
      (c) => c.name.toLowerCase().includes(clean.toLowerCase()) || clean.toLowerCase().includes(c.name.toLowerCase())
    );
    if (byPartial) return byPartial;

    return null;
  }

  /**
   * Validates and sanitizes a subcategory against its parent category.
   * Supports legitimate custom subcategories through a controlled, sanitized fallback.
   */
  public static validateSubcategory(
    parentCategory: AuthoritativeCategoryDTO | null,
    subCategoryInput?: string | null
  ): { isValid: boolean; normalizedName: string | null; isCustom: boolean } {
    if (!subCategoryInput || !subCategoryInput.trim()) {
      return { isValid: true, normalizedName: null, isCustom: false };
    }

    const trimmed = subCategoryInput.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      return { isValid: false, normalizedName: null, isCustom: false };
    }

    if (parentCategory && Array.isArray(parentCategory.subcategories)) {
      const matched = parentCategory.subcategories.find(
        (s) => s.name.toLowerCase() === trimmed.toLowerCase() || s.slug === trimmed.toLowerCase()
      );
      if (matched) {
        return { isValid: true, normalizedName: matched.name, isCustom: false };
      }
    }

    // Controlled custom subcategory (sanitized, alphanumeric and standard punctuation)
    const sanitized = trimmed.replace(/[<>{}\\]/g, "");
    return { isValid: true, normalizedName: sanitized, isCustom: true };
  }

  /**
   * Normalizes brand names to prevent duplicate categories caused by spelling/casing.
   * Handles unbranded/generic products cleanly without inventing fake brands.
   */
  public static normalizeBrand(brandInput?: string | null): string | null {
    if (!brandInput || typeof brandInput !== "string") return null;
    const trimmed = brandInput.trim();
    if (!trimmed || trimmed.toLowerCase() === "generic" || trimmed.toLowerCase() === "unbranded" || trimmed.toLowerCase() === "n/a") {
      return null;
    }

    // Capitalize first letter of each word
    return trimmed
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**
   * Maps a Store Category (business type) to relevant default Product Categories.
   */
  public static mapStoreCategoryToProductCategoryKeywords(storeCategory?: string | null): string[] {
    if (!storeCategory) return [];
    const norm = storeCategory.toLowerCase();

    if (norm.includes("fashion") || norm.includes("clothing") || norm.includes("apparel")) {
      return ["fashion", "clothing", "apparel", "wear", "shoes", "accessories"];
    }
    if (norm.includes("shoe") || norm.includes("footwear")) {
      return ["shoe", "footwear", "sneaker", "boot", "fashion"];
    }
    if (norm.includes("electronic") || norm.includes("gadget") || norm.includes("phone")) {
      return ["electronic", "gadget", "phone", "computer", "audio", "appliances"];
    }
    if (norm.includes("grocer") || norm.includes("food") || norm.includes("supermarket")) {
      return ["grocer", "food", "snack", "beverage", "fresh"];
    }
    if (norm.includes("furniture") || norm.includes("decor") || norm.includes("home")) {
      return ["furniture", "decor", "home", "living", "bed"];
    }
    if (norm.includes("beauty") || norm.includes("cosmetic")) {
      return ["beauty", "cosmetic", "skincare", "fragrance", "hair"];
    }
    if (norm.includes("auto") || norm.includes("motor")) {
      return ["automotive", "motor", "parts", "accessories", "vehicle"];
    }
    if (norm.includes("baby") || norm.includes("kid")) {
      return ["baby", "kids", "toy", "child"];
    }

    return [];
  }
}
