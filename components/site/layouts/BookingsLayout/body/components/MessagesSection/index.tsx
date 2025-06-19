'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import { ServiceItem } from '@/app/admin/[slug]/services/AdminServicesClient';
import { XMarkIcon } from '@heroicons/react/24/outline';
import BookingForm from '../../../components/BookingForm';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function MassageFeatures() {
  const { storeFormData } = useStoreContext();
  const { marketplaceListings = [] } = storeFormData;

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ServiceItem | null>(null);

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
            filteredListings.map((item:any, i) => (
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
                  <button
                  onClick={() => setSelected(item)}
                      className="bg-emerald-500 w-full text-center items-center hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-medium transition-all shadow-md"
                    >
                      Book Now
                    </button>
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
      {/* Modal */}
            {selected && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                {/* backdrop */}
                <div
                  className="fixed inset-0 bg-black opacity-50"
                  onClick={() => setSelected(null)}
                />
      
                <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 mx-auto z-60 shadow-xl">
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    onClick={() => setSelected(null)}
                    aria-label="Close"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
      
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                      <Image
                        src={selected.images[0] || "/placeholder.png"}
                        loader={loader}
                        alt={`${selected.name}` || `${selected.title}`}
                        width={500}
                        height={350}
                        className="object-cover rounded-lg w-full h-full"
                      />
                    </div>
                    <div className="md:w-1/2 space-y-4">
                      <h2 className="text-2xl font-bold">{selected.name || selected.title}</h2>
                      <p className="text-gray-700">{selected.description}</p>
                      <p className="text-lg font-semibold">
                        Price: ${ (selected.finalPrice||0).toFixed(2) }
                      </p>
      
                      <BookingForm service={selected} />
                    </div>
                  </div>
                </div>
              </div>
            )}
    </section>
  );
}
