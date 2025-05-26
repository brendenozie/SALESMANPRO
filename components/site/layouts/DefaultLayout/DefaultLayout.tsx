// components/site/layouts/DefaultHeaderLayout.tsx
"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface DefaultHeaderLayoutProps {
  params: { store: any };
  children: ReactNode;
}

export default function DefaultHeaderLayout({ params, children }: DefaultHeaderLayoutProps) {
  const { store } = params;
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // We'll default to showing hero slides as items if available,
    // otherwise fall back to products or categories
    if (store.heroSlides?.length) {
      setItems(store.heroSlides);
    } else if (store.products?.length) {
      setItems(store.products.slice(0, 5));
    } else {
      setItems(store.StoreCategory?.slice(0, 5) || []);
    }

    setTestimonials(store.testimonials?.slice(0, 3) || []);
    setFaqs(store.faqs?.slice(0, 3) || []);
  }, [store]);

  const handlePrimaryCTA = () => {
    // Send them to contact or shop based on category
    const path = store.slug + (store.category === "e-commerce" ? "/shop" : "/contact");
    router.push(`/${path}`);
  };

  return (
    <>
      <Header store={store} />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative bg-gray-800 text-white h-[60vh] flex items-center"
      >
        {store.bannerUrl && (
          <Image src={store.bannerUrl} alt="Hero" fill className="object-cover opacity-40" />
        )}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.h1
            initial={{ y: -30 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-5xl font-bold drop-shadow-lg mb-4"
          >
            {store.name}
          </motion.h1>
          <motion.p
            initial={{ x: -30 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.8 }}
            className="text-lg max-w-2xl mx-auto mb-6"
          >
            {store.description}
          </motion.p>
          <motion.button
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.1 }}
            onClick={handlePrimaryCTA}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition"
          >
            {store.category === "e-commerce" ? "Start Shopping" : "Contact Us"}
          </motion.button>
        </div>
      </motion.section>

      {/* Dynamic Item Showcase */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            {store.heroSlides?.length ? "Highlights" : store.products?.length ? "Top Picks" : "Explore"}
          </h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.2 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {items.map((it: any, idx: number) => (
              <motion.div
                key={idx}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="bg-gray-100 rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
                onClick={() =>
                  router.push(
                    store.heroSlides?.length
                      ? it.ctaLink || `/${store.slug}/item/${it.id}`
                      : store.products?.length
                      ? `/${store.slug}/product/${it.slug || it.id}`
                      : `/${store.slug}/category/${it.slug || it.id}`
                  )
                }
              >
                <div className="relative h-48">
                  <Image
                    src={it.imageUrl || it.bannerUrl}
                    alt={it.title || it.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{it.headline || it.name}</h3>
                  <p className="mt-2 text-gray-600">{it.subline || it.subtitle || ""}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Testimonials</h2>
            <div className="space-y-8 max-w-2xl mx-auto">
              {testimonials.map((t, i) => (
                <blockquote key={i} className="italic text-gray-700">
                  “{t.quote}”
                  <br />
                  <span className="font-semibold text-gray-900">— {t.author}</span>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">FAQs</h2>
            <div className="space-y-6">
              {faqs.map((q, i) => (
                <details key={i} className="bg-gray-100 rounded-lg shadow p-4">
                  <summary className="cursor-pointer font-medium">{q.question}</summary>
                  <p className="mt-2 text-gray-600">{q.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chat Button */}
      <div className="fixed bottom-6 right-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          💬
        </motion.button>
      </div>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}
