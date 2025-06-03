// File: components/site/layouts/PortfolioLayout/PortfolioSite.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStoreContext } from '../../../../../contexts/StoreContext';
import { MarketplaceListingForm } from '../../../../../types/typings';

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
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {bannerUrl && (
          <Image
            src={bannerUrl}
            alt="Hero"
            fill
            className="object-cover object-top brightness-75"
            loader={loader}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/30 to-transparent backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white drop-shadow-2xl tracking-tight"
          >
            {name}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-4 text-base sm:text-lg md:text-2xl text-gray-200 max-w-3xl"
            >
              {description}
            </motion.p>
          )}
          <motion.button
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            onClick={() => router.push(`/${slug}/projects`)}
            className="mt-8 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white py-3 px-10 rounded-full font-semibold shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none"
          >
            View My Work
          </motion.button>
        </div>
      </section>

      {/* Projects Gallery */}
      <FeaturedProjects projects={projects} slug={slug} loader={loader} />

      {/* About Section */}
      <AboutSection slug={slug} description={description}/>

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

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

interface AboutSectionProps {
  slug: string;
  description:string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ slug, description }) => {
  return (
    <section className="relative py-24 bg-gradient-to-br from-white via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-center overflow-hidden">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-6"
        >
          About Me
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed"
        >
          {description}
        </motion.p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
          <Link
            href={`/${slug}/about`}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 md:py-4 md:px-10 rounded-full font-semibold shadow-md transition-all duration-300"
          >
            Learn More
          </Link>
        </motion.div>
      </div>
      <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-indigo-100 dark:bg-indigo-900 opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
    </section>
  );
};

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

interface TestimonialsSectionProps {
  testimonials: Array<{
    author: string;
    quote: string;
    avatarUrl?: string;
    rating?: number;
  }>;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  return (
    <section className="relative py-24 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-20"
        >
          What Clients Say
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-left relative"
            >
              <p className="text-gray-700 dark:text-gray-300 italic text-lg mb-6 leading-relaxed">
                “{t.quote}”
              </p>
              <div className="flex items-center space-x-4">
                {t.avatarUrl && (
                  <Image
                    src={t.avatarUrl}
                    alt={t.author}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{t.author}</p>
                  {t.rating !== undefined && (
                    <div className="text-yellow-400 text-sm">
                      {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-20 left-0 w-96 h-96 bg-indigo-100 dark:bg-indigo-800 opacity-20 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};
