import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";

export const dynamic = "force-dynamic";

const CACHE_KEY = "ghuba:store-categories:unified:v2";
const CACHE_TTL_SECONDS = 300; // 5 minutes

export interface GhubaCategoryDTO {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
  subcategories: string[];
  brands: string[];
}

const DEFAULT_CATEGORY_METADATA: Record<string, { subcategories: string[]; brands: string[] }> = {
  fashion: {
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Kids & Baby Wear",
      "Outerwear & Jackets",
      "Underwear & Loungewear",
      "Sportswear & Gym",
      "Traditional & Formal Wear",
    ],
    brands: ["Nike", "Adidas", "Zara", "H&M", "Puma", "Levi's", "Calvin Klein", "Local Brand / Designer", "Generic"],
  },
  shoe: {
    subcategories: [
      "Sneakers & Trainers",
      "Formal & Leather Shoes",
      "Boots & High-Tops",
      "Loafers & Slip-ons",
      "Sandals & Slides",
      "Heels & Wedges",
      "Kids Shoes",
    ],
    brands: ["Nike", "Adidas", "Air Jordan", "Puma", "Vans", "Converse", "Clarks", "New Balance", "Timberland", "Generic"],
  },
  electronic: {
    subcategories: [
      "Smartphones & Tablets",
      "Earphones & Headphones",
      "Laptops & Computers",
      "Smart Watches & Trackers",
      "TVs & Home Audio",
      "Chargers & Cables",
      "Gaming Consoles",
    ],
    brands: ["Apple", "Samsung", "Sony", "HP", "Dell", "Lenovo", "Xiaomi", "Tecno", "Infinix", "JBL", "Anker", "Generic"],
  },
  phone: {
    subcategories: [
      "Smartphones",
      "Feature Phones",
      "Tablets & iPads",
      "Phone Cases & Covers",
      "Screen Protectors",
      "Chargers & Powerbanks",
    ],
    brands: ["Apple", "Samsung", "Xiaomi", "Tecno", "Infinix", "Oppo", "Huawei", "OnePlus", "Google", "Generic"],
  },
  beauty: {
    subcategories: [
      "Skincare & Lotions",
      "Makeup & Cosmetics",
      "Fragrances & Perfumes",
      "Haircare & Shampoos",
      "Bath & Body",
      "Tools & Brushes",
      "Men's Grooming",
    ],
    brands: ["L'Oreal", "Fenty Beauty", "Nivea", "Maybelline", "Clinique", "The Ordinary", "CeraVe", "MAC", "Generic"],
  },
  furniture: {
    subcategories: [
      "Living Room Sofas",
      "Bed & Bedroom",
      "Dining Tables & Chairs",
      "Office Desks & Chairs",
      "Storage & Cabinets",
      "Lighting & Lamps",
      "Carpets & Rugs",
    ],
    brands: ["Ashley Furniture", "IKEA", "Homestyle", "Local Artisan / Handcrafted", "Generic"],
  },
  decor: {
    subcategories: [
      "Wall Art & Frames",
      "Clocks & Mirrors",
      "Vases & Artificial Plants",
      "Candles & Holders",
      "Curtains & Blinds",
      "Rugs & Mats",
    ],
    brands: ["Local Artisan", "Handcrafted", "Generic"],
  },
  grocer: {
    subcategories: [
      "Fresh Produce & Fruits",
      "Snacks & Confectionery",
      "Beverages & Soft Drinks",
      "Dairy & Eggs",
      "Grains & Cereals",
      "Cooking Oils & Spices",
      "Bakery & Bread",
    ],
    brands: ["Nestle", "Coca-Cola", "Brookside", "Pembe", "Unga", "Dairyland", "Farmer's Choice", "Generic / Farm Fresh"],
  },
  food: {
    subcategories: [
      "Fresh Produce & Fruits",
      "Snacks & Confectionery",
      "Beverages & Soft Drinks",
      "Dairy & Eggs",
      "Grains & Cereals",
      "Cooking Oils & Spices",
      "Bakery & Bread",
    ],
    brands: ["Nestle", "Coca-Cola", "Brookside", "Pembe", "Unga", "Dairyland", "Farmer's Choice", "Generic / Farm Fresh"],
  },
  auto: {
    subcategories: [
      "Motorcycle Accessories",
      "Car Care & Cleaning",
      "Tires & Wheels",
      "Lighting & Bulbs",
      "Batteries & Electrical",
      "Interior Mats & Covers",
      "Spare Parts",
    ],
    brands: ["Toyota", "Bosch", "Michelin", "Bridgestone", "Castrol", "Total", "Brembo", "Generic"],
  },
  motor: {
    subcategories: [
      "Motorcycle Accessories",
      "Car Care & Cleaning",
      "Tires & Wheels",
      "Lighting & Bulbs",
      "Batteries & Electrical",
      "Interior Mats & Covers",
      "Spare Parts",
    ],
    brands: ["Honda", "Yamaha", "Bajaj", "TVS", "Bosch", "Castrol", "Generic"],
  },
  baby: {
    subcategories: [
      "Baby Toys & Games",
      "Baby Diapers & Wipes",
      "Baby Strollers & Car Seats",
      "Baby Feeding & Bottles",
      "Toddler Clothes",
      "Nursery & Cots",
    ],
    brands: ["Pampers", "Huggies", "Fisher-Price", "Chicco", "Lego", "Johnson's", "Generic"],
  },
  kid: {
    subcategories: [
      "Toys & Board Games",
      "Action Figures & Dolls",
      "Kids Clothes",
      "School Bags & Kits",
      "Bikes & Scooters",
    ],
    brands: ["Lego", "Mattel", "Hasbro", "Disney", "Generic"],
  },
  book: {
    subcategories: [
      "Textbooks & Educational",
      "Fiction & Novels",
      "Self-Help & Business",
      "Kids Books",
      "Stationery & Notebooks",
      "Office Supplies",
    ],
    brands: ["Oxford", "Longhorn", "StoryMoja", "Pelikan", "Bic", "Generic"],
  },
  art: {
    subcategories: [
      "Jewelry & Watches",
      "Paintings & Artwork",
      "Handmade Crafts & Gifts",
      "Home Decor Crafts",
      "Leather Goods & Bags",
    ],
    brands: ["Kazuri Beads", "Local Artisan", "Handmade Kenya", "Generic"],
  },
  hardware: {
    subcategories: [
      "Power Tools",
      "Hand Tools",
      "Paint & Primers",
      "Plumbing Supplies",
      "Electrical Wiring & Sockets",
      "Fasteners & Nails",
    ],
    brands: ["Bosch", "Makita", "Crown Paints", "DeWalt", "Generic"],
  },
  pet: {
    subcategories: [
      "Dog Food & Treats",
      "Cat Food & Litter",
      "Pet Collars & Leashes",
      "Pet Beds & Cages",
      "Grooming Supplies",
    ],
    brands: ["Pedigree", "Whiskas", "Royal Canin", "Purina", "Generic"],
  },
};

