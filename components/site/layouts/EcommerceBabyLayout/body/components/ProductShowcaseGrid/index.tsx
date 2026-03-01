'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const productColumns = [
  {
    title: 'Top Sells',
    products: [
      { name: 'Pink Hoodie', price: 2.00, oldPrice: 3.00, rating: 4, img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4' },
      { name: 'Remote Control Car', price: 6.00, oldPrice: 7.00, rating: 4, img: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f' },
      { name: 'Baby Boy Set', price: 2.00, oldPrice: 2.99, rating: 4, img: 'https://images.unsplash.com/photo-1522771935876-249711cd40f2' },
    ]
  },
  {
    title: 'Top Rated',
    products: [
      { name: 'Winter Hat for Baby', price: 7.40, oldPrice: 7.99, rating: 4, img: 'https://images.unsplash.com/photo-1522771935876-249711cd40f2' },
      { name: 'Kids Pampers', price: 3.00, oldPrice: 3.99, rating: 4, img: 'https://images.unsplash.com/photo-1617330780360-6060c4c4d57c' },
      { name: 'Electric Bike Toy', price: 2.60, oldPrice: 2.99, rating: 4, img: 'https://images.unsplash.com/photo-1532330393533-443990a51d10' },
    ]
  },
  {
    title: 'Trending Items',
    products: [
      { name: 'Puzzle Game', price: 28.50, oldPrice: 30.99, rating: 4, img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831' },
      { name: 'Baby shampoo', price: 15.00, oldPrice: 19.90, rating: 4, img: 'https://images.unsplash.com/photo-1559599101-f09722fb4948' },
      { name: 'Robo Toys', price: 3.75, oldPrice: 3.99, rating: 4, img: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c' },
    ]
  },
  {
    title: 'Recently Added',
    products: [
      { name: 'Red Sneakers', price: 12.00, oldPrice: 15.00, rating: 5, img: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782' },
      { name: 'Baby Stroller', price: 45.00, oldPrice: 50.00, rating: 5, img: 'https://images.unsplash.com/photo-1591339102716-4bc24f7c41bc' },
      { name: 'Girl Blue Dress', price: 18.00, oldPrice: 22.00, rating: 5, img: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7' },
    ]
  }
];

export default function ProductShowcaseGrid() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F472B6';

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-24 overflow-hidden">
      {/* Ambient background glows */}
      <div 
        className="absolute top-1/4 -left-20 w-72 h-72 rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
        {productColumns.map((column, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            {/* Elegant Header */}
            <div className="mb-10 relative">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 block mb-1">
                Collection {idx + 1}
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {column.title}
              </h3>
              <div 
                className="mt-3 h-1.5 w-8 rounded-full" 
                style={{ backgroundColor: primaryColor }}
              />
            </div>

            <div className="flex flex-col gap-8">
              {column.products.map((product, pIdx) => (
                <Link 
                  key={pIdx} 
                  href={`/product/${product.name.toLowerCase().replace(/ /g, '-')}`}
                  className="group flex items-center gap-5"
                >
                  {/* Modern Image Container */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-slate-50 rounded-[2rem] overflow-hidden p-3 transition-all duration-500 group-hover:bg-white group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] group-hover:-translate-y-1">
                    <Image 
                      src={product.img} 
                      alt={product.name} 
                      fill 
                      className="object-contain transition-transform duration-700 group-hover:scale-110" 
                      loader={({ src, width }) => `${src}?w=${width}&q=75`}
                    />
                  </div>

                  {/* Info Section */}
                  <div className="flex flex-col">
                    <h4 className="text-sm font-black text-slate-600 group-hover:text-slate-900 transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    
                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 my-1.5">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`h-3 w-3 ${i < product.rating ? 'text-amber-400' : 'text-slate-200'}`} 
                        />
                      ))}
                    </div>

                    {/* Price with Boutique Styling */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-slate-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-[10px] text-slate-300 line-through font-bold decoration-slate-300/50">
                          ${product.oldPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subtle bottom decorative line */}
      <div className="mt-20 w-full h-px bg-slate-100" />
    </section>
  );
}