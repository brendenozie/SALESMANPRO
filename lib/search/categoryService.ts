/**
 * lib/search/categoryService.ts
 *
 * Centralized Category & Subcategory discovery service.
 * Defines domain-specific category attribute schemas, taxonomy hierarchy,
 * and category-aware filter definitions for Ghuba and tenant storefronts.
 */

import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";
import { FilterFacetGroup } from "./types";

export interface CategorySpecDefinition {
  slug: string;
  name: string;
  aliases: string[];
  attributes: FilterFacetGroup[];
}

export const CATEGORY_SPECS: Record<string, CategorySpecDefinition> = {
  vehicles: {
    slug: "vehicles",
    name: "Vehicles",
    aliases: ["cars", "automotive", "motors", "autos", "trucks", "motorcycles", "bikes"],
    attributes: [
      {
        key: "make",
        title: "Make / Brand",
        type: "checkbox",
        options: [
          { value: "Toyota", label: "Toyota" },
          { value: "Nissan", label: "Nissan" },
          { value: "Mercedes-Benz", label: "Mercedes-Benz" },
          { value: "BMW", label: "BMW" },
          { value: "Subaru", label: "Subaru" },
          { value: "Honda", label: "Honda" },
          { value: "Mazda", label: "Mazda" },
          { value: "Volkswagen", label: "Volkswagen" },
          { value: "Land Rover", label: "Land Rover" },
          { value: "Mitsubishi", label: "Mitsubishi" },
          { value: "Ford", label: "Ford" },
          { value: "Audi", label: "Audi" },
          { value: "Hyundai", label: "Hyundai" },
          { value: "Isuzu", label: "Isuzu" },
        ],
      },
      {
        key: "bodyType",
        title: "Body Type",
        type: "checkbox",
        options: [
          { value: "SUV", label: "SUV" },
          { value: "Sedan", label: "Sedan" },
          { value: "Hatchback", label: "Hatchback" },
          { value: "Pickup", label: "Pickup Truck" },
          { value: "Coupe", label: "Coupe" },
          { value: "Van", label: "Van / Minivan" },
          { value: "Station Wagon", label: "Station Wagon" },
          { value: "Motorcycle", label: "Motorcycle" },
        ],
      },
      {
        key: "transmission",
        title: "Transmission",
        type: "checkbox",
        options: [
          { value: "Automatic", label: "Automatic" },
          { value: "Manual", label: "Manual" },
          { value: "CVT", label: "CVT" },
        ],
      },
      {
        key: "fuelType",
        title: "Fuel Type",
        type: "checkbox",
        options: [
          { value: "Petrol", label: "Petrol" },
          { value: "Diesel", label: "Diesel" },
          { value: "Hybrid", label: "Hybrid" },
          { value: "Electric", label: "Electric" },
        ],
      },
      {
        key: "yearRange",
        title: "Year of Manufacture",
        type: "range",
        min: 2000,
        max: new Date().getFullYear() + 1,
      },
      {
        key: "condition",
        title: "Condition",
        type: "checkbox",
        options: [
          { value: "Brand New", label: "Brand New" },
          { value: "Foreign Used", label: "Foreign Used" },
          { value: "Local Used", label: "Locally Used" },
        ],
      },
    ],
  },
  property: {
    slug: "property",
    name: "Property & Real Estate",
    aliases: ["real-estate", "houses", "apartments", "land", "rentals", "commercial-property"],
    attributes: [
      {
        key: "rentOrSale",
        title: "Listing Type",
        type: "radio",
        options: [
          { value: "SALE", label: "For Sale" },
          { value: "RENT", label: "For Rent" },
        ],
      },
      {
        key: "propertyType",
        title: "Property Type",
        type: "checkbox",
        options: [
          { value: "Apartment", label: "Apartment" },
          { value: "House", label: "Standalone House" },
          { value: "Villa", label: "Villa / Townhouse" },
          { value: "Land", label: "Land / Plot" },
          { value: "Commercial", label: "Commercial Office / Retail" },
          { value: "Hostel", label: "Hostel / Student Housing" },
        ],
      },
      {
        key: "bedrooms",
        title: "Bedrooms",
        type: "checkbox",
        options: [
          { value: "Bedsitter / Studio", label: "Bedsitter / Studio" },
          { value: "1", label: "1 Bedroom" },
          { value: "2", label: "2 Bedrooms" },
          { value: "3", label: "3 Bedrooms" },
          { value: "4", label: "4 Bedrooms" },
          { value: "5+", label: "5+ Bedrooms" },
        ],
      },
      {
        key: "bathrooms",
        title: "Bathrooms",
        type: "checkbox",
        options: [
          { value: "1", label: "1 Bath" },
          { value: "2", label: "2 Baths" },
          { value: "3+", label: "3+ Baths" },
        ],
      },
      {
        key: "condition",
        title: "Furnishing",
        type: "checkbox",
        options: [
          { value: "Furnished", label: "Furnished" },
          { value: "Semi-Furnished", label: "Semi-Furnished" },
          { value: "Unfurnished", label: "Unfurnished" },
        ],
      },
    ],
  },
  electronics: {
    slug: "electronics",
    name: "Electronics & Gadgets",
    aliases: ["phones", "computers", "laptops", "tablets", "appliances", "gadgets", "audio"],
    attributes: [
      {
        key: "brand",
        title: "Brand",
        type: "checkbox",
        options: [
          { value: "Apple", label: "Apple" },
          { value: "Samsung", label: "Samsung" },
          { value: "HP", label: "HP" },
          { value: "Dell", label: "Dell" },
          { value: "Lenovo", label: "Lenovo" },
          { value: "Sony", label: "Sony" },
          { value: "Xiaomi", label: "Xiaomi" },
          { value: "Google", label: "Google" },
          { value: "Asus", label: "Asus" },
          { value: "Infinix", label: "Infinix" },
          { value: "Tecno", label: "Tecno" },
          { value: "LG", label: "LG" },
        ],
      },
      {
        key: "condition",
        title: "Condition",
        type: "checkbox",
        options: [
          { value: "Brand New", label: "Brand New" },
          { value: "Refurbished", label: "Certified Refurbished" },
          { value: "Used", label: "Used / Second Hand" },
        ],
      },
      {
        key: "storage",
        title: "Internal Storage",
        type: "checkbox",
        options: [
          { value: "64GB", label: "64 GB" },
          { value: "128GB", label: "128 GB" },
          { value: "256GB", label: "256 GB" },
          { value: "512GB", label: "512 GB" },
          { value: "1TB", label: "1 TB" },
        ],
      },
      {
        key: "ram",
        title: "RAM",
        type: "checkbox",
        options: [
          { value: "4GB", label: "4 GB" },
          { value: "8GB", label: "8 GB" },
          { value: "16GB", label: "16 GB" },
          { value: "32GB", label: "32 GB" },
        ],
      },
    ],
  },
  fashion: {
    slug: "fashion",
    name: "Fashion & Apparel",
    aliases: ["clothing", "shoes", "wearables", "accessories", "jewelry", "apparel"],
    attributes: [
      {
        key: "gender",
        title: "Gender / Department",
        type: "checkbox",
        options: [
          { value: "Men", label: "Men" },
          { value: "Women", label: "Women" },
          { value: "Unisex", label: "Unisex" },
          { value: "Kids", label: "Kids" },
        ],
      },
      {
        key: "size",
        title: "Size",
        type: "checkbox",
        options: [
          { value: "XS", label: "XS" },
          { value: "S", label: "S" },
          { value: "M", label: "M" },
          { value: "L", label: "L" },
          { value: "XL", label: "XL" },
          { value: "XXL", label: "XXL" },
          { value: "38", label: "EU 38" },
          { value: "39", label: "EU 39" },
          { value: "40", label: "EU 40" },
          { value: "41", label: "EU 41" },
          { value: "42", label: "EU 42" },
          { value: "43", label: "EU 43" },
          { value: "44", label: "EU 44" },
        ],
      },
      {
        key: "condition",
        title: "Condition",
        type: "checkbox",
        options: [
          { value: "Brand New", label: "Brand New" },
          { value: "Used", label: "Thrift / Vintage" },
        ],
      },
    ],
  },
  services: {
    slug: "services",
    name: "Professional & Local Services",
    aliases: ["service", "repairs", "maintenance", "cleaning", "consulting", "booking"],
    attributes: [
      {
        key: "deliveryMethod",
        title: "Service Delivery",
        type: "checkbox",
        options: [
          { value: "On-site", label: "On-site / In-person" },
          { value: "Remote/Virtual", label: "Remote / Virtual" },
          { value: "Drop-off", label: "Shop / Drop-off" },
        ],
      },
    ],
  },
};

