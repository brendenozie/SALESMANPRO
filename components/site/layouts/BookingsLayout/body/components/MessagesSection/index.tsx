'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import { ServiceItem } from '@/app/admin/[slug]/services/AdminServicesClient';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import BookingForm from '../../../components/BookingForm';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function ServicesSection() {
  const { storeFormData } = useStoreContext();

  // Sample data to make the component runnable without a context provider
  const sampleData = {
    marketplaceListings: [
      {
        id: "1",
        name: "Premium Haircut & Styling",
        description: "Experience a top-tier haircut with our master stylists, including a relaxing wash and a personalized styling session to perfect your look.",
        images: ["https://images.unsplash.com/photo-1596461404986-e88e404b4c73?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
        finalPrice: 75.00,
        isAvailable: true
      },
      {
        id: "2",
        name: "Full Body Deep Tissue Massage",
        description: "Melt away stress and tension with our deep tissue massage. Our therapists use firm pressure to target deeper layers of muscle and fascia.",
        images: ["https://images.unsplash.com/photo-1542626991-cbc9322c34d4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
        finalPrice: 120.00,
        isAvailable: true
      },
      {
        id: "3",
        name: "Home Electrical Inspection",
        description: "A comprehensive safety inspection of your home's electrical system, performed by certified and insured electricians. Ensure peace of mind.",
        images: ["https://images.unsplash.com/photo-1581094042850-25e40733d31b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
        finalPrice: 150.00,
        isAvailable: true
      },
      {
        id: "4",
        name: "Wedding Makeup & Hair",
        description: "Look and feel absolutely stunning on your big day with our professional wedding makeup and hair services. Includes a consultation and trial run.",
        images: ["https://images.unsplash.com/photo-1519396349547-681615d681c6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
        finalPrice: 250.00,
        isAvailable: false
      },
      {
        id: "5",
        name: "Residential Plumbing Repair",
        description: "Professional plumbing services for all your home needs, from fixing leaky faucets to major pipe repairs. Fast and reliable service.",
        images: ["https://images.unsplash.com/photo-1587569145888-0f1e8e8f8c7e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
        finalPrice: 90.00,
        isAvailable: true
      },
      {
        id: "6",
        name: "Lawn Mowing & Gardening",
        description: "Keep your lawn looking pristine with our weekly mowing and gardening services. Includes trimming, edging, and waste removal.",
        images: ["https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
        finalPrice: 60.00,
        isAvailable: true
      }
    ],
    themeSettings: {
      primaryColor: '#00A880'
    }
  };

  const { marketplaceListings = [], themeSettings } = storeFormData || sampleData;

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ServiceItem | null>(null);

  const primaryColor = themeSettings?.primaryColor || '#00A880';

  const filteredListings = marketplaceListings.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="relative bg-white py-24 overflow-hidden text-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header and Search */}
        <div className="text-center mb-16">
          <motion.span
            className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-200"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            Our Offerings
          </motion.span>
          <motion.h2
            className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Discover Our Signature <span style={{ color: primaryColor }}>Services</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            From deep relief to revitalizing therapies, our curated offerings are designed for your ultimate well-being journey.
          </motion.p>
          <div className="mt-10 max-w-lg mx-auto relative">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search for services or keywords..."
              className="pl-14 pr-5 py-3 w-full rounded-full bg-white border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-emerald-400 focus:border-transparent transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Services Cards Grid with Staggered Animations */}
        {filteredListings.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {filteredListings.map((item: any) => (
              <motion.div
                key={item.id}
                className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 transform hover:-translate-y-1 flex flex-col group"
                variants={cardVariants}
              >
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                    loader={loader}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/10" />
                  
                  {item.isAvailable && (
                    <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      Available
                    </span>
                  )}
                  {item.finalPrice && (
                    <span className="absolute bottom-4 left-4 bg-white/90 text-gray-900 text-md font-bold px-4 py-2 rounded-lg shadow-md">
                      KES {item.finalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex-grow mb-4 line-clamp-3">
                    {item.description || 'A unique service designed to provide exceptional results and an unforgettable experience.'}
                  </p>
                  
                  <div className="mt-auto">
                    <button
                      onClick={() => setSelected(item)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                    >
                      Book Now
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-xl text-gray-500">
              No services found matching <span className="font-semibold text-gray-700">"{search}"</span>.
            </p>
            <p className="text-gray-400 mt-2">Try adjusting your search or browse our full catalog.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selected && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-70"
            onClick={() => setSelected(null)}
          />

          <motion.div
            className="relative bg-white rounded-3xl max-w-4xl w-full mx-auto z-50 shadow-2xl p-6 sm:p-8 lg:p-10 transform"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-50"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative w-full h-[300px] md:h-auto rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={selected.images?.[0] || 'https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                  loader={loader}
                  alt={selected.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent"></div>
              </div>
              <div className="space-y-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                    {selected.name}
                  </h2>
                  <p className="mt-2 text-md text-gray-700 leading-relaxed">{selected.description || 'No detailed description available.'}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-lg">
                    <p className="font-semibold text-gray-800">
                      Price: <span className="text-emerald-700 text-xl font-bold">KES { (selected.finalPrice || 0).toFixed(2) }</span>
                    </p>
                    {selected.isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-600 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.166 2.307-1.166 2.98 0l5.5 9.504A1.5 1.5 0 0116.5 14H3.5a1.5 1.5 0 01-1.485-2.004l5.5-9.504zM10 13a1 1 0 100 2 1 1 0 000-2zm0-4a1 1 0 000 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
                        </svg>
                        Unavailable
                      </span>
                    )}
                  </div>
                  <BookingForm service={selected} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}