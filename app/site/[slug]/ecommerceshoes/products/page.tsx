// This is a Server Component, so no 'use client' directive
import React from 'react';
import { notFound } from 'next/navigation';
import { MarketListingForm } from '@/types/typings';
import ProductListWrapper from './components/ProductListWrapper/ProductListWrapper';

// This is a Server Action or a server-side function. It directly uses the searchParams to filter data on the server.
const fetchProducts = async (searchParams: { [key: string]: string | string[] | undefined }): Promise<MarketListingForm[]> => {
  // In a real application, you would connect to your database here.
  // For this example, we'll use a mock API.
  // We'll also return a Promise to simulate network latency.
  const mockProducts: MarketListingForm[] = [
    {
      id: '1',
      name: 'Nike Air Force 1 LV5',
      images: [{ _key: 'img1', url: 'https://via.placeholder.com/600/FF5733' }],
      finalPrice: 99.95,
      sellingPrice: 119.95,
      category: "Men's Shoes",
      color: ['white', 'red'],
      isNewArrival: true,
      isOnOffer: true,
      isFeatured: false,
      isDiscounted: true,
      status: 'ACTIVE',
      // ...other properties as defined in MarketListingForm
      productCategoryId: 'cat_1', subCategory: undefined, tags: [], option: [], size: [], weight: [], material: [], quantity: 0, buyingPrice: 0, pricingTiers: [], isAvailable: true, isFlashDeal: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: false, paymentOption: '', duration: undefined, location: null,
    },
    {
      id: '2',
      name: 'Red Runner Sneakers',
      images: [{ _key: 'img2', url: 'https://via.placeholder.com/600/33FF57' }],
      finalPrice: 159.95,
      sellingPrice: 180.00,
      category: "Men's Shoes",
      color: ['red', 'black'],
      isNewArrival: false,
      isOnOffer: false,
      isFeatured: true,
      isDiscounted: false,
      status: 'ACTIVE',
      // ...other properties as defined in MarketListingForm
      productCategoryId: 'cat_1', subCategory: undefined, tags: [], option: [], size: [], weight: [], material: [], quantity: 0, buyingPrice: 0, pricingTiers: [], isAvailable: true, isFlashDeal: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: false, paymentOption: '', duration: undefined, location: null,
    },
    {
      id: '3',
      name: 'Classic Black Trainers',
      images: [{ _key: 'img3', url: 'https://via.placeholder.com/600/3357FF' }],
      finalPrice: 110.00,
      sellingPrice: 180.00,
      category: "Men's Shoes",
      color: ['black'],
      isNewArrival: false,
      isOnOffer: true,
      isFeatured: false,
      isDiscounted: true,
      status: 'ACTIVE',
      // ...other properties as defined in MarketListingForm
      productCategoryId: 'cat_1', subCategory: undefined, tags: [], option: [], size: [], weight: [], material: [], quantity: 0, buyingPrice: 0, pricingTiers: [], isAvailable: true, isFlashDeal: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: false, paymentOption: '', duration: undefined, location: null,
    },
    {
      id: '4',
      name: 'Blue Sky Trainers',
      images: [{ _key: 'img4', url: 'https://via.placeholder.com/600/FFFF33' }],
      finalPrice: 135.00,
      sellingPrice: 180.00,
      category: "Men's Shoes",
      color: ['blue', 'gray'],
      isNewArrival: true,
      isOnOffer: false,
      isFeatured: false,
      isDiscounted: false,
      status: 'ACTIVE',
      // ...other properties as defined in MarketListingForm
      productCategoryId: 'cat_1', subCategory: undefined, tags: [], option: [], size: [], weight: [], material: [], quantity: 0, buyingPrice: 0, pricingTiers: [], isAvailable: true, isFlashDeal: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: false, paymentOption: '', duration: undefined, location: null,
    },
    {
      id: '5',
      name: 'Gray Casual Loafers',
      images: [{ _key: 'img5', url: 'https://via.placeholder.com/600/57FF33' }],
      finalPrice: 85.00,
      sellingPrice: 95.00,
      category: "Men's Shoes",
      color: ['gray'],
      isNewArrival: false,
      isOnOffer: true,
      isFeatured: false,
      isDiscounted: true,
      status: 'ACTIVE',
      // ...other properties as defined in MarketListingForm
      productCategoryId: 'cat_1', subCategory: undefined, tags: [], option: [], size: [], weight: [], material: [], quantity: 0, buyingPrice: 0, pricingTiers: [], isAvailable: true, isFlashDeal: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: false, paymentOption: '', duration: undefined, location: null,
    },
    {
      id: '6',
      name: 'High-Top Sneakers',
      images: [{ _key: 'img6', url: 'https://via.placeholder.com/600/FF3357' }],
      finalPrice: 165.00,
      sellingPrice: 180.00,
      category: "Men's Shoes",
      color: ['black', 'white'],
      isNewArrival: false,
      isOnOffer: false,
      isFeatured: true,
      isDiscounted: false,
      status: 'ACTIVE',
      // ...other properties as defined in MarketListingForm
      productCategoryId: 'cat_1', subCategory: undefined, tags: [], option: [], size: [], weight: [], material: [], quantity: 0, buyingPrice: 0, pricingTiers: [], isAvailable: true, isFlashDeal: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: false, paymentOption: '', duration: undefined, location: null,
    },
  ];

  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  const search = (searchParams.search as string)?.toLowerCase() || '';
  const category = (searchParams.category as string) || null;
  const sort = (searchParams.sort as string) || 'newest';
  const minPrice = parseFloat(searchParams.minPrice as string || '0');
  const maxPrice = parseFloat(searchParams.maxPrice as string || '1000');
  const colors = (searchParams.colors as string)?.split(',') || [];

  const filtered = mockProducts.filter(p => {
    if (category && p.productCategoryId !== category) return false;
    if (colors.length > 0 && !p.color.some(c => colors.includes(c))) return false;
    if ((p?.finalPrice || 0) < minPrice || (p?.finalPrice ?? 0) > maxPrice) return false;
    if (search && !p.name.toLowerCase().includes(search)) return false;
    return true;
  });

  const sorted = filtered.sort((a, b) => {
    if (sort === 'priceAsc') return (a.finalPrice || 0) - (b.finalPrice || 0);
    if (sort === 'priceDesc') return (b.finalPrice || 0) - (a.finalPrice || 0);
    return 0; // Default to original order
  });

  return sorted;
};

// This component is now an async Server Component
export default async function ProductListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {

  // Await the product data directly on the server
  const products = await fetchProducts(searchParams);

  // Example categories - in a real app, this would be fetched from the backend
  const categories = [
    { id: 'cat_1', name: "Men's Shoes" },
    { id: 'cat_2', name: 'Accessories' },
    { id: 'cat_3', name: 'Home Goods' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-8 pt-24">
      <ProductListWrapper products={products} categories={categories} />
    </div>
  );
}
