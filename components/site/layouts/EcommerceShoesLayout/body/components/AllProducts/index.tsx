'use client';

import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import ProductCard from '../ProductCard';
import { MarketListingForm } from '@/types/typings';

interface AllProductsProps {      
  martketplaceListings?: MarketListingForm[];
  themeSettings?: any;
}

export default function AllProducts({ martketplaceListings, themeSettings }: AllProductsProps) {

  const primary = themeSettings?.primaryColor || '#f97316';
  const secondary = themeSettings?.secondaryColor || '#3b82f6';


  // Fallback dummy products that match the MarketListingForm structure
  const dummyProducts: MarketListingForm[] = [
    {
      id: '1',
      name: 'Nike Air Force 1 LV5',
      // slug: { current: 'nike-air-force-1-lv5' },
      category: "Men's Shoes",
      images: [{ _key: 'img1', url: 'https://via.placeholder.com/300' }],
      finalPrice: 99.95,
      sellingPrice: 119.95,
      duration: undefined,
      productCategoryId: '',
      subCategory: undefined,
      tags: [],
      option: [],
      color: [],
      size: [],
      weight: [],
      material: [],
      quantity: 0,
      buyingPrice: 0,
      pricingTiers: [],
      isAvailable: false,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bedrooms: [],
      studios: [],
      features: [],
      bookingSlots: [],
      requiredClientInfo: [],
      amenities: [],
      delivery: false,
      paymentOption: '',
      status: 'ACTIVE',
      location: null
    },
    {
      id: '2',
      name: 'Red Runner Sneakers',
      // slug: { current: 'red-runner-sneakers' },
      category: "Men's Shoes",
      images: [{ _key: 'img2', url: 'https://via.placeholder.com/300' }],
      finalPrice: 159.95,
      sellingPrice: 180.00,
      duration: undefined,
      productCategoryId: '',
      subCategory: undefined,
      tags: [],
      option: [],
      color: [],
      size: [],
      weight: [],
      material: [],
      quantity: 0,
      buyingPrice: 0,
      pricingTiers: [],
      isAvailable: false,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bedrooms: [],
      studios: [],
      features: [],
      bookingSlots: [],
      requiredClientInfo: [],
      amenities: [],
      delivery: false,
      paymentOption: '',
      status: 'ACTIVE',
      location: null
    },
    {
      id: '3',
      name: 'Classic Black Trainers',
      // slug: { current: 'classic-black-trainers' },
      category: "Men's Shoes",
      images: [{ _key: 'img3', url: 'https://via.placeholder.com/300' }],
      finalPrice: 110.00,
      sellingPrice: 180.00,
      duration: undefined,
      productCategoryId: '',
      subCategory: undefined,
      tags: [],
      option: [],
      color: [],
      size: [],
      weight: [],
      material: [],
      quantity: 0,
      buyingPrice: 0,
      pricingTiers: [],
      isAvailable: false,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bedrooms: [],
      studios: [],
      features: [],
      bookingSlots: [],
      requiredClientInfo: [],
      amenities: [],
      delivery: false,
      paymentOption: '',
      status: 'ACTIVE',
      location: null
    },
    {
      id: '4',
      name: 'Blue Sky Trainers',
      // slug: { current: 'blue-sky-trainers' },
      category: "Men's Shoes",
      images: [{ _key: 'img4', url: 'https://via.placeholder.com/300' }],
      finalPrice: 135.00,
      sellingPrice: 180.00,
      duration: undefined,
      productCategoryId: '',
      subCategory: undefined,
      tags: [],
      option: [],
      color: [],
      size: [],
      weight: [],
      material: [],
      quantity: 0,
      buyingPrice: 0,
      pricingTiers: [],
      isAvailable: false,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bedrooms: [],
      studios: [],
      features: [],
      bookingSlots: [],
      requiredClientInfo: [],
      amenities: [],
      delivery: false,
      paymentOption: '',
      status: 'ACTIVE',
      location: null
    },
    {
      id: '5',
      name: 'Gray Casual Loafers',
      // slug: { current: 'gray-casual-loafers' },
      category: "Men's Shoes",
      images: [{ _key: 'img5', url: 'https://via.placeholder.com/300' }],
      finalPrice: 85.00,
      sellingPrice: 95.00,
      duration: undefined,
      productCategoryId: '',
      subCategory: undefined,
      tags: [],
      option: [],
      color: [],
      size: [],
      weight: [],
      material: [],
      quantity: 0,
      buyingPrice: 0,
      pricingTiers: [],
      isAvailable: false,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bedrooms: [],
      studios: [],
      features: [],
      bookingSlots: [],
      requiredClientInfo: [],
      amenities: [],
      delivery: false,
      paymentOption: '',
      status: 'ACTIVE',
      location: null
    },
    {
      id: '6',
      name: 'High-Top Sneakers',
      // slug: { current: 'high-top-sneakers' },
      category: "Men's Shoes",
      images: [{ _key: 'img6', url: 'https://via.placeholder.com/300' }],
      finalPrice: 165.00,
      sellingPrice: 180.00,
      duration: undefined,
      productCategoryId: '',
      subCategory: undefined,
      tags: [],
      option: [],
      color: [],
      size: [],
      weight: [],
      material: [],
      quantity: 0,
      buyingPrice: 0,
      pricingTiers: [],
      isAvailable: false,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bedrooms: [],
      studios: [],
      features: [],
      bookingSlots: [],
      requiredClientInfo: [],
      amenities: [],
      delivery: false,
      paymentOption: '',
      status: 'ACTIVE',
      location: null
    },
  ];

  const productsToShow = martketplaceListings && martketplaceListings?.length > 0 ? martketplaceListings : dummyProducts;


  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">AllProducts</h2>
          <button className="flex items-center text-green-600 font-semibold hover:underline">
            See All <ArrowRightCircleIcon className="w-6 h-6 ml-2" />
          </button>
        </div>
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsToShow.map((product : MarketListingForm) => (
              <ProductCard key={product.id} product={product} primary={primary} />
          ))}
        </div>
      </div>
    </section>
  );
}
