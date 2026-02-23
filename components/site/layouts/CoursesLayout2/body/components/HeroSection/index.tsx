'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon, BanknotesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';
import clsx from 'clsx';
import { HeroSlide } from '@/types/typings';

// Define types based on your transformCompanyToStoreForm and Prisma schema
// export type HeroSlide = {
//   id: string;
//   imageUrl: string;
//   productImageUrl?: string;
//   headline: string;
//   subline: string;
//   ctaText: string;
//   ctaLink: string;
//   badgeText?: string | null;
//   price?: number | null;
//   endsAt?: string | null;
//   order: number;
//   videoLink?: string | null;
// };

export type Stat = {
  label: string;
  value: string;
  iconUrl?: string;
};

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  id?: string;
  name?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  geoLocation?: any;
  openingHours?: any;
  domain?: string;
  currency?: string;
  locale?: string;
  pricingTiers?: any[];
  themeSettings?: ThemeSettings;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  seo?: any;
  analyticsConfig?: any;
  paymentSettings?: any;
  shippingSettings?: any;
  awards?: any[];
  metrics?: any[];
  stats?: Stat[];
  socialLinks?: any[];
  blogs?: any[];
  policies?: any[];
  faqs?: any[];
  testimonials?: any[];
  heroSlides?: HeroSlide[];
  promotions?: any[];
  marketplaceListings?: any[];
  StoreCategory?: any[];
};

// Placeholder for useStoreContext to make the component runnable independently
// You can uncomment this block to test with mock data if needed
// const useStoreContext = () => ({
//   storeFormData: {
//     id: '683581bba1bdf6ca3624b530',
//     name: 'Educational & Online Courses',
//     slug: 'educational-online-courses',
//     tagline: 'Unlock Your Potential',
//     description: 'sample description',
//     hasWebsite: true,
//     companyCategoryId: null,
//     category: 'Educational & Online Courses',
//     logoUrl: 'https://ghubabucket.s3.amazonaws.com/images/c370dc36-17c2-4edd-841a-b033337a73b2.png',
//     bannerUrl: 'https://ghubabucket.s3.amazonaws.com/images/015fda07-de70-4629-817b-7c735ad4e844.jpeg',
//     contactEmail: 'brendenodhiambo@gmail.com',
//     contactPhone: '0732771353',
//     site: null,
//     address: 'Redeemed Gospel Church, Mau Mau Road, Mathare 3B, Mlango Kubwa ward, Mathare, Nairobi, Nairobi County, 00611, Kenya',
//     geoLocation: { lat: -1.261568, lng: 36.8574464 },
//     openingHours: {
//       mon: { open: '09:00', close: '17:00' },
//       tue: { open: '09:00', close: '17:00' },
//       wed: { open: '09:00', close: '17:00' },
//       thu: { open: '09:00', close: '17:00' },
//       fri: { open: '09:00', close: '17:00' },
//       sat: '',
//       sun: ''
//     },
//     domain: 'https://www.educational-online-courses.salesmanpro.site',
//     currency: 'KES',
//     locale: 'en-US',
//     pricingTiers: [],
//     themeSettings: { primaryColor: '#fd2121', secondaryColor: '#ffffff' },
//     userId: '67c5b0182e2372b5f2366dbe',
//     createdAt: '2025-05-27T09:11:21.971Z',
//     updatedAt: '2025-06-24T15:15:19.118Z',
//     deletedAt: null,
//     sEOId: '683581baa1bdf6ca3624b525',
//     analyticsConfigId: '6847f49ce97163f3ad22af10',
//     paymentSettingsId: '6847f49ce97163f3ad22af11',
//     shippingSettingsId: '6847f49ce97163f3ad22af12',
//     awards: [],
//     metrics: [],
//     stats: [
//       {
//         label: 'Students Enrolled',
//         value: '5000+',
//         iconUrl: 'https://img.icons8.com/ios-filled/50/ffffff/student-male.png'
//       },
//       {
//         label: 'Courses Offered',
//         value: '150+',
//         iconUrl: 'https://img.icons8.com/ios-filled/50/ffffff/book.png'
//       },
//       {
//         label: 'Expert Tutors',
//         value: '50+',
//         iconUrl: 'https://img.icons8.com/ios-filled/50/ffffff/teacher.png'
//       }
//     ],
//     socialLinks: [],
//     blogs: [],
//     policies: [],
//     faqs: [],
//     testimonials: [],
//     heroSlides: [
//       {
//         id: '685ac107c15bfc6a22259017',
//         imageUrl: 'https://ghubabucket.s3.amazonaws.com/images/55f2153f-da53-4c40-8810-25c6722db88a.jpeg',
//         productImageUrl: 'https://ghubabucket.s3.amazonaws.com/images/e9736357-c689-4a62-92f1-680a7b23009b.jpeg',
//         headline: 'Master New Skills Online',
//         subline: 'Access a vast library of courses taught by industry leaders, designed to accelerate your career.',
//         ctaText: 'Start Learning',
//         ctaLink: 'viewlink.com/start-learning',
//         badgeText: null,
//         price: null,
//         endsAt: null,
//         order: 0,
//         videoLink: 'https://www.youtube.com/watch?v=your-actual-video-id'
//       },
//     ],
//     promotions: [],
//     seo: {},
//     analyticsConfig: {},
//     paymentSettings: {},
//     shippingSettings: {},
//     marketplaceListings: [],
//     StoreCategory: [],
//   } as StoreForm,
// });

