/**
 * scripts/seed-commercial-demos.ts
 *
 * Idempotent seed script for SalesmanPro's permanent commercial demo stores:
 *  1. fashion-demo     (fashion-demo.salesmanpro.store)
 *  2. electronics-demo (electronics-demo.salesmanpro.store)
 *
 * Run with:
 *   npx tsx scripts/seed-commercial-demos.ts
 */

import prisma from "../server/db/prismadb";
import { LAUNCH_INCLUDED_PLAN_ID } from "../lib/subscriptions/subscription-plans";

interface DemoProductInput {
  name: string;
  description: string;
  category: string;
  subCategoryName: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  color: string[];
  size: string[];
  tags: string[];
  imageUrl: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
}

interface DemoStoreDefinition {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  variant: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logoUrl: string;
  bannerUrl: string;
  products: DemoProductInput[];
}

const DEMO_STORES: DemoStoreDefinition[] = [
  {
    slug: "fashion-demo",
    name: "Savannah Style Boutique",
    tagline: "Contemporary Kenyan Fashion, Official Wear & Handcrafted Accessories",
    description:
      "Live demo storefront powered by SalesmanPro. Explore instant M-PESA checkout, size/color selection, and real-time stock management.",
    category: "fashion shop",
    variant: "fashion shop",
    contactEmail: "fashion-demo@salesmanpro.store",
    contactPhone: "+254712345678",
    address: "Kimathi Street, Nairobi CBD, Kenya",
    logoUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
    products: [
      {
        name: "Ankara Executive Wrap Dress",
        description: "Tailored modern African print wrap dress ideal for office and evening events.",
        category: "Women's Apparel",
        subCategoryName: "Dresses",
        brand: "Savannah Couture",
        costPrice: 2600,
        sellingPrice: 4500,
        quantity: 18,
        color: ["Emerald Gold", "Royal Blue", "Crimson"],
        size: ["S", "M", "L", "XL"],
        tags: ["ankara", "dress", "official", "kenyan-fashion"],
        imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
        isNewArrival: true,
      },
      {
        name: "Men's Tailored Linen Kaunda Suit",
        description: "Breathable premium linen two-piece suit crafted for executive comfort.",
        category: "Men's Apparel",
        subCategoryName: "Suits",
        brand: "Nairobi Bespoke",
        costPrice: 5200,
        sellingPrice: 8500,
        quantity: 12,
        color: ["Charcoal", "Navy", "Sand Beige"],
        size: ["M", "L", "XL", "XXL"],
        tags: ["kaunda-suit", "linen", "menswear", "executive"],
        imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
      },
      {
        name: "Handcrafted Maasai Beaded Leather Sandals",
        description: "Full-grain Kenyan leather sandals hand-beaded by local artisans.",
        category: "Footwear",
        subCategoryName: "Sandals",
        brand: "Kazi Crafts",
        costPrice: 1100,
        sellingPrice: 2200,
        quantity: 35,
        color: ["Multi-color Bead", "Red & White", "Turquoise"],
        size: ["37", "38", "39", "40", "41", "42"],
        tags: ["maasai", "sandals", "leather", "handmade"],
        imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
      },
      {
        name: "Savannah Genuine Leather Crossbody Bag",
        description: "Structured everyday leather handbag with brass hardware and zip compartments.",
        category: "Bags & Accessories",
        subCategoryName: "Handbags",
        brand: "Savannah Leather",
        costPrice: 3400,
        sellingPrice: 5800,
        quantity: 14,
        color: ["Tan Brown", "Espresso", "Matte Black"],
        size: ["One Size"],
        tags: ["leather-bag", "handbag", "accessories"],
        imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
        isNewArrival: true,
      },
      {
        name: "Classic High-Waist Stretch Denim Jeans",
        description: "Comfort-stretch premium denim with a flattering high-rise silhouette.",
        category: "Women's Apparel",
        subCategoryName: "Denim",
        brand: "UrbanFit",
        costPrice: 1800,
        sellingPrice: 3200,
        quantity: 25,
        color: ["Indigo", "Vintage Blue", "Jet Black"],
        size: ["28", "30", "32", "34", "36"],
        tags: ["jeans", "denim", "casual"],
        imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Silk Evening Scarf - Gold Savannah Print",
        description: "100% mulberry silk scarf featuring warm East African geometric motifs.",
        category: "Bags & Accessories",
        subCategoryName: "Scarves",
        brand: "Savannah Couture",
        costPrice: 900,
        sellingPrice: 1800,
        quantity: 40,
        color: ["Gold & Ivory", "Teal & Gold"],
        size: ["90x90cm"],
        tags: ["scarf", "silk", "gift"],
        imageUrl: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    slug: "electronics-demo",
    name: "ElectroHub Kenya",
    tagline: "Verified Smartphones, Audio Gear, Fast Chargers & Smart Accessories",
    description:
      "Live electronics & POS demo store powered by SalesmanPro. Built to showcase warranty tracking, barcode POS checkout, and instant M-PESA settlement.",
    category: "earphones store",
    variant: "earphones store",
    contactEmail: "electronics-demo@salesmanpro.store",
    contactPhone: "+254722987654",
    address: "Luthuli Avenue, Moi Avenue Junction, Nairobi",
    logoUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
    products: [
      {
        name: "Pro Wireless ANC Earbuds (Gen 3)",
        description: "Active Noise Cancellation, 30-hour battery case, and crystal-clear call mics.",
        category: "Audio",
        subCategoryName: "Wireless Earbuds",
        brand: "SoundCore Pro",
        costPrice: 2100,
        sellingPrice: 3500,
        quantity: 42,
        color: ["Matte Black", "Pearl White"],
        size: ["Standard"],
        tags: ["earbuds", "anc", "bluetooth", "audio"],
        imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
        isNewArrival: true,
      },
      {
        name: "65W GaN Fast Charger (Dual USB-C + USB-A)",
        description: "Charges laptops, iPhones, and Samsung Galaxy devices at full speed simultaneously.",
        category: "Chargers & Cables",
        subCategoryName: "Wall Chargers",
        brand: "AnkerVolt",
        costPrice: 1650,
        sellingPrice: 2800,
        quantity: 55,
        color: ["Space Grey", "White"],
        size: ["65W UK Plug"],
        tags: ["charger", "65w", "gan", "type-c"],
        imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
      },
      {
        name: "20,000mAh 22.5W PD Fast Charging PowerBank",
        description: "High-capacity airline-safe powerbank with digital LED battery percentage display.",
        category: "Power & Batteries",
        subCategoryName: "PowerBanks",
        brand: "OraimoPro",
        costPrice: 2500,
        sellingPrice: 4200,
        quantity: 30,
        color: ["Obsidian Black"],
        size: ["20000mAh"],
        tags: ["powerbank", "fast-charge", "travel"],
        imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
      },
      {
        name: "Smart Fitness Watch AMOLED 1.43\" Waterproof",
        description: "Bluetooth calling, heart-rate & SpO2 monitoring, 7-day battery life, IP68 waterproof.",
        category: "Wearables",
        subCategoryName: "Smartwatches",
        brand: "FitPulse",
        costPrice: 3900,
        sellingPrice: 6500,
        quantity: 19,
        color: ["Titanium Black", "Silver Strap", "Rose Gold"],
        size: ["45mm"],
        tags: ["smartwatch", "fitness", "amoled"],
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        isNewArrival: true,
      },
      {
        name: "Bluetooth Portable Studio Speaker 24W Bass",
        description: "Deep bass outdoor/indoor wireless speaker with 12-hour playtime and AUX/TF card slot.",
        category: "Audio",
        subCategoryName: "Speakers",
        brand: "JBLPulse",
        costPrice: 3200,
        sellingPrice: 5400,
        quantity: 16,
        color: ["Midnight Black", "Ocean Blue"],
        size: ["24W"],
        tags: ["speaker", "bluetooth", "bass"],
        imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "9H Tempered Glass + Shockproof MagSafe Case Bundle",
        description: "Complete drop & scratch protection bundle for iPhone and Samsung S-series.",
        category: "Phone Accessories",
        subCategoryName: "Cases & Protectors",
        brand: "ShieldPro",
        costPrice: 650,
        sellingPrice: 1500,
        quantity: 80,
        color: ["Crystal Clear", "Matte Frosted"],
        size: ["iPhone 13/14/15/16", "Samsung S23/S24"],
        tags: ["case", "magsafe", "screen-protector"],
        imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

async function seedDemoStore(def: DemoStoreDefinition, ownerUserId?: string) {
  console.log(`\nSeeding demo store: ${def.name} (${def.slug})...`);

  const company = await prisma.company.upsert({
    where: { slug: def.slug },
    update: {
      name: def.name,
      tagline: def.tagline,
      description: def.description,
      category: def.category,
      variant: def.variant,
      contactEmail: def.contactEmail,
      contactPhone: def.contactPhone,
      address: def.address,
      logoUrl: def.logoUrl,
      bannerUrl: def.bannerUrl,
      currency: "KES",
      hasWebsite: true,
      showOnGhuba: true,
    },
    create: {
      slug: def.slug,
      name: def.name,
      tagline: def.tagline,
      description: def.description,
      category: def.category,
      variant: def.variant,
      contactEmail: def.contactEmail,
      contactPhone: def.contactPhone,
      address: def.address,
      logoUrl: def.logoUrl,
      bannerUrl: def.bannerUrl,
      currency: "KES",
      hasWebsite: true,
      showOnGhuba: true,
      ...(ownerUserId ? { userId: ownerUserId } : {}),
    },
  });

  // Upsert each demo product idempotently by (companyId + name)
  for (const p of def.products) {
    const existing = await prisma.product.findFirst({
      where: { companyId: company.id, name: p.name },
    });

    const payload = {
      name: p.name,
      description: p.description,
      longDescription: p.description,
      category: p.category,
      subCategoryName: p.subCategoryName,
      brand: p.brand,
      companyId: company.id,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      finalPrice: p.sellingPrice,
      profitMargin: p.sellingPrice - p.costPrice,
      quantity: p.quantity,
      color: p.color,
      size: p.size,
      tags: p.tags,
      images: [p.imageUrl],
      videos: [],
      ebooks: [],
      weight: [],
      material: [],
      pricingTiers: [],
      condition: "New",
      isAvailable: true,
      isFeatured: Boolean(p.isFeatured),
      isNewArrival: Boolean(p.isNewArrival),
    };

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await prisma.product.create({
        data: payload,
      });
    }
  }

  // Ensure demo store has an active subscription so public & POS routes never lock
  if (ownerUserId) {
    const existingSub = await prisma.subscriptionCompany.findFirst({
      where: { companyId: company.id },
    });
    const oneYearOut = new Date();
    oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);

    const plan = await prisma.plan
      .findUnique({ where: { id: LAUNCH_INCLUDED_PLAN_ID } })
      .catch(() => null);

    if (!existingSub) {
      await prisma.subscriptionCompany.create({
        data: {
          companyId: company.id,
          userId: ownerUserId,
          planId: plan?.id ?? null,
          status: "ACTIVE",
          billingCycle: "ANNUALLY",
          amountPaid: 0,
          currency: "KES",
          startedAt: new Date(),
          renewalDate: oneYearOut,
        },
      });
    } else {
      await prisma.subscriptionCompany.update({
        where: { id: existingSub.id },
        data: {
          status: "ACTIVE",
          renewalDate: oneYearOut,
        },
      });
    }
  }

  console.log(`✅ ${def.name} ready with ${def.products.length} products (/stores -> /${def.slug})`);
}

async function main() {
  const adminUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  for (const store of DEMO_STORES) {
    await seedDemoStore(store, adminUser?.id);
  }

  console.log("\n🎉 All SalesmanPro commercial demo stores seeded successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Failed seeding commercial demo stores:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

