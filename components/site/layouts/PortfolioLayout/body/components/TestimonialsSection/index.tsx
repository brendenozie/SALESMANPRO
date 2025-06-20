'use client';

import React from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Static fallback testimonials
const staticTestimonials = [
  {
    name: "Sarah L.",
    text: "Booking my service is a breeze! I can easily find the perfect option and schedule my appointment whenever it suits me. It’s so convenient!",
    rating: 5,
    image: "/avatars/sarah.png",
  },
  {
    name: "James K.",
    text: "The level of professionalism and ease of scheduling blew me away. I now enjoy regular sessions without the stress.",
    rating: 5,
    image: "/avatars/james.png",
  },
  {
    name: "Aisha R.",
    text: "I love how secure and personalized everything feels. I finally found my go-to platform!",
    rating: 5,
    image: "/avatars/aisha.png",
  },
];

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 600,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 5000,
  adaptiveHeight: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

export default function TestimonialsSection() {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {}, testimonials: dynamicTestimonials, name } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#10b981'; // fallback emerald
  const accentBgColor = primaryColor + '20'; // ~12% opacity
  const textAccentColor = primaryColor;

  // Build testimonials array: prefer dynamicTestimonials if available
  // Expecting storeFormData.testimonials: array of { author, quote, rating, avatarUrl }
  const testimonialsData: Array<{
    name: string;
    text: string;
    rating: number;
    image?: string;
  }> =
    Array.isArray(dynamicTestimonials) && dynamicTestimonials.length > 0
      ? dynamicTestimonials.map((t: any) => ({
          name: t.author || 'Anonymous',
          text: t.quote || '',
          rating: typeof t.rating === 'number' ? t.rating : 0,
          image: t.avatarUrl || '/placeholder-avatar.png',
        }))
      : staticTestimonials;

  return (
    <section
      className="py-20 px-6 lg:px-20"
      style={{ backgroundColor: themeSettings.secondaryColor || '#f8f1eb' }}
    >
      <div className="max-w-7xl mx-auto text-center">
        <motion.span
          className="inline-block text-sm font-semibold px-4 py-1 rounded-full mb-4 shadow-sm"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            backgroundColor: accentBgColor,
            color: textAccentColor,
          }}
        >
          Testimonials
        </motion.span>

        <motion.h2
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-snug"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          What Our Clients Are Saying
          {name && (
            <span style={{ color: textAccentColor }}> About {name}</span>
          )}
        </motion.h2>

        <motion.p
          className="text-gray-600 max-w-2xl mx-auto text-lg mb-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Trusted by many, {name || 'we'} are making experiences easier and more personal than ever before.
        </motion.p>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Slider {...sliderSettings}>
            {testimonialsData.map((t, index) => (
              <div key={index}>
                <motion.div
                  className="mx-4 p-6 rounded-2xl shadow-md"
                  style={{ backgroundColor: accentBgColor }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-gray-800 font-medium text-md mb-6">
                    “{t.text}”
                  </p>
                  <div className="flex items-center gap-4">
                    <Image
                      src={t.image || '/placeholder-avatar.png'}
                      alt={t.name}
                      loader={loader}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div className="text-left">
                      <p className="font-semibold text-sm text-gray-900">
                        {t.name}
                      </p>
                      <div className="flex text-yellow-500 text-sm">
                        {'★'.repeat(Math.max(0, Math.min(5, t.rating)))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:flex justify-center gap-8 mt-8 flex-wrap">
          {testimonialsData.map((t, index) => (
            <motion.div
              key={index}
              className="w-80 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
              style={{ backgroundColor: accentBgColor }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <p className="text-gray-800 font-medium text-md mb-6">
                “{t.text}”
              </p>
              <div className="flex items-center gap-4">
                <Image
                  src={t.image || '/placeholder-avatar.png'}
                  alt={t.name}
                  loader={loader}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="font-semibold text-sm text-gray-900">
                    {t.name}
                  </p>
                  <div className="flex text-yellow-500 text-sm">
                    {'★'.repeat(Math.max(0, Math.min(5, t.rating)))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
