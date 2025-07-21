"use client";

import React, { useState } from "react";
import { ArrowLongRightIcon, XMarkIcon } from "@heroicons/react/24/outline"; // Using ArrowLongRight for a sleeker look
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence for modal transitions
import { useStoreContext } from "@/contexts/StoreContext";
import { ServiceItem } from "@/app/admin/[slug]/services/AdminServicesClient"; // Ensure this type is correct
import BookingFormModal from "../BookingFormModal"; // Assuming this is your booking form component
import Link from "next/link";

const loader = ({ src, width, quality }: any) => `${src}?src=${src}&w=${width}&q=${quality || 75}`;

export default function ServicesSection() {
  const { storeFormData } = useStoreContext();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">Curating our premium services...</p>
      </div>
    );
  }

  const { marketplaceListings, themeSettings } = storeFormData;
  const primaryColor = themeSettings?.primaryColor ?? "#2563EB"; // Default Blue
  const secondaryColor = themeSettings?.secondaryColor ?? "#EC4899"; // Default Pink

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    hover: { scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" },
    tap: { scale: 0.98 },
  };

  // Animation variants for modal backdrop
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Animation variants for modal content
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
    exit: { opacity: 0, scale: 0.8, y: 50 },
  };

  return (
    <>
      <section className="bg-white dark:bg-gray-950 py-16 lg:py-24 px-6 relative overflow-hidden">
        {/* Decorative background shapes/gradients */}
        <div
          className="absolute top-0 left-0 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
          style={{ backgroundColor: secondaryColor }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-center text-4xl sm:text-5xl font-extrabold mb-16 text-gray-900 dark:text-gray-100">
            Discover Our <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>Premium Services</span>
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {marketplaceListings.map((svc: ServiceItem, index: number) => (
              <motion.div
                key={svc.id}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden cursor-pointer"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                whileTap="tap"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.1 }} // Staggered entrance
                onClick={() => setSelectedService(svc)}
              >
                <div className="aspect-[3/2] w-full overflow-hidden relative">
                  <Image
                    src={svc.images[0] || "/placeholder.png"}
                    loader={loader}
                    alt={svc.name || svc.title}
                    layout="fill" // Use layout fill for better responsiveness
                    objectFit="cover"
                    className="transition-transform duration-500 hover:scale-110" // Zoom on hover
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">{svc.name || svc.title}</h3>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow line-clamp-3">
                    {svc.description || "A comprehensive service designed to meet your needs with exceptional quality and attention to detail."}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                      ${(svc.finalPrice ?? 0).toFixed(2)}
                    </p>
                    <button
                      className="flex items-center gap-1 font-semibold transition-all duration-200 hover:gap-2"
                      style={{ color: primaryColor }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click from opening modal twice
                        setSelectedService(svc);
                      }}
                    >
                      View Details
                      <ArrowLongRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to action for more services */}
          {marketplaceListings.length > 6 && ( // Show "View All" if there are many services
            <div className="text-center mt-16">
              <Link href={`/services`} passHref> {/* Adjust this path if needed */}
                <motion.button
                  className="inline-flex items-center px-8 py-4 border-2 rounded-full font-bold text-lg transition-all duration-300 ease-in-out hover:scale-105"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                  whileHover={{ backgroundColor: primaryColor, color: "white" }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Services
                  <ArrowLongRightIcon className="w-5 h-5 ml-2" />
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 lg:px-8"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
          >
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm" // Darker, blurred backdrop
              onClick={() => setSelectedService(null)}
            />

            {/* Modal Content */}
            <motion.div
              className="relative bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full mx-auto z-60 shadow-2xl overflow-hidden"
              variants={modalVariants}
            >
              <button
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 z-10 transition-colors"
                onClick={() => setSelectedService(null)}
                aria-label="Close"
              >
                <XMarkIcon className="w-8 h-8" /> {/* Larger close icon */}
              </button>

              <div className="grid md:grid-cols-2 gap-8 p-8 lg:p-12">
                {/* Modal Image */}
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={selectedService.images[0] || "/placeholder.png"}
                    loader={loader}
                    alt={`${selectedService.name || selectedService.title} details`}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>

                {/* Modal Text Content & Booking Form */}
                <div className="space-y-6 text-gray-900 dark:text-gray-100">
                  <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                    {selectedService.name || selectedService.title}
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    {selectedService.description || "Detailed description of this premium service, highlighting its benefits and what makes it unique."}
                  </p>
                  <p className="text-2xl font-extrabold">
                    Price: <span style={{ color: primaryColor }}>${(selectedService.finalPrice ?? 0).toFixed(2)}</span>
                  </p>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <BookingFormModal service={selectedService} />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}