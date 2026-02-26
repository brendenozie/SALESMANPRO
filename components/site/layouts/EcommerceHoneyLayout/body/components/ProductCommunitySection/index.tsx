'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBagIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const loader = ({ src }: { src: string }) => src;

export default function ProductCommunitySection() {
  const products = [
    { name: "PURE RAW HONEY", price: "$15.00", img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80" },
    { name: "WILDFLOWER HONEY", price: "$15.00", img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=400&q=80" },
    { name: "FOREST HONEY", price: "$15.00", img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=400&q=80" }
  ];

  return (
    <section className="bg-white py-24 relative overflow-hidden">
      {/* Background Decorative Path - Inspired by Image_5f5d62 */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 1440 800">
        <path fill="none" stroke="black" strokeWidth="2" strokeDasharray="12 16" d="M-100,100 C200,300 500,50 800,400 C1100,750 1300,200 1600,500" />
      </svg>

      <div className="container mx-auto px-6">
        {/* PRODUCT GRID - Inspired by Image_5f563a */}
        <div className="text-center mb-20">
          <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-[#bc9c64] mb-4">The Collection</h2>
          <h3 className="text-4xl font-bold uppercase tracking-tighter italic">Our Products</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          {products.map((product, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group text-center"
            >
              <div className="relative aspect-square mb-6 overflow-hidden bg-[#f9f9f9]">
                <Image 
                  src={product.img} 
                  alt={product.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  loader={loader}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <h4 className="text-sm font-black tracking-widest uppercase mb-2">{product.name}</h4>
              <p className="text-[#bc9c64] font-bold mb-4">{product.price}</p>
              <button className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-[#bc9c64] hover:border-[#bc9c64] transition-all">
                Add to Cart
              </button>
            </motion.div>
          ))}
        </div>

        {/* SOCIAL PROOF & GALLERY - Inspired by Image_5f563a and Image_619c77 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Testimonial Quote */}
          <motion.div 
            className="lg:col-span-4 bg-[#fdf8f1] p-12 relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="absolute top-6 right-8 text-6xl text-[#bc9c64] opacity-20 font-serif">“</span>
            <p className="text-lg italic leading-relaxed text-gray-800 mb-8 relative z-10">
              "The first step to becoming a successful beekeeper is to learn as much as you can about the bees themselves. Beehives require management and good stewardship."
            </p>
            <div>
              <p className="font-bold uppercase tracking-widest text-sm">Anna Moribaldi</p>
              <p className="text-[#bc9c64] text-xs font-bold uppercase tracking-tighter">Honey Lover</p>
            </div>
          </motion.div>

          {/* Gallery Block */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative aspect-square overflow-hidden bg-gray-100">
                <Image 
                  src={`https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=400&q=80&sig=${i}`}
                  alt="Gallery"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  loader={loader}
                />
              </div>
            ))}
            <div className="col-span-2 md:col-span-4 flex justify-between items-center pt-4">
               <h4 className="text-xs font-black uppercase tracking-[0.3em]">Our Gallery</h4>
               <Link href="/gallery" className="flex items-center text-[10px] font-bold uppercase tracking-widest hover:text-[#bc9c64] transition-colors">
                  View All <ArrowRightIcon className="h-3 w-3 ml-2" />
               </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}