function getCategoryPresets(name: string): { subcategories: string[]; brands: string[] } {
  const lower = name.toLowerCase();
  for (const [key, preset] of Object.entries(DEFAULT_CATEGORY_METADATA)) {
    if (lower.includes(key)) {
      return preset;
    }
  }
  return {
    subcategories: ["General Merchandise", "Featured Items", "New Arrivals"],
    brands: ["Local Brand", "Generic"],
  };
}

function normalizeSubcategories(raw: any, categoryName: string): string[] {
  let extracted: string[] = [];
  if (raw) {
    let list = raw;
    if (typeof raw === "string") {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    if (Array.isArray(list)) {
      extracted = list
        .map((item: any) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") return (item.name || item.title || "").trim();
          return "";
        })
        .filter(Boolean);
    }
  }

  // Merge with fallback presets to ensure rich subcategories exist
  const presets = getCategoryPresets(categoryName);
  const combined = Array.from(new Set([...extracted, ...presets.subcategories]));
  return combined;
}

function normalizeBrands(raw: any, categoryName: string): string[] {
  let extracted: string[] = [];
  if (Array.isArray(raw)) {
    extracted = raw.map((b: any) => (typeof b === "string" ? b.trim() : "")).filter(Boolean);
  }
  const presets = getCategoryPresets(categoryName);
  const combined = Array.from(new Set([...extracted, ...presets.brands]));
  return combined;
}

