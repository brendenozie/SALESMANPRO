// File: components/site/layouts/PortfolioLayout/PortfolioSite.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStoreContext } from '../../../../../contexts/StoreContext';
import { MarketplaceListingForm } from '../../../../../types/typings';
import HeroSection from './components/HeroSection';
import BusinessSection from './components/BusinessSection';
import GettingStartedSection from './components/GettingStartedSection';
import FeaturesSection from './components/FeaturesSection';
import AboutSection from './components/AboutSection';
import CaseStudiesSection from './components/CaseStudiesSection';
import DiscoveryCallSection from './components/DiscoveryCallSection';
import TestimonialsSection from './components/TestimonialsSection';

// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function PortfolioSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    description,
    bannerUrl,
    marketplaceListings, // projects represented as marketplace items
    testimonials: ctxTestimonials,
    faqs: ctxFaqs,
  } = storeFormData;

  const [projects, setProjects] = useState<typeof marketplaceListings>([]);
  const [testimonials, setTestimonials] = useState<typeof ctxTestimonials>([]);
  const [faqs, setFaqs] = useState<typeof ctxFaqs>([]);

  useEffect(() => {
    setProjects(marketplaceListings);
    setTestimonials(ctxTestimonials);
    setFaqs(ctxFaqs);
  }, [marketplaceListings, ctxTestimonials, ctxFaqs]);

  return (
    <div className="space-y-24 font-sans text-gray-800">
      
      <HeroSection />

      <BusinessSection/>

      <GettingStartedSection />

      <FeaturesSection />

      <AboutSection />

      <CaseStudiesSection />

      <DiscoveryCallSection/>

      {/* Projects Gallery */}
      <FeaturedProjects projects={projects} slug={slug} loader={loader} />

      {/* Testimonials */}
      <TestimonialsSection/>

      {/* FAQs Accordion */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <summary className="cursor-pointer text-xl font-semibold text-gray-800">
                  {faq.question}
                </summary>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Let's Work Together</h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Ready to bring your ideas to life? Reach out for a free consultation.
          </p>
          <Link
            href={`mailto:${storeFormData.contactEmail}`}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-10 rounded-full font-semibold shadow-lg transition"
          >
            Contact Me
          </Link>
        </div>
      </section>
    </div>
  );
}

interface FeaturedProjectsProps {
  projects: Array<MarketplaceListingForm>;
  slug: string;
  loader: (_: any) => string;
}

const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ projects, slug, loader }) => {
  const router = useRouter();

  return (
    <section className="relative py-28 bg-gradient-to-br from-white via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-20 tracking-tight"
        >
          Featured Projects
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {projects.map((proj) => (
            <motion.div
              key={proj.id}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              onClick={() => router.push(`/${slug}/project/${proj.id}`)}
              className="relative group rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl bg-white dark:bg-gray-800 cursor-pointer transform transition duration-300"
            >
              <div className="overflow-hidden rounded-3xl">
                <Image
                  src={proj.images[0]}
                  alt={proj.title}
                  width={400}
                  height={300}
                  className="w-full h-auto transform group-hover:scale-110 transition duration-500 ease-in-out object-cover"
                  loader={loader}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
              <div className="absolute bottom-0 p-6 text-white z-10">
                <h3 className="text-2xl font-semibold drop-shadow-sm">{proj.title}</h3>
                {proj.description && <p className="mt-1 text-sm text-gray-200">{proj.description}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-100 dark:bg-indigo-900 opacity-20 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
    </section>
  );
};

