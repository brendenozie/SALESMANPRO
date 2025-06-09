// File: components/site/layouts/ServicesLayout/ServiceSite.tsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { useStoreContext } from "../../../../../contexts/StoreContext";
import bannerFallback from "../../../../../assets/homebanner.png";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/aboutUs";
import ExcellenceSection from "../components/ExcellenceSection";
import ServicesSection from "../components/ServicesSection";
import PricingSection from "../components/PricingSection";
import TestimonialSection from "../components/TestimonialSection";
import FAQSection from "../components/FAQSection";
import CleaningTipsSection from "../components/CleaningTipsSection";
import GetStartedSection from "../components/GetStartedSection";


const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

/**
 * ServiceSite now reads everything from StoreContext instead of using a
 * hard-coded `store` object. The hook `useStoreContext()` must return
 * your Prisma → StoreForm data (i.e. exactly what you passed as `initialStore` in
 * `StoreLayout`).
 */
export default function ServiceSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  // storeFormData should be the same shape you constructed in StoreLayout

  // If there's any chance `storeFormData` is not yet loaded, guard early:
  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const {
    slug,
    marketplaceListings,     // assume you added this field to Prisma/StoreForm
  } = storeFormData;

  /**
   * Push user to /[slug]/contact while storing the serviceId in some global state.
   */
  const { setInquiryServiceId } = useStoreContext();
  const handleInquiry = (serviceId: string | number) => {
    setInquiryServiceId(serviceId);
    router.push(`/${slug}/contact`);
  };

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      <AboutSection />

      <ExcellenceSection />

      <ServicesSection />

      <PricingSection />

      <TestimonialSection />

      <FAQSection />

      {/* Featured Services */}
      {marketplaceListings && marketplaceListings.length > 0 && (
        <section className="relative py-28 bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-16"
            >
              Featured Services
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {marketplaceListings.map((svc:any, idx:any) => (
                <motion.div
                  key={svc.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-3xl shadow-xl overflow-hidden relative group"
                >
                  <div className="relative w-full h-64">
                    <Image
                      src={svc.imageUrl}
                      alt={svc.name}
                      loader={loader}
                      fill
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition duration-300" />
                  </div>

                  <div className="bg-white/80 backdrop-blur-md p-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {svc.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{svc.subtitle}</p>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleInquiry(svc.id)}
                      className="relative z-10 inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-full transition duration-300 hover:bg-indigo-700 hover:shadow-lg hover:animate-pulse"
                    >
                      Learn More
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Decorative Background Blobs */}
          <div className="absolute -top-32 -left-20 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl" />
        </section>

      
      )}

      <CleaningTipsSection />
     
      <BookingForm />

      <GetStartedSection />
     
    </>
  );
}







function BookingForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your form submission logic here
    alert('Thank you! We will contact you soon.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="booking" className="bg-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-4">Book Your Cleaning Service</h2>
        <p className="text-gray-600 mb-8">Fill in your details and we’ll get in touch with you.</p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Your Name"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Your Email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            placeholder="Describe your service needs..."
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition"
          >
            Submit Request
          </button>
        </form>
      </div>
    </section>
  );
}