// Reusable loader and error handler
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "https://placehold.co/400x250/CCCCCC/000000?text=Image+Error";
};

// Animation variants
const heroVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 10,
      duration: 0.8,
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

// **********************************************
// NOTE: This assumes the required imports are present,
// e.g., 'motion' from 'framer-motion', 'clsx', 'Image' from 'next/image',
// and the Heroicons: ArrowRightIcon, AcademicCapIcon, BanknotesIcon, HeartIcon.
// This also assumes you have `customLoader` and `handleImageError` functions defined.
// **********************************************

// Accent Color (kept for consistency)
const accentColor = 'rgb(59, 130, 246)'; // Tailwind blue-500

// --- Card Variants for Individual Items (Slightly adjusted for scroll context) ---
const scrollItemVariants = {
  hidden: { opacity: 0, x: 100, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 0.5,
    },
  },
};

// --- Sub-component for the Floating Doodles ---
const FloatingDoodle = ({ src, className, delay = 0, duration = 4, yOffset = 20 }: any) => (
  <motion.img
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: 0.6, 
      scale: 1,
      y: [0, -yOffset, 0],
    }}
    transition={{
      opacity: { duration: 1, delay },
      y: { duration, repeat: Infinity, ease: "easeInOut", delay }
    }}
    src={src}
    alt="doodle"
    className={`${className} pointer-events-none z-20`}
  />
);

// --- Refined InfoCard (Sketch Style) ---
const InfoCard = ({ stat, index, primaryColor }: any) => {
  // Cycle through icons based on index
  const Icons = [AcademicCapIcon, BanknotesIcon, RocketLaunchIcon];
  const Icon = Icons[index % Icons.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="flex-shrink-0 w-72 md:w-80 bg-white border-2 border-slate-900 p-6 shadow-[8px_8px_0px_#0f172a] snap-center"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2 border-2 border-slate-900 rounded-sm" style={{ color: primaryColor }}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
      </div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">{stat.label}</h3>
    </motion.div>
  );
};

