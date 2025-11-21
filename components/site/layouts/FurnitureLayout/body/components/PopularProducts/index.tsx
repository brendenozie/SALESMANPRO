'use client';

import useSWR from 'swr';
import { SkeletonGrid } from '@/components/site/SkeletonGrid/SkeletonGrid';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { MarketListingForm } from '@/types/typings';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HeartIcon, ArrowRightIcon, CubeIcon, SwatchIcon } from '@heroicons/react/24/outline';
import ProductCard from '../ProductCard';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// --- 1. Interface (As Provided) ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
}

const MOCK_FURNITURE: MarketListingForm[] = [
  {
    id: 'f1',
    name: 'Oslo Lounge Chair',
    description: 'Mid-century modern aesthetic with premium ash wood structure.',
    sellingPrice: 450,
    finalPrice: 399,
    isDiscounted: true,
    discount: 12,
    isNewArrival: true,
    isOnOffer: true,
    isFlashDeal: false,
    isFeatured: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1000&auto=format&fit=crop'],
    tags: ['Living Room', 'Scandi'],
    brand: 'NordicHome',
    color: ['Beige', 'Walnut'],
    size: [],
    material: ['Ash Wood', 'Linen'],
    dimensions: 'H: 80cm x W: 75cm',
    condition: 'New',
    quantity: 5,
    category: 'Furniture',
    subCategory: 'Chairs',
    productCategoryId: 'cat_f1',
    option: [],
    weight: [],
    pricingTiers: [],
    features: [],
    bedrooms: [],
    studios: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: true,
    paymentOption: 'Online',
    status: 'ACTIVE',
    location: {},
    duration: null,
    buyingPrice: 0,
    bookingSlots: undefined
  },
  {
    id: 'f2',
    name: 'Marble Coffee Table',
    description: 'Solid Carrara marble top with industrial steel legs.',
    sellingPrice: 800,
    finalPrice: 800,
    isDiscounted: false,
    isNewArrival: false,
    isOnOffer: false,
    isFlashDeal: false,
    isFeatured: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1634646477375-586b0208ba51?q=80&w=1000&auto=format&fit=crop'],
    tags: ['Minimalist', 'Luxury'],
    brand: 'StoneCraft',
    color: ['White', 'Black'],
    size: [],
    material: ['Marble', 'Steel'],
    dimensions: 'D: 90cm x H: 45cm',
    condition: 'New',
    quantity: 2,
    category: 'Furniture',
    subCategory: 'Tables',
    productCategoryId: 'cat_f2',
    option: [],
    weight: [],
    pricingTiers: [],
    features: [],
    bedrooms: [],
    studios: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: true,
    paymentOption: 'Online',
    status: 'ACTIVE',
    location: {},
    duration: null,
    buyingPrice: 0,
    bookingSlots: undefined
  },
  {
    id: 'f3',
    name: 'Velvet Sectional Sofa',
    description: 'Plush velvet finish in deep emerald green. Modular design.',
    sellingPrice: 2100,
    finalPrice: 2100,
    isDiscounted: false,
    isNewArrival: true,
    isOnOffer: false,
    isFlashDeal: false,
    isFeatured: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop'],
    tags: ['Living Room', 'Comfort'],
    brand: 'LuxeLiving',
    color: ['Green'],
    size: [],
    material: ['Velvet', 'Pine'],
    dimensions: 'W: 280cm x D: 160cm',
    condition: 'New',
    quantity: 10,
    category: 'Furniture',
    subCategory: 'Sofas',
    productCategoryId: 'cat_f3',
    option: [],
    weight: [],
    pricingTiers: [],
    features: [],
    bedrooms: [],
    studios: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: true,
    paymentOption: 'Online',
    status: 'ACTIVE',
    location: {},
    duration: null,
    buyingPrice: 0,
    bookingSlots: undefined
  }
];


export default function PopularProducts({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?id=${id}&flag=isFeatured&limit=8`;
  const fetcher = createCachedFetcher(`products-${id}-isFeatured`);

  const fallbackData = typeof window !== 'undefined'
    ? (() => {
        try {
          return JSON.parse(
            localStorage.getItem(`swr-cache:products-${id}-isFeatured:${url}`) || 'null'
          );
        } catch {
          return null;
        }
      })()
    : null;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
    refreshInterval: 120000,
    fallbackData: fallbackData || undefined,
  });

  if (isLoading) return <SkeletonGrid count={8} />;
  if (error) return <div className="text-center text-gray-500"></div>;
  if (!data?.data?.length) return <div className="text-center text-gray-500"></div>;

  return (
    <section className="py-12 max-w-7xl mx-auto px-6 mb-20">
      {/* Title */}
      <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8 text-center">
        Weekly Highlights
      </h2>

      {/* Product Grid (Updated design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {(data.data.length > 0 ? data.data : MOCK_FURNITURE).map((item: any) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}
