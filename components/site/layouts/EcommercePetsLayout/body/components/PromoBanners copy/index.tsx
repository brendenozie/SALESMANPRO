'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Category {
  title: string;
  items: number;
  image: string;
  bgColor: string;
  href: string;
}

export default function ShopByCategories() {
  const categories: Category[] = [
    {
      title: 'For Rodents',
      items: 6,
      image:
        'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
      bgColor: '#FECACA',
      href: '/categories/rodents',
    },
    {
      title: 'For Cats',
      items: 12,
      image:
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80',
      bgColor: '#C7D2FE',
      href: '/categories/cats',
    },
    {
      title: 'For Dogs',
      items: 10,
      image:
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
      bgColor: '#BFDBFE',
      href: '/categories/dogs',
    },
    {
      title: 'For Birds',
      items: 15,
      image:
        'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80',
      bgColor: '#D9F99D',
      href: '/categories/birds',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-20 text-center">
        
        {/* Header */}
        <div className="mb-14">
          <p className="text-sm font-semibold text-blue-500 uppercase tracking-widest">
            Our Products
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-indigo-700 mt-3">
            Shop by Categories
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
            >
              <Link href={category.href}>
                <div className="flex flex-col items-center space-y-6">

                  {/* Image with blob */}
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    
                    {/* Blob background */}
                    <div
                      className="absolute w-40 h-40 rounded-full transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: category.bgColor }}
                    />

                    {/* Pet image */}
                    <div className="relative w-40 h-40">
                      <Image decoding="async"
                        src={category.image}
                        alt={category.title}
                        fill
                        className="object-contain z-10"
                        sizes="160px"
                      />
                    </div>
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {category.items} item(s)
                    </p>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}