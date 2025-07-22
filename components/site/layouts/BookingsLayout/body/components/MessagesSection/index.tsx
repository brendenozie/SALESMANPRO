'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import { ServiceItem } from '@/app/admin/[slug]/services/AdminServicesClient'; // Ensure this path is correct
import { XMarkIcon } from '@heroicons/react/24/outline';
import BookingForm from '../../../components/BookingForm'; // Ensure this path is correct

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function ServicesSection() { // Renamed for broader applicability
  const { storeFormData } = useStoreContext();
  const { marketplaceListings = [], themeSettings } = storeFormData;

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ServiceItem | null>(null);

  const primaryColor = themeSettings?.primaryColor || '#00A880'; // Consistent primary color

  const filteredListings = marketplaceListings.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase()) // Also search in description
  );

  return (
    <section className="relative bg-gray-50 py-24 overflow-hidden text-gray-900"> {/* Light background, dark text */}
      {/* Subtle background pattern/texture for light mode if desired */}
      {/* Example: <div className="absolute inset-0 bg-repeat opacity-5" style={{ backgroundImage: 'url(/path/to/subtle-pattern.png)' }} /> */}

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16"> {/* Increased bottom margin for more space */}
          <motion.span
            className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-200" // Lighter, more defined tag
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            Our Offerings
          </motion.span>
          <motion.h2
            className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight" // Solid dark text, adjusted font weight
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Discover Our Signature <span style={{ color: primaryColor }}>Services</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed" // Darker gray for readability
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            From deep relief to revitalizing therapies, our curated offerings are designed for your ultimate well-being journey.
          </motion.p>

          <div className="mt-10 max-w-lg mx-auto relative"> {/* Added relative for potential icons */}
            <input
              type="text"
              placeholder="Search for services or keywords..." // More descriptive placeholder
              className="px-5 py-3 w-full rounded-full bg-white border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-emerald-400 focus:border-transparent transition-all shadow-sm" // Light background, rounded, shadow
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* Optional: Add a search icon */}
            {/* <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg> */}
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Adjusted columns and gap */}
          {filteredListings.length > 0 ? (
            filteredListings.map((item: any, i) => (
              <motion.div
                key={item.id}
                className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 transform hover:-translate-y-1 flex flex-col group" // Light background, enhanced shadows, lift effect
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }} // Slightly faster staggered animation
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={item.images?.[0] || '/images/placeholder.jpg'}
                    loader={loader}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110" // More pronounced hover scale
                  />
                  {/* Subtle top gradient to ensure image vibrancy, removed dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/10" />

                  {item.isAvailable && ( // Conditional availability tag
                    <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      Available
                    </span>
                  )}
                  {item.finalPrice && ( // Price tag
                    <span className="absolute bottom-4 left-4 bg-white/90 text-gray-900 text-md font-bold px-4 py-2 rounded-lg shadow-md">
                      KES {item.finalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight"> {/* Darker, bolder title */}
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex-grow mb-4 line-clamp-3"> {/* Darker gray, line clamp for consistency */}
                    {item.description || 'A unique service designed to provide exceptional results and an unforgettable experience.'}
                  </p>

                  <div className="mt-auto"> {/* Push button to bottom */}
                    <button
                      onClick={() => setSelected(item)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex items-center justify-center gap-2" // Enhanced button styling
                    >
                      Book Now
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                    {/* Optional: Explore More link if needed, adjusted for light mode */}
                    {/* {item.isFeatured && (
                      <Link
                        href={`/services/${item.id}`}
                        className="mt-2 block text-center text-emerald-600 hover:text-emerald-800 text-sm font-medium transition-colors"
                      >
                        Learn More →
                      </Link>
                    )} */}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-xl text-gray-500">
                No services found matching <span className="font-semibold text-gray-700">"{search}"</span>.
              </p>
              <p className="text-gray-400 mt-2">Try adjusting your search or browse our full catalog.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selected && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} // For unmounting
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-70" // Darker, more opaque backdrop
            onClick={() => setSelected(null)}
          />

          {/* Modal Content */}
          <motion.div
            className="relative bg-white rounded-3xl max-w-3xl w-full mx-auto z-50 shadow-2xl p-6 sm:p-8 lg:p-10 transform"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <XMarkIcon className="w-7 h-7" /> {/* Slightly larger icon */}
            </button>

            <div className="flex flex-col md:flex-row gap-8"> {/* Increased gap */}
              <div className="md:w-1/2 flex-shrink-0">
                <Image
                  src={selected.images[0] || "/images/placeholder.jpg"}
                  loader={loader}
                  alt={selected.name || selected.title || "Service image"}
                  width={600} // Larger default width for modal image
                  height={400} // Larger default height
                  className="object-cover rounded-xl w-full h-full max-h-[300px] md:max-h-none shadow-md" // Rounded corners, shadow
                />
              </div>
              <div className="md:w-1/2 space-y-5"> {/* Increased space-y */}
                <h2 className="text-3xl font-bold text-gray-900 leading-tight">{selected.name || selected.title}</h2>
                <p className="text-gray-700 leading-relaxed text-md">{selected.description || 'No detailed description available for this service.'}</p>
                
                {/* Price and Availability details */}
                <div className="flex items-center gap-4 text-lg">
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

                {/* Booking Form */}
                <BookingForm service={selected} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}