export async function GET() {
  try {
    // 1. Try cache first
    try {
      const cached = await cacheGet<GhubaCategoryDTO[]>(CACHE_KEY);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return NextResponse.json({ success: true, categories: cached, cached: true });
      }
    } catch {
      // Non-fatal
    }

    // 2. Fetch from ProductCategory (primary product taxonomy with subcategories & brands)
    const productCategories = await prisma.productCategory.findMany({
      where: {
        OR: [
          { visible: true },
          { status: "Active" },
          { status: "active" },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        image: true,
        subcategories: true,
        allBrands: true,
      },
      orderBy: { name: "asc" },
    });

    // 3. Fetch from CompanyCategory (Active)
    const companyCategories = await prisma.companyCategory.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        icon: true,
      },
      orderBy: { name: "asc" },
    });

    // 4. Combine into clean deduplicated category list keyed by lowercase name
    const categoryMap = new Map<string, GhubaCategoryDTO>();

    // Priority 1: ProductCategory (has subcategories and brands)
    productCategories.forEach((pc) => {
      const trimmed = pc.name?.trim();
      if (trimmed) {
        const subcategories = normalizeSubcategories(pc.subcategories, trimmed);
        const brands = normalizeBrands(pc.allBrands, trimmed);

        categoryMap.set(trimmed.toLowerCase(), {
          id: pc.id,
          name: trimmed,
          slug: pc.slug || trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          icon: pc.icon || null,
          image: pc.image || null,
          subcategories,
          brands,
        });
      }
    });

    // Priority 2: CompanyCategory (enrich or add if missing)
    companyCategories.forEach((cc) => {
      const trimmed = cc.name?.trim();
      if (trimmed) {
        const key = trimmed.toLowerCase();
        if (!categoryMap.has(key)) {
          const presets = getCategoryPresets(trimmed);
          categoryMap.set(key, {
            id: cc.id,
            name: trimmed,
            slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            icon: cc.icon || null,
            subcategories: presets.subcategories,
            brands: presets.brands,
          });
        } else {
          // If already in map, preserve icon if missing
          const existing = categoryMap.get(key)!;
          if (!existing.icon && cc.icon) {
            existing.icon = cc.icon;
          }
        }
      }
    });

    // Priority 3: Fallback standard retail categories if database was empty
    const FALLBACK_CATEGORIES = [
      "Fashion & Apparel",
      "Shoes & Footwear",
      "Electronics & Gadgets",
      "Beauty & Cosmetics",
      "Home Decor & Furniture",
      "Food, Snacks & Groceries",
      "Automotive & Motor Accessories",
      "Baby & Kids Essentials",
      "Art, Crafts & Gifts",
      "General Merchandise",
    ];

    if (categoryMap.size === 0) {
      FALLBACK_CATEGORIES.forEach((cat, index) => {
        const presets = getCategoryPresets(cat);
        categoryMap.set(cat.toLowerCase(), {
          id: `fallback-${index}`,
          name: cat,
          slug: cat.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          icon: null,
          subcategories: presets.subcategories,
          brands: presets.brands,
        });
      });
    }

    const categories = Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Save to cache
    try {
      await cacheSet(CACHE_KEY, categories, CACHE_TTL_SECONDS);
    } catch {}

    return NextResponse.json({
      success: true,
      categories,
      count: categories.length,
    });
  } catch (error: any) {
    console.error("[Ghuba Categories API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load store categories",
        categories: [
          {
            id: "1",
            name: "Fashion & Apparel",
            slug: "fashion-apparel",
            subcategories: ["Men's Clothing", "Women's Clothing", "Kids & Baby Wear"],
            brands: ["Nike", "Adidas", "Zara", "Generic"],
          },
          {
            id: "2",
            name: "Shoes & Footwear",
            slug: "shoes-footwear",
            subcategories: ["Sneakers & Trainers", "Formal & Leather Shoes", "Boots"],
            brands: ["Nike", "Adidas", "Puma", "Generic"],
          },
          {
            id: "3",
            name: "Electronics & Gadgets",
            slug: "electronics-gadgets",
            subcategories: ["Smartphones", "Earphones & Headphones", "Laptops"],
            brands: ["Apple", "Samsung", "Xiaomi", "Generic"],
          },
          {
            id: "4",
            name: "Food, Snacks & Groceries",
            slug: "food-snacks-groceries",
            subcategories: ["Fresh Produce", "Snacks & Sweets", "Beverages"],
            brands: ["Nestle", "Coca-Cola", "Generic"],
          },
          {
            id: "5",
            name: "Home Decor & Furniture",
            slug: "home-decor-furniture",
            subcategories: ["Living Room", "Bedroom", "Office"],
            brands: ["Local Artisan", "Generic"],
          },
        ],
      },
      { status: 200 }
    );
  }
}