export class CategoryService {
  /**
   * Resolves category specification and attributes by category name or slug.
   */
  public static resolveCategorySpec(categoryIdentifier?: string | null): CategorySpecDefinition | null {
    if (!categoryIdentifier) return null;
    const clean = categoryIdentifier.toLowerCase().trim().replace(/[-_]/g, " ");

    for (const [key, spec] of Object.entries(CATEGORY_SPECS)) {
      if (
        key === clean ||
        spec.slug === clean ||
        spec.name.toLowerCase() === clean ||
        spec.aliases.some((a) => clean.includes(a) || a.includes(clean))
      ) {
        return spec;
      }
    }
    return null;
  }

  /**
   * Fetches hierarchical category tree with caching.
   */
  public static async getCategoryTree(companyId?: string): Promise<Array<{
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    image?: string | null;
    subcategories: Array<{ name: string; slug?: string }>;
    allBrands: string[];
    isFeatured: boolean;
  }>> {
    const cacheKey = `cat:tree:${companyId || "global"}`;
    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return cached;
    } catch {}

    const where: any = companyId
      ? { OR: [{ companyId }, { companyId: null }] }
      : { visible: true };

    const categories = await prisma.productCategory.findMany({
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

    const parsed = categories.map((cat) => {
      let subcats: Array<{ name: string; slug?: string }> = [];
      if (Array.isArray(cat.subcategories)) {
        subcats = cat.subcategories.map((s: any) =>
          typeof s === "string" ? { name: s, slug: s.toLowerCase().replace(/\s+/g, "-") } : s
        );
      }
      return {
        ...cat,
        subcategories: subcats,
      };
    });

    await cacheSet(cacheKey, parsed, 3600).catch(() => {});
    return parsed;
  }

  /**
   * Matches potential category suggestions from a search term.
   */
  public static async matchCategoriesByTerm(term: string, limit = 5): Promise<Array<{
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  }>> {
    if (!term || term.trim().length < 2) return [];
    const clean = term.toLowerCase().trim();
    const tree = await this.getCategoryTree();

    const matches = tree.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(clean);
      const subMatch = c.subcategories.some((s) => s.name.toLowerCase().includes(clean));
      const brandMatch = c.allBrands?.some((b) => b.toLowerCase().includes(clean));
      return nameMatch || subMatch || brandMatch;
    });

    return matches.slice(0, limit).map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      icon: m.icon,
    }));
  }
}
