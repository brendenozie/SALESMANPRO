'use client';

import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { ArrowRightCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Placeholder data for demonstration purposes
const dummyProducts = [
  {
    id: '1',
    name: 'Elegant Summer Dress',
    images: ['/images/popular-product-1.jpg'],
    price: 49.99,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Men’s Casual Shirt',
    images: ['/images/popular-product-2.jpg'],
    price: 35.50,
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Luxury Leather Bag',
    images: ['/images/popular-product-3.jpg'],
    price: 120.00,
    rating: 5.0,
  },
  {
    id: '4',
    name: 'Sport Sneakers',
    images: ['/images/popular-product-4.jpg'],
    price: 85.00,
    rating: 4.2,
  },
  {
    id: '5',
    name: 'Vintage Denim Jacket',
    images: ['/images/popular-product-5.jpg'],
    price: 75.00,
    rating: 4.6,
  },
  {
    id: '6',
    name: 'Designer Sunglasses',
    images: ['/images/popular-product-6.jpg'],
    price: 99.99,
    rating: 4.9,
  },
];

// ProductCard Component - included directly for a self-contained example
const ProductCard = ({ product, primary }: { product: any; primary: string }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      className="flex-shrink-0 w-64 md:w-72 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform-gpu cursor-pointer group relative overflow-hidden"
    >
      <div className="relative w-full h-72 rounded-t-xl overflow-hidden">
        <Image
          src={product.images[0] || '/images/placeholder.jpg'}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-500 group-hover:scale-110"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">${product.price.toFixed(2)}</p>
        <div className="flex items-center mt-2">
          <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
        </div>
      </div>

      {/* Hover to add to cart button */}
      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <button
          style={{ backgroundColor: primary }}
          className="p-2 rounded-full text-white shadow-lg transform translate-y-10 group-hover:translate-y-0 transition-all duration-300"
        >
          <ArrowRightCircleIcon className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};


export default function PopularProducts() {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { slug, marketplaceListings = [], themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#f97316';
  const secondary = themeSettings?.secondaryColor || '#3b82f6';
  const productsToShow = marketplaceListings?.length > 0 ? marketplaceListings : dummyProducts;

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Gradient Circle */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-10 blur-3xl z-0"
        style={{
          background: `radial-gradient(circle, ${primary} 0%, ${secondary} 100%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header with stylized title and badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12">
          <div>
            <span
              className="px-4 py-1 rounded-full text-xs font-semibold uppercase text-white"
              style={{ backgroundColor: primary }}
            >
              Top Picks
            </span>
            <h2 className="mt-2 text-4xl font-extrabold text-gray-900 leading-tight">
              Popular Products
            </h2>
            <p className="mt-2 text-gray-600 max-w-lg">
              Check out our most sought-after products, loved by customers around the globe.
            </p>
          </div>
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="flex items-center mt-4 md:mt-0 text-gray-700 font-semibold text-lg hover:text-black transition-colors"
          >
            See All Products <ArrowRightCircleIcon className="w-6 h-6 ml-2" />
          </motion.a>
        </div>

        {/* Product Carousel / Slider */}
        <div className="flex space-x-6 overflow-x-scroll no-scrollbar py-6 snap-x snap-mandatory">
          {productsToShow.map((product: any) => (
            <div key={product.id} className="snap-start">
              <ProductCard product={product} primary={primary} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}