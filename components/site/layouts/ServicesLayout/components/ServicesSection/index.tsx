"use client";

import React, { useState } from "react";
import { ArrowLongRightIcon, XMarkIcon, CalendarDaysIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreContext } from "@/contexts/StoreContext";
import { ServiceItem } from "@/app/admin/[slug]/services/AdminServicesClient";
import BookingFormModal from "../BookingFormModal";
import Link from "next/link";

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

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

  const { marketplaceListings, themeSettings, slug } = storeFormData;
  const primaryColor = themeSettings?.primaryColor ?? "#2563EB"; // Default Blue
  const secondaryColor = themeSettings?.secondaryColor ?? "#EC4899"; // Default Pink

  // Animation variants for section title
  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Animation variants for service cards
  const cardVariants = {
    hidden: { opacity: 0, y: 80, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 12, mass: 0.8 } },
    hover: {
      scale: 1.05,
      boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    tap: { scale: 0.98 },
  };

  // Animation variants for modal backdrop
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  // Animation variants for modal content
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.1 } },
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } },
  };

  // Group services for a "featured" layout, if applicable
  const featuredServices = marketplaceListings.slice(0, 3); // Display top 3 as featured
  const otherServices = marketplaceListings.slice(3); // The rest

  return (
    <>
      <section className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 lg:py-24 relative overflow-hidden">
        {/* Abstract background blobs for visual interest */}
        <div
          className="absolute -top-1/4 -left-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob-slow"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob-slow animation-delay-4000"
          style={{ backgroundColor: secondaryColor }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.h2
            className="text-center text-4xl sm:text-5xl font-extrabold mb-16 text-gray-900 dark:text-gray-100 leading-tight"
            variants={titleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            Discover Our <br className="sm:hidden" />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
              Exceptional Services
            </span> ✨
          </motion.h2>

          {/* Featured Services Grid - More prominent */}
          {featuredServices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
              {featuredServices.map((svc: ServiceItem, index: number) => (
                <motion.div
                  key={svc.id}
                  className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden cursor-pointer group"
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  whileTap="tap"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.15 }}
                  onClick={() => setSelectedService(svc)}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <Image
                      src={svc.images[0] || "/placeholder-service.jpg"}
                      loader={loader}
                      alt={svc.name || svc.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">{svc.name || svc.title}</h3>
                    </div>
                    {/* Price tag badge */}
                    <span className="absolute top-4 right-4 bg-white/90 text-gray-900 dark:bg-gray-700 dark:text-gray-100 px-3 py-1.5 rounded-full text-lg font-semibold shadow-md">
                      ${(svc.finalPrice ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-gray-700 dark:text-gray-300 mb-6 flex-grow line-clamp-3">
                      {svc.description || "A comprehensive service designed to meet your needs with exceptional quality and attention to detail."}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Click to learn more</span>
                      <button
                        className="flex items-center gap-1 font-semibold transition-all duration-200 hover:gap-2 group-hover:gap-3"
                        style={{ color: primaryColor }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(svc);
                        }}
                      >
                        Explore Details
                        <ArrowLongRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Other Services (if any) - A more compact, list-like presentation */}
          {otherServices.length > 0 && (
            <div className="mt-16 bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 shadow-inner">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center"
                  style={{ color: primaryColor }}>
                All Our Offerings
              </h3>
              <ul className="space-y-6">
                {otherServices.map((svc: ServiceItem, index: number) => (
                  <motion.li
                    key={svc.id}
                    className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedService(svc)}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={svc.images[0] || "/placeholder-thumbnail.jpg"}
                          loader={loader}
                          alt={svc.name || svc.title}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{svc.name || svc.title}</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1">{svc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                        <span style={{ color: secondaryColor }}>${(svc.finalPrice ?? 0).toFixed(2)}</span>
                      </p>
                      <button
                        className="flex items-center gap-1 font-semibold text-sm transition-all duration-200 hover:gap-2"
                        style={{ color: primaryColor }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(svc);
                        }}
                      >
                        View
                        <ArrowLongRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Call to action for full services page, if not all are displayed */}
          {marketplaceListings.length > featuredServices.length && (
            <div className="text-center mt-16">
              <Link href={`/${slug}/services`} passHref>
                <motion.button
                  className="inline-flex items-center px-10 py-4 border-2 rounded-full font-bold text-lg transition-all duration-300 ease-in-out hover:scale-105 group"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                  whileHover={{ backgroundColor: primaryColor, color: "white" }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Services
                  <ArrowLongRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Modal - Enhanced for better user experience */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
          >
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/75 backdrop-blur-md" // Darker, more blurred backdrop
              onClick={() => setSelectedService(null)}
            />

            {/* Modal Content */}
            <motion.div
              className="relative bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full mx-auto z-60 shadow-2xl overflow-hidden transform-gpu"
              variants={modalVariants}
            >
              <button
                className="absolute top-5 right-5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 z-10 transition-colors bg-white dark:bg-gray-800 rounded-full p-2 shadow-md"
                onClick={() => setSelectedService(null)}
                aria-label="Close"
              >
                <XMarkIcon className="w-7 h-7" />
              </button>

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 p-8 md:p-12">
                {/* Modal Image & Gallery (if multiple images) */}
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={selectedService.images[0] || "/placeholder-modal.jpg"}
                    loader={loader}
                    alt={`${selectedService.name || selectedService.title} details`}
                    layout="fill"
                    objectFit="cover"
                  />
                  {/* Potentially add a small image gallery here if svc.images has more */}
                  {selectedService.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto p-1 bg-black/30 rounded-lg">
                      {selectedService.images.map((img: string, idx: number) => (
                        <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border-2 border-white flex-shrink-0 cursor-pointer">
                          <Image
                            src={img}
                            loader={loader}
                            alt={`Thumbnail ${idx + 1}`}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Text Content & Booking Form */}
                <div className="space-y-6 text-gray-900 dark:text-gray-100">
                  <h2 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: primaryColor }}>
                    {selectedService.name || selectedService.title}
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    {selectedService.description || "Detailed description of this premium service, highlighting its benefits and what makes it unique."}
                  </p>

                  <div className="flex items-center gap-6 text-xl font-bold text-gray-900 dark:text-gray-100">
                    <CurrencyDollarIcon className="w-7 h-7" style={{ color: secondaryColor }} />
                    <span>Price: <span style={{ color: primaryColor }}>${(selectedService.finalPrice ?? 0).toFixed(2)}</span></span>
                  </div>

                  {/* Additional details (e.g., duration, features) */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                    {selectedService.duration && (
                      <p className="flex items-center text-gray-700 dark:text-gray-300">
                        <CalendarDaysIcon className="w-5 h-5 mr-2" style={{ color: secondaryColor }} />
                        <span className="font-semibold">Duration:</span> {selectedService.duration}
                      </p>
                    )}
                    {/* Add more dynamic details here if ServiceItem type includes them */}
                    {/* Example:
                    {selectedService.features && selectedService.features.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Key Features:</h4>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                          {selectedService.features.map((feature: string, idx: number) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    */}
                  </div>

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