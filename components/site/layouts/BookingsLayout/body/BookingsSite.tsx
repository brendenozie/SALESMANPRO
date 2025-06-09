// File: components/site/layouts/BookingsLayout/BookingsSite.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import { useInView } from 'react-intersection-observer';
import 'react-datepicker/dist/react-datepicker.css';
import { useStoreContext } from '../../../../../contexts/StoreContext';
import { MagnifyingGlassCircleIcon, MapPinIcon } from '@heroicons/react/24/solid';
import Hero from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import BenefitsSection from './components/BenefitsSection';
import MassageFeatures from './components/MessagesSection';
import TestimonialsSection from './components/TestimonialsSection';
import CtaSection from './components/CtaSection';


// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Reveal-on-scroll wrapper
function Reveal({ children }: any) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export default function BookingsSite() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    description,
    bannerUrl,
    storeCategories,    // formerly StoreCategory
    marketplaceListings,   // array from StoreForm
    testimonials,
    faqs: storeFaqs,
  } = storeFormData;

  const [featured, setFeatured] = useState<
    { id: string; name: string; price: number; imageUrl: string }[]
  >([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Map featuredServices into expected shape
    if (marketplaceListings) {
      setFeatured(
        marketplaceListings.map((svc) => ({
          id: svc.id,
          name: svc.title,
          price: Number(svc.finalPrice || 0), // fallback if no numeric price in subtitle
          imageUrl: svc.images[0],
        }))
      );
    }
    // FAQs from context
    setFaqs(storeFaqs || []);
  }, [marketplaceListings, storeFaqs]);

  const handleSearch = () => {
    alert(
      `Searching ${searchTerm} on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`
    );
  };

  return (
    <>
      {/* Hero */}
      <Hero />

      <FeaturesSection />

      <BenefitsSection />

      <MassageFeatures />

      <TestimonialsSection />

      <CtaSection />

      {/* Categories */}
      <section id="categories" className="py-32 bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-20 text-slate-800 tracking-tight">
            Browse by Category
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {storeCategories.map((cat) => (
              <Reveal key={cat.id}>
                <Link href={`/${slug}/service-category/${cat.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.06, y: -4 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="group cursor-pointer bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white/40 hover:shadow-2xl transition"
                  >
                    <div className="relative h-44 w-full">
                      <Image
                        loader={loader}
                        src={cat.icon ?? '/images/category-placeholder.jpg'}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-purple-600 transition">
                        {cat.name}
                      </h3>
                    </div>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section id="featured" className="py-32 bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-20 text-slate-800 tracking-tight">
            Top Providers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {featured.map((svc) => (
              <motion.div
                key={svc.id}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 150 }}
                className="group bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl overflow-hidden shadow-xl transition-all hover:shadow-2xl relative"
              >
                <div className="relative h-52 w-full">
                  <Image
                    loader={loader}
                    src={svc.imageUrl}
                    alt={svc.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-slate-800 group-hover:text-purple-600 transition mb-1">
                    {svc.name}
                  </h3>
                  <p className="text-lg text-indigo-600 font-bold mb-4">
                    KES {svc.price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => alert('Book ' + svc.name)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-full font-semibold shadow-md transition-all"
                  >
                    Book Now
                  </button>
                </div>
                <span className="absolute top-4 left-4 bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                  Best Value
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-16">
            What Clients Are Saying
          </h2>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <Reveal key={i}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-lg px-6 py-8 text-left transition-all hover:shadow-2xl"
                >
                  <div className="text-4xl text-purple-500 mb-4">“</div>
                  <p className="text-slate-700 text-lg leading-relaxed italic">{t.quote}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {t.author.charAt(0)}
                    </div>
                    <span className="text-slate-900 font-semibold">{t.author}</span>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      
    </>
  );
}

