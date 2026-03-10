'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const productColumns = [
  {
    title: 'Top Sells',
    label: 'Popular Picks',
    products: [
      { name: 'Pink Hoodie', price: 2.00, oldPrice: 3.00, rating: 4, img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4' },
      { name: 'Remote Control Car', price: 6.00, oldPrice: 7.00, rating: 4, img: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f' },
      { name: 'Baby Boy Set', price: 2.00, oldPrice: 2.99, rating: 4, img: 'https://images.unsplash.com/photo-1522771935876-249711cd40f2' },
    ]
  },
  {
    title: 'Top Rated',
    label: 'Parent Approved',
    products: [
      { name: 'Winter Hat for Baby', price: 7.40, oldPrice: 7.99, rating: 4, img: 'https://images.unsplash.com/photo-1522771935876-249711cd40f2' },
      { name: 'Kids Pampers', price: 3.00, oldPrice: 3.99, rating: 4, img: 'https://images.unsplash.com/photo-1617330780360-6060c4c4d57c' },
      { name: 'Electric Bike Toy', price: 2.60, oldPrice: 2.99, rating: 4, img: 'https://images.unsplash.com/photo-1532330393533-443990a51d10' },
    ]
  },
  {
    title: 'Trending',
    label: 'Viral Now',
    products: [
      { name: 'Puzzle Game', price: 28.50, oldPrice: 30.99, rating: 4, img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831' },
      { name: 'Baby shampoo', price: 15.00, oldPrice: 19.90, rating: 4, img: 'https://images.unsplash.com/photo-1559599101-f09722fb4948' },
      { name: 'Robo Toys', price: 3.75, oldPrice: 3.99, rating: 4, img: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c' },
    ]
  },
  {
    title: 'New Arrivals',
    label: 'Just In',
    products: [
      { name: 'Red Sneakers', price: 12.00, oldPrice: 15.00, rating: 5, img: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782' },
      { name: 'Baby Stroller', price: 45.00, oldPrice: 50.00, rating: 5, img: 'https://images.unsplash.com/photo-1591339102716-4bc24f7c41bc' },
      { name: 'Girl Blue Dress', price: 18.00, oldPrice: 22.00, rating: 5, img: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7' },
    ]
  }
];

export default function ProductShowcaseGrid() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF8FA3';

  return (
    <section className="relative max-w-[1800px] mx-auto px-6 md:px-12 py-32 bg-white dark:bg-zinc-950 transition-colors">
      
      {/* Background flourish */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-zinc-50/50 dark:from-zinc-900/20 to-transparent pointer-events-none" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-20 relative z-10">
        {productColumns.map((column, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: idx * 0.15 }}
            viewport={{ once: true }}
            className="group/column"
          >
            {/* Boutique Header */}
            <div className="mb-14 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 block">
                {column.label}
              </span>
              <div className="flex items-center gap-4">
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                  {column.title}
                </h3>
                <div 
                  className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800 transition-all group-hover/column:flex-[2]" 
                />
              </div>
            </div>

            <div className="relative space-y-12">
              {/* Vertical path line */}
              <div className="absolute left-6 top-8 bottom-8 w-px bg-zinc-100 dark:bg-zinc-800 -z-10 group-hover/column:bg-zinc-200 transition-colors" />

              {column.products.map((product, pIdx) => (
                <div key={pIdx} className="group relative">
                  <Link 
                    href={`/ecommerce/product/${product.name.toLowerCase().replace(/ /g, '-')}`}
                    className="flex items-center gap-6"
                  >
                    {/* Artistic Image Container */}
                    <div className="relative w-28 h-28 flex-shrink-0">
                      <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-900 rounded-tr-[2.5rem] rounded-bl-[2.5rem] rounded-tl-lg rounded-br-lg transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-sm group-hover:shadow-xl" />
                      <div className="relative h-full w-full p-4">
                        <Image 
                          src={product.img} 
                          alt={product.name} 
                          fill 
                          className="object-contain p-2 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6" 
                          loader={({ src, width }) => `${src}?w=${width}&q=80`}
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-black text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-tight">
                        {product.name}
                      </h4>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`h-2.5 w-2.5 ${i < product.rating ? '' : 'text-zinc-200 dark:text-zinc-800'}`} 
                            style={{ color: i < product.rating ? primaryColor : undefined }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs text-zinc-300 dark:text-zinc-600 line-through font-bold">
                            ${product.oldPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Quick Buy Action Button */}
                  <button 
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-50 dark:border-zinc-700 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 flex items-center justify-center hover:text-white"
                    style={{ '--hover-bg': primaryColor } as any}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}