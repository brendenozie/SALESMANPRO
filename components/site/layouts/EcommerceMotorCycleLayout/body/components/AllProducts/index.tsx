'use client';

import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { ArrowRightCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">Curated Selection</span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mt-2">The Whole Collection</h2>
          </div>
          <button 
            onClick={() => window.location.href = `/ecommerce/products`}
            className="group flex items-center gap-2 text-sm font-bold tracking-widest uppercase pb-1 border-b-2 border-black"
          >
            Explore All <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
