// File: components/site/layouts/DirectoryLayout/DirectorySite.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../../../contexts/StoreContext';
import CategorySection from './components/CategorySection';
import PromotionSection from './components/PromotionSection';
import NewArrivalsSection from './components/NewArrivalsSection';

// Dynamic loader for optimized images
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Floating category icons for Hero
const floatingIcons = [
  { name: 'Restaurants', icon: '🍽️', top: '10%', left: '15%' },
  { name: 'Healthcare', icon: '🩺', top: '20%', right: '10%' },
  { name: 'Shopping', icon: '🛍️', bottom: '15%', left: '12%' },
  { name: 'Services', icon: '🧰', bottom: '10%', right: '14%' },
  { name: 'Education', icon: '📚', top: '30%', left: '45%' },
];

function Hero({
  title,
  description,
  bannerUrl,
  onSearch,
  searchTerm,
  setSearchTerm,
}: {
  title: string;
  description?: string;
  bannerUrl?: string;
  onSearch: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}) {
  return (
    <section className="relative h-[85vh] bg-gradient-to-br from-green-600 to-teal-500 text-white flex items-center justify-center overflow-hidden">
      {/* Background */}
      {bannerUrl && (
        <Image
          src={bannerUrl}
          alt="Directory Hero"
          fill
          className="object-cover opacity-40"
          priority
          loader={loader}
        />
      )}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* Floating Icons */}
      {floatingIcons.map((cat, idx) => (
        <motion.div
          key={idx}
          className="absolute text-2xl md:text-3xl"
          style={{ ...cat }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3 + idx, repeat: Infinity }}
        >
          <span title={cat.name}>{cat.icon}</span>
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-md"
        >
          Find & Explore <span className="text-orange-400">{title}</span>
        </motion.h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-lg md:text-xl text-white/90"
          >
            {description}
          </motion.p>
        )}

        {/* Search */}
        <motion.form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch();
          }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          role="search"
          aria-label="Search listings"
          className="mt-8 flex w-full max-w-xl mx-auto rounded-full overflow-hidden bg-white/90 backdrop-blur"
        >
          <div className="flex items-center px-4 text-gray-500">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </div>
          <input
            type="search"
            placeholder="Search businesses or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-3 text-gray-800 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-semibold transition-all"
          >
            Search
          </button>
        </motion.form>
      </div>
    </section>
  );
}

function CategoryGrid({
  categories,
  slug,
}: {
  categories: { id: string; name: string; slug: string; image?: string }[];
  slug: string;
}) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 py-6 px-4">
      {categories.map((cat) => (
        <motion.div
          key={cat.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={() => router.push(`/${slug}/category/${cat.slug}`)}
          role="button"
          aria-label={`View ${cat.name}`}
          className="group cursor-pointer text-center rounded-2xl bg-white/30 backdrop-blur-md border border-white/20 shadow-md p-4 transition-all hover:shadow-xl hover:ring-2 hover:ring-green-500/40"
        >
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden">
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.name}
                width={96}
                height={96}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loader={loader}
              />
            ) : (
              <span className="text-3xl">{cat.name.charAt(0)}</span>
            )}
          </div>
          <p className="mt-4 text-base font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
            {cat.name}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function ListingGrid({
  listings,
  slug,
}: {
  listings: { id: string; name: string; subtitle?: string; imageUrl: string; slug: string }[];
  slug: string;
}) {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-br from-white to-green-50 py-12 px-6 rounded-t-[3rem]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6 px-4">
        {listings.map((item) => (
          <motion.article
            key={item.id}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 260 }}
            onClick={() => router.push(`/${slug}/listing/${item.slug}`)}
            role="link"
            aria-label={`View ${item.name}`}
            className="group bg-white/70 backdrop-blur-sm border border-white/30 rounded-3xl shadow-md hover:shadow-2xl transition-all overflow-hidden cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden rounded-t-3xl">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                loader={loader}
              />
              <span className="absolute top-2 left-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                Featured
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors truncate">
                {item.name}
              </h3>
              {item.subtitle && <p className="text-sm text-gray-600 truncate">{item.subtitle}</p>}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ testimonials }: { testimonials: { quote: string; author: string }[] }) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {testimonials.map((t, i) => (
        <motion.blockquote
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 * i }}
          className="italic text-gray-700 text-center"
        >
          “{t.quote}”
          <footer className="mt-2 font-semibold text-gray-900">— {t.author}</footer>
        </motion.blockquote>
      ))}
    </div>
  );
}

function FAQ({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <div className="space-y-4">
      {faqs.map((q, i) => (
        <details key={i} className="bg-white p-4 rounded-lg shadow-sm">
          <summary className="font-medium cursor-pointer">{q.question}</summary>
          <p className="mt-2 text-gray-600">{q.answer}</p>
        </details>
      ))}
    </div>
  );
}

export default function DirectorySite() {
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Pull categories and listings from context
  const categories = storeFormData.storeCategories.map((sc) => ({
    id: sc.id,
    name: sc.name,
    slug: sc.id,
    image: typeof sc.icon === 'string'
      ? sc.icon
      : typeof sc.items?.[0] === 'string'
      ? sc.items[0]
      : undefined,
  }));
  const listings = storeFormData.marketplaceListings.map((m) => ({
    id: m.id,
    name: m.title,
    subtitle: m.product?.name,
    imageUrl: m.images?.[0] || '',
    slug: m.id,
  }));

  const handleSearch = () => {
    router.push(`/${storeFormData.slug}/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="font-sans space-y-24">
      <Hero
        title={storeFormData.name}
        description={storeFormData.description}
        bannerUrl={storeFormData.bannerUrl}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
      />

      <PromotionSection />

      <NewArrivalsSection />

      <CategorySection />

      <NewArrivalsSection />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
            Top Categories
          </h2>
          <CategoryGrid categories={categories} slug={storeFormData.slug} />
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
            Featured Listings
          </h2>
          <ListingGrid listings={listings} slug={storeFormData.slug} />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
            What People Are Saying
          </h2>
          <Testimonials testimonials={storeFormData.testimonials} />
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
            Help & FAQs
          </h2>
          <FAQ faqs={storeFormData.faqs} />
        </div>
      </section>
    </div>
  );
}
