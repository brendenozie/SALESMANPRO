'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function MassageFeatures() {
  const { storeFormData } = useStoreContext();
  const { marketplaceListings = [] } = storeFormData;

  const [search, setSearch] = useState('');

  const filteredListings = marketplaceListings.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="relative bg-gray-950 py-24 overflow-hidden text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-black to-gray-950" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <motion.span
            className="inline-block bg-emerald-400/10 text-emerald-300 text-sm font-semibold px-4 py-1.5 rounded-full"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Services
          </motion.span>
          <motion.h2
            className="mt-6 text-4xl sm:text-5xl font-bold text-white tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Explore Our Signature Services
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            From deep relief to soothing therapies, our offerings are designed for your wellness journey.
          </motion.p>

          <div className="mt-6">
            <input
              type="text"
              placeholder="Search services..."
              className="px-4 py-2 w-full max-w-md rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredListings.length > 0 ? (
            filteredListings.map((item, i) => (
              <motion.div
                key={item.id}
                className="relative rounded-3xl overflow-hidden backdrop-blur-md border border-white/10 bg-white/5 shadow-lg hover:shadow-xl transition-all flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={item.images?.[0] || '/images/placeholder.jpg'}
                    loader={loader}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-300 flex-grow">
                    {item.description || 'No description available.'}
                  </p>

                  <div className="mt-5 space-x-2 flex flex-wrap w-full">
                    <Link
                      href={`/bookings/${item.id}`}
                      className="bg-emerald-500 w-full text-center items-center hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-medium transition-all shadow-md"
                    >
                      Book Now
                    </Link>
                    {/* {item.isFeatured && (
                      <Link
                        href={`/services/${item.id}`}
                        className="bg-white/10 hover:bg-white/20 text-center items-center text-white px-4 py-2 rounded-full font-medium transition-all"
                      >
                        Explore More →
                      </Link>
                    )} */}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-400">No services found matching "{search}"</p>
          )}
        </div>
      </div>
    </section>
  );
}
