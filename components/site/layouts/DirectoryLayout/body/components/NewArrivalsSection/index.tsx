'use client';

import React, { useRef, useState } from 'react';
import {
  HeartIcon,
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { createPortal } from 'react-dom';

const products = [
  {
    id: 1,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product1.jpg',
    rating: 4,
  },
  {
    id: 2,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product2.jpg',
    tags: ['New'],
    rating: 5,
  },
  {
    id: 3,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product3.jpg',
    tags: ['New'],
    rating: 3,
  },
  {
    id: 4,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product4.jpg',
    tags: ['New'],
    rating: 4,
  },
  {
    id: 5,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product5.jpg',
    tags: ['New'],
    rating: 5,
  },
  {
    id: 6,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product5.jpg',
    tags: ['New'],
    rating: 4,
  },
  {
    id: 7,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product5.jpg',
    tags: ['New'],
    rating: 3,
  },
  {
    id: 8,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product5.jpg',
    tags: ['New'],
    rating: 4,
  },
  {
    id: 9,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product5.jpg',
    tags: ['New'],
    rating: 5,
  },
];


export default function NewArrivalsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -width : width,
      behavior: 'smooth',
    });
  };

  const handleAddToCart = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) =>
      i < count ? (
        <StarSolid key={i} className="h-4 w-4 text-yellow-400" />
      ) : (
        <StarIcon key={i} className="h-4 w-4 text-gray-300" />
      )
    );
  };

  return (
    <section className="relative px-6 py-16 bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">New Arrivals</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-white border rounded-full shadow hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-white border rounded-full shadow hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex space-x-6 overflow-x-auto no-scrollbar">
        {products.map((p) => (
          <div
            key={p.id}
            className="min-w-[220px] bg-white rounded-2xl shadow-md hover:shadow-xl transition-all relative group"
          >
            <button className="absolute top-3 right-3 p-1 bg-white rounded-full shadow hover:bg-gray-100">
              <HeartIcon className="h-5 w-5 text-gray-500 group-hover:text-red-500 transition" />
            </button>
            {(p.tags?.length ?? 0) > 0 && (
              <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {p.tags?.[0]}
              </span>
            )}

            <img
              src={p.img}
              alt={p.title}
              className="w-full h-44 object-cover rounded-t-2xl cursor-pointer"
              onClick={() => setSelectedProduct(p)}
            />

            <div className="p-4">
              <p className="text-xs text-gray-400 uppercase">{p.brand}</p>
              <h3 className="font-medium text-gray-800">{p.title}</h3>
              <p className="text-sm text-gray-500">{p.category}</p>
              <div className="flex items-center space-x-1 mt-1">{renderStars(p.rating)}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-semibold text-gray-800">{p.price}</span>
                <button
                  onClick={handleAddToCart}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <ShoppingBagIcon className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-bounce">
          Added to cart!
        </div>
      )}

      {/* Modal */}
      {selectedProduct &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <img
                src={selectedProduct.img}
                alt={selectedProduct.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-bold mb-1">{selectedProduct.title}</h2>
              <p className="text-sm text-gray-600 mb-2">{selectedProduct.brand}</p>
              <div className="flex items-center mb-4 space-x-1">
                {renderStars(selectedProduct.rating)}
              </div>
              <p className="text-lg font-semibold">{selectedProduct.price}</p>
              <p className="mt-2 text-sm text-gray-500">Category: {selectedProduct.category}</p>
              <button
                className="mt-4 w-full py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                onClick={() => {
                  handleAddToCart();
                  setSelectedProduct(null);
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
