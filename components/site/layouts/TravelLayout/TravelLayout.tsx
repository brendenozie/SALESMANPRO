"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface TravelLayoutProps {
  params: { store: any };
  children: ReactNode;
}

export default function TravelLayout({ params, children }: TravelLayoutProps) {
  const { store } = params;
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setCategories(store.StoreCategory.slice(0, 6));
    setFeatured(store.products.slice(0, 6));
    setTestimonials(store.testimonials.slice(0, 3));
    setFaqs(store.faqs.slice(0, 3));
  }, [store]);

  const navigateTo = (path: string) => router.push(`/${store.slug}/${path}`);

  return (
    <>
      {/* Sticky Transparent Header */}
      <Header store={store}/>
      {/* className="fixed w-full z-50 bg-opacity-50 backdrop-blur"  */}

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-screen bg-gradient-to-br from-blue-700 to-indigo-500 flex items-center"
      >
        <div className="absolute inset-0 opacity-20 bg-pattern"></div>
        <div className="relative container mx-auto px-8 text-center text-white">
          <motion.h1
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
            className="text-6xl font-extrabold mb-4 leading-tight"
          >
            {store.name}
          </motion.h1>
          <motion.p
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            {store.description}
          </motion.p>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }}>
            <button
              onClick={() => navigateTo('contact')}
              className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition"
            >
              Get In Touch
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories with Icons */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Our Expertise</h2>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } }
            }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center bg-gray-50 p-6 rounded-2xl shadow hover:shadow-xl transition"
              >
                <Image
                  src={cat.icon || cat.imageUrl}
                  alt={cat.name}
                  width={80}
                  height={80}
                  className="mb-4"
                />
                <span className="text-lg font-medium text-gray-700">{cat.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Travel Cards */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Featured Travel</h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.2 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12"
          >
            {featured.map((svc) => (
              <motion.div
                key={svc.id}
                variants={{ hidden: { y: 50, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-2xl transition cursor-pointer"
                onClick={() => {}}//handleInquiry(svc.id)
              >
                <div className="relative h-64">
                  <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">{svc.name}</h3>
                  <p className="text-gray-600 mb-6">{svc.subtitle || svc.name}</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-medium hover:from-blue-600 hover:to-indigo-600 transition">
                    Learn More
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials & FAQs */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-8">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Client Feedback</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-2xl shadow-lg">
                  <p className="italic text-gray-700 mb-4">“{t.quote}”</p>
                  <p className="font-semibold text-gray-900">— {t.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="py-20 bg-gray-100">
          <div className="container mx-auto px-8 max-w-2xl">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">FAQs</h2>
            <div className="space-y-6">
              {faqs.map((q, i) => (
                <details key={i} className="bg-white p-6 rounded-2xl shadow-lg">
                  <summary className="cursor-pointer text-lg font-medium text-gray-800">{q.question}</summary>
                  <p className="mt-4 text-gray-600">{q.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chatbot Button */}
      <motion.div whileHover={{ scale: 1.2 }} className="fixed bottom-8 right-8">
        <button className="bg-indigo-500 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-600 transition">
          💬
        </button>
      </motion.div>

      {/* Content */}
      <section className="container mx-auto px-8 py-16 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}