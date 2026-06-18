// app/[slug]/products/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/server/db/prismadb";
import { ListingMarketStatus, ListingSystemStatus, ListingTransactionType, MarketListingForm } from "@/types/typings";
import ProductListWrapper from "./components/ProductListWrapper/ProductListWrapper";
import { findCompanyCached } from "@/lib/company-fetcher";

// --- Mock sample products (used when DB has no listings) ---
const mockProducts: MarketListingForm[] = [
  {
    id: "1",
    name: "Nike Air Force 1 LV5",
    images: [{ _key: "img1", url: "https://via.placeholder.com/600/FF5733" }],
    finalPrice: 99.95,
    sellingPrice: 119.95,
    category: "Men's Shoes",
    color: ["white", "red"],
    isNewArrival: true,
    isOnOffer: true,
    isFeatured: false,
    isDiscounted: true,
    status: "ACTIVE",
    productCategoryId: "cat_1",
    subCategory: undefined,
    tags: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    pricingTiers: [],
    isAvailable: true,
    isFlashDeal: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: "",
    duration: undefined,
    location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE,
    option: []
  },
  {
    id: "2",
    name: "Red Runner Sneakers",
    images: [{ _key: "img2", url: "https://via.placeholder.com/600/33FF57" }],
    finalPrice: 159.95,
    sellingPrice: 180.0,
    category: "Men's Shoes",
    color: ["red", "black"],
    isNewArrival: false,
    isOnOffer: false,
    isFeatured: true,
    isDiscounted: false,
    status: "ACTIVE",
    productCategoryId: "cat_1",
    subCategory: undefined,
    tags: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    pricingTiers: [],
    isAvailable: true,
    isFlashDeal: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: "",
    duration: undefined,
    location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE,
    option: []
  },
];

// --- Page Props ---
interface PageProps {
  params:Promise<{ slug: string }>
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ProductListPage({ params, searchParams }: PageProps) {
  const { slug } = await params; 
  const searchParamsResolved = await searchParams;

  // Ensure store exists
  const company = await findCompanyCached(slug, "lean");

  if (!company) notFound();

  // Extract filters
  const search = searchParamsResolved.search || "";
  const categoryId = searchParamsResolved.category || null;
  const sort = searchParamsResolved.sort || "newest";
  const minPrice = parseFloat(searchParamsResolved.minPrice || "0");
  const maxPrice = parseFloat(searchParamsResolved.maxPrice || "100000");

  // Build DB filters
  const where: any = { companyId: company.id };
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (categoryId) where.productCategoryId = categoryId;
  if (minPrice || maxPrice) where.finalPrice = { gte: minPrice, lte: maxPrice };

  // Sorting
  let orderBy: any = { createdAt: "desc" };
  if (sort === "priceAsc") orderBy = { finalPrice: "asc" };
  if (sort === "priceDesc") orderBy = { finalPrice: "desc" };
  if (sort === "rating") orderBy = { rating: "desc" };

  // Fetch from DB
  const [listings, categories] = await Promise.all([
    prisma.marketplaceListings.findMany({
      where,
      orderBy,
      take: 20,
      select: {
        id: true,
        name: true,
        finalPrice: true,
        sellingPrice: true,
        images: true,
        productCategoryId: true,
        option: true,
      },
    }),
    prisma.storeCategory.findMany({
      orderBy: { displayName: "asc" },
      where: { companyId: company.id },
      select: { id: true, displayName: true, categoryId: true, category: true },
    }),
  ]);

  // --- Normalize DB results into MarketListingForm ---
  const normalizedListings: MarketListingForm[] = listings.map((p) => ({
    id: p.id,
    name: p.name,
    finalPrice: p.finalPrice || 0,
    sellingPrice: p.sellingPrice || 0,
    images: Array.isArray(p.images) ? p.images : [],
    productCategoryId: p.productCategoryId || '',
    option: p.option || [],

    // Fill in defaults for required fields
    category: "",
    color: [],
    isNewArrival: false,
    isOnOffer: false,
    isFeatured: false,
    isDiscounted: false,
    status: "ACTIVE",
    subCategory: undefined,
    tags: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    buyingPrice: 0,
    pricingTiers: [],
    isAvailable: true,
    isFlashDeal: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: "",
    duration: undefined,
    location: null,
  }));

  // Fallback if DB empty
  const products: MarketListingForm[] =
    normalizedListings.length > 0 ? normalizedListings : mockProducts;

  // Normalize categories
  const cats = categories.length
    ? categories.map((c) => ({ id: c.id, displayName: c.displayName, categoryId: c.categoryId, category: c.category }))
    : [
        { id: "cat_1", displayName: "Men's Shoes", categoryId: "cat_1", category: "Shoes" },
        { id: "cat_2", displayName: "Accessories", categoryId: "cat_2", category: "Accessories" },
        { id: "cat_3", displayName: "Home Goods", categoryId: "cat_3", category: "Home" },
      ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-8 pt-24">
      <ProductListWrapper products={products} categories={cats} />
    </div>
  );
}
