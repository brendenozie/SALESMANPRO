// components/TestimonialsSection.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useStoreContext } from '@/contexts/StoreContext';
import { ArrowRightIcon, TagIcon } from '@heroicons/react/24/solid';

// Placeholder for useStoreContext to demonstrate functionality
// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'Children\'s Hope Foundation',
//     slug: 'childrens-hope-foundation',
//     testimonials: [
//       {
//         id: 'test-1',
//         author: 'Alex Johnson',
//         quote: 'This organization truly changed the lives of many in my community. Their dedication is inspiring and their impact is undeniable!',
//         avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a86e927f643?q=80&w=2670&auto=format&fit=crop',
//         order: 1,
//       },
//       {
//         id: 'test-2',
//         author: 'Emily Carter',
//         quote: 'The support provided by this non-profit has been invaluable to countless families in desperate need. Their programs are well-managed and transparent. Highly recommended.',
//         avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2670&auto=format&fit=crop',
//         order: 2,
//       },
//       {
//         id: 'test-3',
//         author: 'David Lee',
//         quote: 'I\'ve seen firsthand the positive change they bring. Every donation makes a real difference in the lives of children. Proud to be a supporter!',
//         avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2670&auto=format&fit=crop',
//         order: 3,
//       },
//       {
//         id: 'test-4',
//         author: 'Maria Garcia',
//         quote: 'A beacon of hope for our community. Their work in providing essential services has been life-changing. We are forever grateful.',
//         avatarUrl: 'https://images.unsplash.com/photo-1549216060-60b642a8b94f?q=80&w=2670&auto=format&fit=crop',
//         order: 4,
//       },
//     ],
//     themeSettings: {
//       primaryColor: "#FF5722",
//       secondaryColor: "#FFFFFF",
//     },
//   },
// });

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "https://placehold.co/60x60/CCCCCC/333333?text=Avatar";
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function TestimonialsSection() {
  const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';
  const testimonialsToRender = Array.isArray(storeFormData?.testimonials) && storeFormData.testimonials.length > 0
    ? storeFormData.testimonials.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [
      { id: 'fb-test-1', authorName: 'Alex Johnson', quote: 'This organization truly changed the lives of many in my community. Their dedication is inspiring and their impact is undeniable!', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a86e927f643?q=80&w=2670&auto=format&fit=crop', order: 1 },
      { id: 'fb-test-2', authorName: 'Emily Carter', quote: 'The support provided by this non-profit has been invaluable to countless families in desperate need. Highly recommended.', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2670&auto=format&fit=crop', order: 2 },
      { id: 'fb-test-3', authorName: 'David Lee', quote: 'I\'ve seen firsthand the positive change they bring. Every donation makes a real difference in the lives of children. Proud to be a supporter!', avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2670&auto=format&fit=crop', order: 3 },
      { id: 'fb-test-4', authorName: 'Maria Garcia', quote: 'A beacon of hope for our community. Their work in providing essential services has been life-changing. We are forever grateful.', avatarUrl: 'https://images.unsplash.com/photo-1549216060-60b642a8b94f?q=80&w=2670&auto=format&fit=crop', order: 4 },
    ];

  return (
    <section id="testimonials" className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest font-semibold mb-2" style={{ color: primaryColor }}>
            Hear from Our Supporters
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Stories of Impact
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            These are the voices of our community members, volunteers, and beneficiaries who have experienced our mission firsthand.
          </p>
        </motion.div>

        <div className="relative" ref={ref}>
          {/* Scrollable Container for Testimonials */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="flex space-x-8 overflow-x-scroll no-scrollbar py-8 snap-x snap-mandatory lg:snap-none lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-8"
          >
            {testimonialsToRender.map((test) => (
              <motion.div
                key={test.id}
                variants={itemVariants}
                className="flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[45vw] lg:w-full snap-center bg-white p-8 rounded-3xl shadow-lg border border-gray-100 relative group transition-all duration-300 hover:shadow-2xl"
              >
                <div className="flex items-start mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 mr-4">
                    <Image
                      src={test.avatarUrl || `https://placehold.co/64x64/A0A0A0/FFFFFF?text=${test.authorName?.split(' ').map(n => n[0]).join('')}`}
                      alt={test.authorName || 'Avatar'}
                      fill
                      sizes="64px"
                      className="object-cover"
                      loader={loader}
                      onError={handleImageError}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xl">{test.authorName}</h4>
                    <p className="text-sm text-gray-500">Community Supporter</p>
                  </div>
                </div>
                <div className="flex">
                  <TagIcon className="w-8 h-8 text-gray-200 mr-2" />
                  <blockquote className="text-gray-800 text-lg leading-relaxed italic">
                    {test.quote}
                  </blockquote>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Dynamic CTA */}
        {/* <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="p-10 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between mt-16 text-center md:text-left"
          style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColor}E0)`, color: storeFormData?.themeSettings?.secondaryColor || '#FFFFFF' }}
        >
          <h3 className="text-3xl font-bold mb-6 md:mb-0 max-w-2xl leading-tight">
            Your Donation Is A Gift To Them. Donate Today!
          </h3>
          <motion.a
            href={`/${storeFormData?.slug || 'non-profit'}/donate`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-3 rounded-full font-semibold shadow-lg transition duration-300"
            style={{ backgroundColor: storeFormData?.themeSettings?.secondaryColor || '#FFFFFF', color: primaryColor }}
          >
            Donate Now <ArrowRightIcon className="w-5 h-5 ml-2" />
          </motion.a>
        </motion.div> */}
      </div>
    </section>
  );
}