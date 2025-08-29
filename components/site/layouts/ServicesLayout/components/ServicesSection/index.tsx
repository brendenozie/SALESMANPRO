"use client";

import React, { useState } from "react";
import { ArrowLongRightIcon, XMarkIcon, CalendarDaysIcon, CurrencyDollarIcon, TagIcon } from "@heroicons/react/24/outline";
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

  if (!storeFormData || !storeFormData.marketplaceListings) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">Curating our premium services...</p>
      </div>
    );
  }

  const { marketplaceListings, themeSettings, slug } = storeFormData;
  const primaryColor = themeSettings?.primaryColor ?? "#4CAF50";
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFC107";

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.1 } },
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } },
  };

  // Select a single featured service (e.g., the first one)
  const featuredService = marketplaceListings.length > 0 ? marketplaceListings[0] : null;
  const otherServices = marketplaceListings.slice(1);

  return (
    <>
      <section className="bg-white dark:bg-gray-950 py-16 lg:py-24 relative overflow-hidden">
        {/* Subtle background shapes */}
        <motion.div
          className="absolute rounded-full opacity-5 blur-3xl -top-20 -right-20 w-80 h-80"
          style={{ backgroundColor: primaryColor }}
          animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
        />
        <motion.div
          className="absolute rounded-full opacity-5 blur-3xl -bottom-20 -left-20 w-96 h-96"
          style={{ backgroundColor: secondaryColor }}
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", repeatType: "mirror", delay: 3 }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16 space-y-4"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
              Explore Our{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundColor: `${primaryColor}` }}>
                Exceptional Services
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From our most popular offerings to comprehensive solutions, discover how we can elevate your experience.
            </p>
          </motion.div>

          {/* Featured Service Section - Hero-like presentation */}
          {featuredService && (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-24"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Left: Featured Service Image */}
              <motion.div variants={fadeIn} className="relative w-full aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setSelectedService(featuredService)}>
                <div className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 transform translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0" style={{ background: primaryColor }} />
                <Image
                  src={featuredService.images[0] || "/placeholder-service.jpg"}
                  alt={featuredService.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                  loader={loader}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/20" />
              </motion.div>
              
              {/* Right: Featured Service Details */}
              <motion.div variants={staggerContainer} className="space-y-6">
                <motion.div variants={fadeIn} className="flex items-center space-x-2">
                  <div className="text-sm font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ backgroundColor: secondaryColor }}>
                    Signature
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Our Top Offering
                  </span>
                </motion.div>
                <motion.h3 className="text-4xl lg:text-5xl font-extrabold" variants={fadeIn}>
                  {featuredService.name}
                </motion.h3>
                <motion.p className="text-lg text-gray-700 dark:text-gray-300" variants={fadeIn}>
                  {featuredService.description || "A comprehensive service designed to meet your needs with exceptional quality and attention to detail."}
                </motion.p>
                <motion.div className="flex flex-wrap items-center gap-6" variants={fadeIn}>
                  <div className="flex items-center text-xl font-bold">
                    <CurrencyDollarIcon className="w-6 h-6 mr-2" style={{ color: secondaryColor }} />
                    <span className="text-gray-900 dark:text-gray-100">${(featuredService.finalPrice ?? 0).toFixed(2)}</span>
                  </div>
                  {featuredService.duration && (
                    <div className="flex items-center text-lg text-gray-600 dark:text-gray-400">
                      <CalendarDaysIcon className="w-5 h-5 mr-2" />
                      <span>{featuredService.duration}</span>
                    </div>
                  )}
                </motion.div>
                <motion.div variants={fadeIn}>
                  <button
                    onClick={() => setSelectedService(featuredService)}
                    className="inline-flex items-center px-8 py-4 rounded-full text-white font-bold shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50"
                    style={{ backgroundColor: primaryColor, "--tw-ring-color": primaryColor } as React.CSSProperties}
                  >
                    Explore This Service
                    <ArrowLongRightIcon className="w-5 h-5 ml-2 transition-transform" />
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Other Services Grid */}
          {otherServices.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {otherServices.map((svc: ServiceItem, index: number) => (
                <motion.div
                  key={svc.id}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform border border-gray-100 dark:border-gray-700 flex flex-col cursor-pointer group"
                  variants={fadeIn}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedService(svc)}
                >
                  <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4">
                    <Image
                      src={svc.images[0] || "/placeholder-service.jpg"}
                      loader={loader}
                      alt={svc.name || svc.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {svc.name || svc.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {svc.description || "A professional service tailored to your needs."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold" style={{ color: secondaryColor }}>
                      ${(svc.finalPrice ?? 0).toFixed(2)}
                    </span>
                    <button
                      className="inline-flex items-center gap-1 font-semibold text-sm transition-all duration-200 hover:gap-2"
                      style={{ color: primaryColor }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(svc);
                      }}
                    >
                      View Details
                      <ArrowLongRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Call to action for full services page */}
          <div className="text-center mt-16">
            <Link href={`/${slug}/services`} passHref>
              <motion.button
                className="inline-flex items-center px-10 py-4 border-2 rounded-full font-bold text-lg transition-all duration-300 ease-in-out hover:scale-105 group"
                style={{ borderColor: primaryColor, color: primaryColor }}
                whileHover={{ backgroundColor: primaryColor, color: "white" }}
                whileTap={{ scale: 0.95 }}
                variants={fadeIn}
              >
                View All Services
                <ArrowLongRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>
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
            variants={fadeIn}
          >
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
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
                {/* Modal Image & Gallery */}
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={selectedService.images[0] || "/placeholder-modal.jpg"}
                    loader={loader}
                    alt={`${selectedService.name } details`}
                    layout="fill"
                    objectFit="cover"
                  />
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

                  {/* Additional details */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                    {selectedService.duration && (
                      <p className="flex items-center text-gray-700 dark:text-gray-300">
                        <CalendarDaysIcon className="w-5 h-5 mr-2" style={{ color: secondaryColor }} />
                        <span className="font-semibold">Duration:</span> {selectedService.duration}
                      </p>
                    )}
                    {selectedService.category && (
                      <p className="flex items-center text-gray-700 dark:text-gray-300">
                        <TagIcon className="w-5 h-5 mr-2" style={{ color: secondaryColor }} />
                        <span className="font-semibold">Category:</span> {selectedService.category.displayName || ''}
                      </p>
                    )}
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