export default function HeroSection() {
  const { storeFormData } = useStoreContext();
  const { scrollY } = useScroll();

  // Parallax effects for doodles
  const y1 = useTransform(scrollY, [0, 500], [0, -80]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  // Data mapping with fallbacks
  const activeSlide = storeFormData?.heroSlides?.[0];
  const stats = storeFormData?.stats || [];
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#2563eb';

  const headline = activeSlide?.headline || "Your Journey to Knowledge Begins Here";
  const subline = activeSlide?.subline || "Explore a world of learning opportunities with expert instructors.";
  const bannerImg = activeSlide?.imageUrl || "/assets/fallback-campus.jpg";

  return (
    <section className="relative w-full bg-white overflow-hidden font-sans">
      {/* 1. Blueprint Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-10" 
        style={{ 
          backgroundImage: `linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`, 
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* 2. Parallax Doodles */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 hidden md:block">
        <FloatingDoodle src="/assets/doodles/rocket.png" className="absolute left-[5%] top-[15%] w-32 rotate-[-15deg]" delay={0.2} />
        <FloatingDoodle src="/assets/doodles/pencil.png" className="absolute right-[10%] top-[20%] w-20 rotate-[15deg]" delay={0.5} />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute inset-0 hidden md:block">
        <FloatingDoodle src="/assets/doodles/backpack.png" className="absolute right-[5%] bottom-[30%] w-36 rotate-[-10deg]" delay={0.8} />
      </motion.div>

      {/* 3. Hero Content */}
      <div className="relative z-10 pt-20 pb-32 px-6 flex flex-col items-center text-center max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1 border-2 border-slate-900 font-bold text-xs uppercase tracking-[0.3em] mb-6 bg-white">
            {storeFormData?.tagline || "Private Excellence"}
          </span>
          
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.9] uppercase">
             {headline.split(' ').map((word, i) => (
               <span key={i} className={i % 3 === 0 ? "" : "block md:inline"}>
                 {word}{" "}
               </span>
             ))}
          </h1>
          
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            {subline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = activeSlide?.ctaLink || '#'}
              className="px-10 py-4 text-white font-black text-lg uppercase tracking-tight shadow-[8px_8px_0px_#000] hover:shadow-none transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              {activeSlide?.ctaText || "Enroll Now"}
            </motion.button>
            
            {activeSlide?.videoLink && (
              <button 
                onClick={() => window.open(activeSlide.videoLink || '', '_blank')}
                className="flex items-center gap-2 font-black uppercase text-slate-900 hover:text-blue-600 transition-colors"
              >
                <PlayCircleIcon className="w-8 h-8" style={{ color: primaryColor }} />
                Watch Story
              </button>
            )}
          </div>
        </motion.div>

        {/* 4. Horizontal Stat Gallery (Replacing the old info cards) */}
        <div className="w-full flex overflow-x-auto snap-x snap-mandatory pb-8 gap-6 scrollbar-hide">
          {stats.map((stat, i) => (
            <InfoCard key={i} stat={stat} index={i} primaryColor={primaryColor} />
          ))}
        </div>
      </div>

      {/* 5. The "Torn Paper" Transition */}
      <div className="relative h-40 w-full overflow-hidden leading-[0] z-30">
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path 
            d="M0,0 C150,90 400,90 600,40 C800,-10 1050,-10 1200,80 L1200,120 L0,120 Z" 
            className="fill-slate-900"
          ></path>
        </svg>
      </div>

      {/* 6. Contextual Hero Image Section */}
      <div className="bg-slate-900 w-full px-6 pb-24">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto relative group"
        >
          {/* Sketchy border around the image */}
          <div className="absolute -inset-3 border-2 border-dashed border-blue-500/30 rounded-3xl" />
          <div className="relative h-[400px] md:h-[600px] w-full overflow-hidden rounded-2xl grayscale hover:grayscale-0 transition-all duration-1000">
             <Image 
               src={bannerImg} 
               alt="Campus life" 
               fill 
               className="object-cover"
               priority
              loader={customLoader}
              onError={handleImageError}
             />
          </div>
        </motion.div>
      </div>
    </section>
  );
}