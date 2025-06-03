"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStoreContext } from "../../../../../contexts/StoreContext";

//----------------------------------------------
// Image loader (same as elsewhere)
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
// RestaurantSite component, now using StoreContext
//----------------------------------------------
export default function RestaurantSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    description,
    bannerUrl,
    storeCategories,
    marketplaceListings,
    testimonials,
    faqs,
  } = storeFormData;

  return (
    <div className="relative font-sans text-gray-800">
      {/* ── Hero Section ── */}
      <section
        className="relative h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-center px-4">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {name}
          </motion.h1>
          {description && (
            <motion.p
              className="text-xl md:text-2xl mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {description}
            </motion.p>
          )}
          <Link
            href="#menu"
            className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
          >
            View Menu
          </Link>
        </div>
      </section>

      {/* ── About Section ── */}
      <section className="py-20 bg-white text-gray-800">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <Image
            src="/images/about.jpg"
            alt="Chef"
            width={600}
            height={400}
            className="rounded-2xl"
            loader={loader}
          />
          <div>
            <h2 className="text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-lg mb-6">
              At {name}, we blend timeless recipes with modern flair. Each
              dish reflects our passion for quality ingredients and authentic
              flavors.
            </p>
            <p className="text-sm italic">— Chef de Cuisine</p>
          </div>
        </div>
      </section>

      {/* ── Menu Categories ── */}
      <section id="menu" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Menu Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {storeCategories.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() =>
                  router.push(`/${slug}/category/${c.id}`)
                }
                className="relative overflow-hidden rounded-3xl shadow-xl cursor-pointer"
              >
                <Image
                  src={c.icon || "/images/placeholder-category.jpg"}
                  alt={c.name}
                  layout="responsive"
                  width={300}
                  height={200}
                  objectFit="cover"
                  loader={loader}
                  className="group-hover:scale-110 transform transition"
                />
                <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
                  <span className="text-white text-xl md:text-2xl font-semibold drop-shadow-md">
                    {c.displayName ?? c.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chef's Specials ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Chef’s Specials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {marketplaceListings.map((dish) => (
              <motion.div
                key={dish.id}
                whileHover={{ y: -10, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                transition={{ type: "tween" }}
                onClick={() => router.push(`/${slug}/dish/${dish.id}`)}
                className="bg-white rounded-3xl overflow-hidden shadow-xl cursor-pointer"
              >
                <div className="relative h-56">
                  <Image
                    src={dish.images[0] || "/images/placeholder-dish.jpg"}
                    alt={dish.product?.name ?? dish.title}
                    layout="fill"
                    objectFit="cover"
                    loader={loader}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">
                    {dish.product?.name ?? dish.title}
                  </h3>
                  <p className="text-red-600 font-bold">
                    KES {dish.finalPrice.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reservation CTA ── */}
      <section className="bg-indigo-600 text-white py-16 text-center relative">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Reserve Your Table Today
        </h3>
        <p className="text-lg mb-6">
          Join us for an unforgettable dining experience.
        </p>
        <Link
          href={`/${slug}/reserve`}
          className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-indigo-100 transition"
        >
          Book Now
        </Link>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            What Our Guests Say
          </h2>
          <div className="relative max-w-xl mx-auto">
            <AnimatePresence>
              {testimonials.map((t, i) => (
                <motion.blockquote
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="italic text-gray-700 text-lg bg-gray-100 p-8 rounded-2xl shadow-lg mb-6"
                >
                  “{t.quote}”
                  <span className="mt-4 block font-semibold text-gray-900">
                    — {t.author}
                  </span>
                </motion.blockquote>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((q, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-gray-50 p-6 rounded-3xl shadow-lg cursor-pointer"
              >
                <summary className="text-xl font-semibold text-gray-800">
                  {q.question}
                </summary>
                <p className="mt-2 text-gray-600">{q.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
