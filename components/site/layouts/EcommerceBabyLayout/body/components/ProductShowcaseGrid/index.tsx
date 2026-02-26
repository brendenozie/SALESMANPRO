'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const productColumns = [
  {
    title: 'Top Sells',
    products: [
      { name: 'Pink Hoodie', price: 2.00, oldPrice: 3.00, rating: 4, img: 'https://unsplash.com/photos/pink-hoodie-12345' },
      { name: 'Remote Control Car', price: 6.00, oldPrice: 7.00, rating: 4, img: 'https://unsplash.com/photos/rc-car-12345' },
      { name: 'Baby Boy Set', price: 2.00, oldPrice: 2.99, rating: 4, img: 'https://unsplash.com/photos/baby-boy-set-12345' },
    ]
  },
  {
    title: 'Top Rated',
    products: [
      { name: 'Winter Hat for Baby', price: 7.40, oldPrice: 7.99, rating: 4, img: 'https://unsplash.com/photos/winter-hat-12345' },
      { name: 'Kids Pampers', price: 3.00, oldPrice: 3.99, rating: 4, img: 'https://unsplash.com/photos/pampers-12345' },
      { name: 'Electric Bike Toy', price: 2.60, oldPrice: 2.99, rating: 4, img: 'https://unsplash.com/photos/e-bike-12345' },
    ]
  },
  {
    title: 'Trending Items',
    products: [
      { name: 'Puzzle Game', price: 28.50, oldPrice: 30.99, rating: 4, img: 'https://unsplash.com/photos/puzzle-game-12345' },
      { name: 'Baby shampoo', price: 15.00, oldPrice: 19.90, rating: 4, img: 'https://unsplash.com/photos/baby-shampoo-12345' },
      { name: 'Robo Toys', price: 3.75, oldPrice: 3.99, rating: 4, img: 'https://unsplash.com/photos/robo-toy-12345' },
    ]
  },
  {
    title: 'Recently Added',
    products: [
      { name: 'Red Sneakers', price: 12.00, oldPrice: 15.00, rating: 5, img: 'https://unsplash.com/photos/red-sneakers-12345' },
      { name: 'Baby Stroller', price: 45.00, oldPrice: 50.00, rating: 5, img: 'https://unsplash.com/photos/baby-stroller-12345' },
      { name: 'Girl Blue Dress', price: 18.00, oldPrice: 22.00, rating: 5, img: 'https://unsplash.com/photos/blue-dress-12345' },
    ]
  }
];

export default function ProductShowcaseGrid() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F472B6';

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {productColumns.map((column, idx) => (
          <div key={idx}>
            {/* Column Header with Pink Underline */}
            <h3 className="text-lg font-black text-gray-900 mb-8 relative inline-block">
              {column.title}
              <div 
                className="absolute -bottom-2 left-0 h-0.5 w-1/2" 
                style={{ backgroundColor: primaryColor }}
              />
            </h3>

            <div className="flex flex-col gap-6">
              {column.products.map((product, pIdx) => (
                <Link 
                  key={pIdx} 
                  href={`/product/${product.name.toLowerCase().replace(/ /g, '-')}`}
                  className="flex items-center gap-4 group"
                >
                  {/* Small Square Icon Container */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-[#FFF0F6] rounded-2xl overflow-hidden p-2 transition-transform group-hover:scale-105">
                    <Image 
                      src={product.img} 
                      alt={product.name} 
                      fill 
                      className="object-contain" 
                      loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-blue-500 transition-colors">
                      {product.name}
                    </h4>
                    
                    {/* Stars */}
                    <div className="flex items-center my-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`h-3 w-3 ${i < product.rating ? 'text-orange-400' : 'text-gray-200'}`} 
                        />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-1">(4)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black" style={{ color: primaryColor }}>
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-300 line-through font-medium">
                        ${product.oldPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}