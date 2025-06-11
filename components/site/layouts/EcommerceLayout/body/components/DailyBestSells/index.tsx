'use client';

import React from 'react';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountLabel?: string;
  rating: number;
  reviews: number;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Organic Honey',
    image: '/images/honey.jpg',
    price: 9.99,
    originalPrice: 12.99,
    discountLabel: 'Save 23%',
    rating: 4.7,
    reviews: 123,
  },
  {
    id: 2,
    name: 'Fresh Almonds',
    image: '/images/almonds.jpg',
    price: 14.99,
    discountLabel: '',
    rating: 4.5,
    reviews: 98,
  },
  {
    id: 3,
    name: 'Premium Green Tea',
    image: '/images/greentea.jpg',
    price: 7.99,
    originalPrice: 9.99,
    discountLabel: '20% Off',
    rating: 4.3,
    reviews: 45,
  },
  {
    id: 4,
    name: 'Fresh Strawberries',
    image: '/images/strawberries.jpg',
    price: 5.99,
    discountLabel: 'Hot',
    rating: 4.8,
    reviews: 200,
  },
];

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
  <div className="relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 p-4 flex flex-col items-center">
    {product.discountLabel && (
      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
        {product.discountLabel}
      </div>
    )}
    <img
      src={product.image}
      alt={product.name}
      className="w-full h-40 object-cover rounded-md mb-4"
    />
    <h3 className="text-lg font-semibold text-gray-800 text-center">
      {product.name}
    </h3>
    <div className="mt-2 text-green-600 font-bold">
      ${product.price.toFixed(2)}
      {product.originalPrice && (
        <span className="text-gray-400 line-through text-sm ml-2">
          ${product.originalPrice.toFixed(2)}
        </span>
      )}
    </div>
    <div className="mt-2 text-yellow-500 text-sm">
      ⭐ {product.rating} ({product.reviews})
    </div>
    <button className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full">
      + Add
    </button>
  </div>
);

export default function DailyBestSells() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Daily Best Sells</h2>
          <button className="flex items-center text-green-600 font-semibold hover:underline">
            See All <ArrowRightCircleIcon className="w-6 h-6 ml-2" />
          </button>
        </div>
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
