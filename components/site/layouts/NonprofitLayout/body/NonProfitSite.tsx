"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";

//----------------------------------------------
// Image loader (same as in Header/Footer/CoursesSite)
//----------------------------------------------
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

//----------------------------------------------
// NonProfitSite component (driven from StoreContext)
//----------------------------------------------
export default function NonProfitSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    bannerUrl,
    description,
    marketplaceListings,
    stats,
    testimonials,
    faqs,
  } = storeFormData;

  return (
    <div className="font-sans text-gray-800">
      {/* ── Hero ── */}
      <section className="relative h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          <Image
            src={bannerUrl}
            alt="Hero"
            fill
            className="object-cover brightness-75"
            loader={loader}
            priority
          />
        </div>
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center px-6 max-w-2xl space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            {name}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-white/90">{description}</p>
          )}
          <button
            onClick={() => router.push(`/${slug}/donate`)}
            className="bg-green-600 hover:bg-green-700 text-white shadow-xl rounded-full px-8 py-3 text-lg font-semibold transition-colors flex items-center justify-center"
          >
            Donate Now <ArrowRightIcon className="ml-2 w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* ── Programs (mapped from marketplaceListings) ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Our Programs
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {marketplaceListings.map((listing, i) => {
              // Use listing.title as program name, listing.description as subtitle
              const progName = listing.product?.name ?? listing.title;
              const progSubtitle = listing.description ?? "";
              // For image, take first URL or fallback placeholder
              const imageUrl = listing.images?.[0] ?? "/images/placeholder-program.jpg";
              // Use listing.id as slug (or, if you have a slug field, swap in)
              const progSlug = listing.id;

              return (
                <motion.div
                  key={listing.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group bg-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer flex flex-col"
                  onClick={() => router.push(`/${slug}/program/${progSlug}`)}
                >
                  <div className="relative h-48">
                    <Image
                      src={imageUrl}
                      alt={progName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loader={loader}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {progName}
                      </h3>
                      <p className="text-gray-600">{progSubtitle}</p>
                    </div>
                    <Link
                      href={`/${slug}/program/${progSlug}`}
                      className="mt-4 inline-flex items-center text-green-600 hover:underline font-medium"
                    >
                      Learn More <ArrowRightIcon className="ml-1 w-5 h-5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-green-100">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-around items-center space-y-8 sm:space-y-0">
          {stats && stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * i }}
              className="text-center"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-green-700">
                {stat.value}
              </h3>
              <p className="mt-2 text-lg text-gray-700">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Stories of Change ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-12"
          >
            Stories of Change
          </motion.h2>

          <div className="space-y-12">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 * i }}
                className="relative bg-green-50 p-8 rounded-2xl shadow-lg italic"
              >
                <svg
                  className="absolute top-4 left-4 w-8 h-8 text-green-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.17 6A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2h-4V6H7.17zM3 6a4.017 4.017 0 014.83-4A4.017 4.017 0 0111 2c2.21 0 4 1.79 4 4v2H3V6z" />
                </svg>
                <p className="text-lg text-gray-800">“{t.quote}”</p>
                <footer className="mt-4 text-right font-semibold text-gray-900">
                  {t.author}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Help & FAQs
          </motion.h2>

          <div className="space-y-4">
            {faqs.map((q, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 * i }}
                className="group bg-white p-6 rounded-2xl shadow hover:shadow-lg"
              >
                <summary className="font-medium cursor-pointer flex justify-between items-center">
                  {q.question}
                  <span className="ml-2 text-green-600 transform group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-gray-700">{q.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
