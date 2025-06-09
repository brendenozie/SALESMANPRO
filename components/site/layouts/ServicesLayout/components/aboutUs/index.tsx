"use client";

import React, { useContext } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AboutSection() {

  // Pull data from StoreContext
  const { storeFormData } = useStoreContext();
    
      if (!storeFormData) {
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Loading...</p>
          </div>
        );
      }

  const {
    slug,
    bannerUrl,
    name,
    description,
    storeCategories,      // array of { id, name, icon, items, sortOrder, visible }
    marketplaceListings,     // assume you added this field to Prisma/StoreForm
    testimonials,
    faqs,
    stats,
    themeSettings,
  } = storeFormData;
  const primary = themeSettings?.primaryColor || "#000000";
  const secondary = themeSettings?.secondaryColor || "#FFFFFF";

  const perks = [
    "100% Customer Satisfaction",
    "Free Collection & Delivery",
    "Affordable Prices",
    "Best Quality",
  ];

  return (
    <section className="relative overflow-hidden py-24 bg-white">
      {/* Blurred Background Circles */}
      <motion.div
        className="absolute top-10 -left-20 w-96 h-96 rounded-full opacity-25 blur-3xl z-0"
        style={{ backgroundColor: secondary }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.1, 0.25] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 -right-24 w-80 h-80 rounded-full opacity-20 blur-2xl z-0"
        style={{ backgroundColor: primary }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.05, 0.2] }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-xl ring-4 ring-white/20 w-full max-w-md">
            <Image
              src={bannerUrl}
              alt={`${name} About Image`}
              width={500}
              height={500}
              className="object-cover w-full h-full aspect-square"
              loader={loader}
            />
          </div>
        </motion.div>

        {/* Text */}
        <div className="space-y-6">
          <motion.span
            className="uppercase text-sm font-medium tracking-widest text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            viewport={{ once: true }}
          >
            About Us
          </motion.span>

          <motion.h2
            className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
             
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(${primary})`,
              }}
            >
              {name}{' '}
            </span>
          </motion.h2>

          <motion.p
            className="text-gray-700 text-lg leading-relaxed max-w-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          >
            { description || "We make your space shine! Professional, reliable cleaning services for homes and businesses — satisfaction guaranteed."}
          </motion.p>

          {/* Perks */}
          <motion.ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-center bg-white shadow-sm rounded-lg px-4 py-2 text-sm text-gray-800"
              >
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                {perk}
              </li>
            ))}
          </motion.ul>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap gap-4 pt-6"
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link
              href={`/${name.toLowerCase()}/book`}
              className="px-6 py-3 rounded-full text-white font-semibold shadow-lg transition hover:scale-105"
              style={{ backgroundColor: primary }}
            >
              Book Now
            </Link>
            <Link
              href={`/${name.toLowerCase()}/about`}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-100 transition"
            >
              Know More
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )};
