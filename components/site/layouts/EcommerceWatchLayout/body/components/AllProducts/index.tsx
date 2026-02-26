'use client';

import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import ProductCard from '../ProductCard';

interface AllProductsProps {
  // Define any props if needed
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AllProducts( { id, marketplaceListings, themeSettings }: AllProductsProps) {

  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  // const { storeFormData } = useStoreContext();
  // const { id, marketplaceListings = [], themeSettings = {} } = storeFormData || {};
  const primary = themeSettings?.primaryColor || '#f97316';
  const secondary = themeSettings?.secondaryColor || '#3b82f6';

  const getQuantity = (id: string) => cart.find((item: any) => item.id === id)?.quantity || 0;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">AllProducts</h2>
          <button 
          onClick={() => window.location.href = `/ecommerce/products`}
          className="flex items-center text-green-600 font-semibold hover:underline">
            See All <ArrowRightCircleIcon className="w-6 h-6 ml-2" />
          </button>
        </div>
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {marketplaceListings.map((product) => (
              <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
