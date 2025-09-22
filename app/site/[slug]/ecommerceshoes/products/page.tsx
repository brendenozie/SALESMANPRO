// app/[slug]/products/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/server/db/prismadb";
import { MarketListingForm } from "@/types/typings";
import ProductListWrapper from "./components/ProductListWrapper/ProductListWrapper";

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
    option: [],
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
    option: [],
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
  },
];

// --- Page Props ---
interface PageProps {
  params: { slug: string };
  searchParams: {
    search?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function ProductListPage({ params, searchParams }: PageProps) {
  const { slug } = params;

  // Ensure store exists
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) notFound();

  // Extract filters
  const search = searchParams.search || "";
  const categoryId = searchParams.category || null;
  const sort = searchParams.sort || "newest";
  const minPrice = parseFloat(searchParams.minPrice || "0");
  const maxPrice = parseFloat(searchParams.maxPrice || "100000");

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
      take: 20, // limit for demo
      select: {
        id: true,
        name: true,
        finalPrice: true,
        sellingPrice: true,
        images: true,
        productCategoryId: true,
      },
    }),
    prisma.productCategory.findMany(
      
      { orderBy: { name: "asc" } ,    
      where : { companyId: company.id }
    },
    ),
  ]);

  // Fallback if no DB data
  const products: MarketListingForm[] = listings.length > 0 ? listings : mockProducts;

  // Normalize categories
  const cats = categories.length
    ? categories.map((c) => ({ id: c.id, name: c.name }))
    : [
        { id: "cat_1", name: "Men's Shoes" },
        { id: "cat_2", name: "Accessories" },
        { id: "cat_3", name: "Home Goods" },
      ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-8 pt-24">
      <ProductListWrapper products={products} categories={cats} />
    </div>
  );
}
