// File: components/site/layouts/ServicesLayout/ServiceSite.tsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { useStoreContext } from "../../../../../contexts/StoreContext";
import bannerFallback from "../../../../../assets/homebanner.png";


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
export default function ServiceSite({ children }: { children: React.ReactNode }) {
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
    bannerUrl,
    name,
    description,
    storeCategories,      // array of { id, name, icon, items, sortOrder, visible }
    marketplaceListings,     // assume you added this field to Prisma/StoreForm
    testimonials,
    faqs,
    themeSettings,
  } = storeFormData;

  const primaryColor = themeSettings?.primaryColor ?? "#4f46e5";
  const secondaryColor = themeSettings?.secondaryColor ?? "#ec4899";

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
      <HeroSection
        slug={slug}
        bannerUrl={bannerUrl ?? bannerFallback.src}
        siteName={name}
        siteDescription={description}
        primary={primaryColor}
        secondary={secondaryColor}
      />

      {/* Service Categories */}
      <section className="py-24 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-16"
          >
            Explore Our Services
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {storeCategories
              .filter((cat) => cat.visible) // optional: only show visible categories
              // .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((cat,index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}//cat.sortOrder 
                  viewport={{ once: true }}
                >
                  <Link
                    href={`/${slug}/service-category/${cat.id}`}
                    className="group relative block rounded-3xl p-6 bg-white/20 backdrop-blur-md border border-white/30 shadow-xl hover:shadow-2xl transition-all"
                  >
                    {/* Icon bubble */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-inner flex items-center justify-center"
                    >
                      <Image
                        loader={loader}
                        src={cat.icon ?? "/icons/default-category.svg"}
                        alt={cat.name}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </motion.div>

                    {/* Category Name */}
                    <h3 className="text-lg font-semibold text-center text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </h3>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Decorative Background Blobs */}
        <div className="absolute -top-40 -left-20 w-96 h-96 bg-purple-400/20 rounded-full filter blur-3xl z-0" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-300/20 rounded-full filter blur-3xl z-0" />
      </section>

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

      {/* Testimonials Carousel */}
      {testimonials && testimonials.length > 0 && (
        <Testimonials
          testimonials={testimonials.map((t, idx) => ({
            id: idx,//t.id ?? 
            quote: t.quote,
            author: t.author,
            role: "user",//t.role
            avatarUrl: t.avatarUrl,
          }))}
        />
      )}

      {/* FAQs + Children */}
      {faqs && faqs.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
              Frequently Asked Questions
            </h2>
            {faqs.map((q, idx) => (
              <details key={idx} className="mb-4 bg-white rounded-xl p-6 shadow">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  {q.question}
                </summary>
                <p className="mt-3 text-gray-600">{q.answer}</p>
              </details>
            ))}
          </div>

          {/* Render any nested `<ServiceSite>` children (e.g. contact form) */}
          <div className="container mx-auto px-6 mt-12">{children}</div>
        </section>
      )}
    </>
  );
}

type HeroSectionProps = {
  slug: string;
  bannerUrl: string;
  siteName: string;
  siteDescription?: string;
  primary: string;
  secondary: string;
};

function HeroSection({
  slug,
  bannerUrl,
  siteName,
  siteDescription,
  primary,
  secondary,
}: HeroSectionProps) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent z-0" />

      {/* Blurred Animated Blobs */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30 blur-3xl z-0"
        style={{ backgroundColor: secondary }}
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-30 blur-3xl z-0"
        style={{ backgroundColor: primary }}
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      {/* Glassmorphism Content Card */}
      <div className="relative z-10 px-6 max-w-3xl w-full">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-10 text-center shadow-lg">
          <motion.h1
            className="text-white text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-md"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome to {siteName.toUpperCase()}
          </motion.h1>
          {siteDescription && (
            <motion.p
              className="text-white/90 text-lg md:text-xl mb-8 drop-shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              {siteDescription}
            </motion.p>
          )}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Link
              href={`/${slug}/contact`}
              className="inline-block bg-white text-gray-900 font-semibold py-3 px-8 rounded-full shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_0_4px_rgba(255,255,255,0.2)] hover:animate-pulse"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

type TestimonialsProps = {
  testimonials: Array<{
    id: string | number;
    quote: string;
    author: string;
    role?: string;
    avatarUrl?: string;
  }>;
};

const Testimonials = ({ testimonials }: TestimonialsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="py-28 bg-gradient-to-r from-pink-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-16"
        >
          What Our Clients Say
        </motion.h2>

        <div className="relative max-w-4xl mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-8 shadow-xl max-w-xl mx-auto"
          >
            <div className="text-5xl text-indigo-400 mb-4 leading-none">“</div>
            <p className="text-gray-700 text-lg leading-relaxed italic mb-6">
              {testimonials[currentIndex].quote}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-200 overflow-hidden">
                <Image
                  src={testimonials[currentIndex].avatarUrl ?? "/default-avatar.png"}
                  loader={loader}
                  alt={testimonials[currentIndex].author}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="text-left">
                <p className="text-gray-900 font-semibold">
                  {testimonials[currentIndex].author}
                </p>
                {testimonials[currentIndex].role && (
                  <p className="text-sm text-gray-500">
                    {testimonials[currentIndex].role}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-indigo-600 scale-110"
                    : "bg-indigo-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative blurred blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-pink-300/20 rounded-full blur-3xl z-0" />
    </section>
  );
};
