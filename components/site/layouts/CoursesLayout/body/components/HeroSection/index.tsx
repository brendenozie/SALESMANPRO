"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon, BanknotesIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import clsx from 'clsx';
import Image from 'next/image';
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

// Info Cards Section Component (from previous response)
const accentColor = 'rgb(59, 130, 246)'; // Default Tailwind blue-500
const infoCardsData = [
  {
    title: 'Dynamic Image Card',
    description: 'This card features a high-quality image with a subtle overlay, demonstrating the new visual enhancements.',
    image: 'https://images.unsplash.com/photo-1542840428-c11956555198?q=80&w=2670&auto=format&fit=crop',
    link: '#image-card',
  },
  {
    title: 'Icon-Based Card',
    description: 'A clean card with a custom, gradient icon background. Perfect for services or features.',
    iconComponent: AcademicCapIcon,
    link: '#icon-card',
  },
  {
    title: 'Another Example',
    description: 'Our cards are versatile and can be used for a wide range of content, from features to blog posts.',
    image: 'https://images.unsplash.com/photo-1620247414927-4a11f2a335f6?q=80&w=2670&auto=format&fit=crop',
    link: '#another-card',
  },
];

const cardContainerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      when: 'beforeChildren',
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

// New, reusable InfoCard component
const InfoCard = ({ card }:any) => {
  const isIconCard = card.iconComponent;

  return (
    <motion.div
      className={clsx(
        `relative bg-white shadow-xl rounded-2xl overflow-hidden cursor-pointer
         hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3
         group before:absolute before:inset-0 before:rounded-2xl before:border-2 before:border-transparent before:transition-all before:duration-300`,
        'hover:before:border-blue-500 hover:before:shadow-[0_0_20px_0_rgba(59,130,246,0.5)]'
      )}
      variants={cardItemVariants}
      whileHover={{ scale: 1.02 }}
    >
      {isIconCard ? (
        <div className="relative w-full h-56 flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-30 bg-white blur-3xl z-0"></div>
          <card.iconComponent
            className="w-24 h-24 relative z-10 text-white"
          />
        </div>
      ) : (
        <div className="relative w-full h-56">
          <Image
            src={card.image}
            alt={card.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            loader={customLoader}
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      )}
      <div className="p-8 text-left">
        <motion.h3
          className="text-xl md:text-2xl font-semibold mb-2 text-gray-900 transition-colors duration-300 group-hover:text-blue-600"
          whileHover={{ scale: 1.02 }}
        >
          {card.title}
        </motion.h3>
        <p className="text-gray-600 mb-4 text-sm">{card.description}</p>
        <a
          href={card.link || '#'}
          className={`inline-flex items-center font-medium transition-colors duration-300 group`}
          style={{ color: accentColor }}
          onClick={(e) => { e.preventDefault(); console.log(`Explore ${card.title} clicked!`); }}
        >
          Explore More
          <ArrowRightIcon className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </motion.div>
  );
};

function InfoCardsSection() {
  const { storeFormData } = useStoreContext();
  const dynamicInfoCardsData = storeFormData?.stats && storeFormData.stats.length > 0 ?
    storeFormData.stats.map(stat => ({
      title: stat.label || 'Insight',
      description: stat.value ? `${stat.value}` : 'No description provided.',
      image: stat.iconUrl || 'https://placehold.co/400x250/CCCCCC/000000?text=Statistic',
      iconComponent: null, // Dynamic icons from URL, so no Heroicon component directly
      link: '#'
    })) : [
      {
        title: 'Scholarship Facility',
        description: 'Unlock your potential with various scholarship opportunities designed to support your educational journey.',
        image: 'https://placehold.co/400x250/FFD700/6A0DAD?text=Scholarship',
        iconComponent: BanknotesIcon,
        link: '#scholarships'
      },
      {
        title: 'Academics Excellence',
        description: 'Experience a rigorous and engaging curriculum delivered by top educators to foster intellectual growth.',
        image: 'https://placehold.co/400x250/007BFF/FFFFFF?text=Academics',
        iconComponent: AcademicCapIcon,
        link: '#academics'
      },
      {
        title: 'Vibrant Community',
        description: 'Participate in a dynamic student community with diverse clubs, events, and extracurricular activities.',
        image: 'https://placehold.co/400x250/28A745/FFFFFF?text=School+Life',
        iconComponent: HeartIcon,
        link: '#community'
      },
    ];

  return (
    <motion.section
      className="relative z-20 -mt-24 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={cardContainerVariants}
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dynamicInfoCardsData.map((card, i) => (
          <InfoCard key={i} card={card} />
        ))}
      </div>
    </motion.section>
  );
}

export default function HeroSection() {
  const { storeFormData } = useStoreContext();

  const activeHeroSlide = storeFormData?.heroSlides?.[0];

  const defaultHeadline = "Your Journey to Knowledge Begins Here";
  const defaultSubline = "Explore a world of learning opportunities and unlock your full potential with our diverse courses and expert instructors.";
  const defaultCtaText = "Discover Courses";
  const defaultCtaLink = "#courses";
  const defaultVideoLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const defaultBannerUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const defaultTagline = "Empowering Minds, Shaping Futures";

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = "#FFC107";

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <div
        className="relative h-[95vh] bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url("${activeHeroSlide?.imageUrl || defaultBannerUrl}")`,
          backgroundAttachment: 'fixed',
        }}
      >
        {/* ENHANCED: Overlay with a richer gradient and subtle texture */}
        <div className="absolute inset-0 bg-gray-900/40 from-gray-900/60 to-transparent flex flex-col items-center justify-center text-center px-4">
          
          {/* Abstract geometric shapes or patterns */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob" style={{ backgroundColor: primaryColor }}></div>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000" style={{ backgroundColor: accentColor }}></div>
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-300 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

          <motion.div
            className="relative z-10 max-w-4xl mx-auto text-white"
            initial="hidden"
            animate="visible"
            variants={heroVariants}
          >
            <motion.p
              className="text-lg md:text-xl mb-3 uppercase tracking-widest font-semibold drop-shadow-sm"
              variants={itemVariants}
            >
              {storeFormData?.tagline || defaultTagline}
            </motion.p>

            <motion.h1
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-lg text-white"
              variants={itemVariants}
            >
              {activeHeroSlide?.headline || defaultHeadline}
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-sm text-gray-200"
              variants={itemVariants}
            >
              {activeHeroSlide?.subline || defaultSubline}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={itemVariants}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `0 10px 20px ${primaryColor}40` }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center text-white min-w-[200px] text-center justify-center px-10 py-4 rounded-full text-lg font-bold shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-75"
                style={{
                  background: primaryColor,
                  '--tw-ring-color': `${primaryColor} !important`
                } as React.CSSProperties}
                onClick={() => window.location.href = activeHeroSlide?.ctaLink || defaultCtaLink}
              >
                {activeHeroSlide?.ctaText || defaultCtaText}
              </motion.button>

              {activeHeroSlide?.videoLink && (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: `0 10px 20px ${accentColor}40` }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center text-gray-800 min-w-[200px] bg-white hover:bg-gray-100 text-center justify-center px-10 py-4 rounded-full text-lg font-bold shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-75"
                  style={{
                    '--tw-ring-color': `${accentColor} !important`
                  } as React.CSSProperties}
                  onClick={() => window.open(activeHeroSlide?.videoLink || '', '_blank')}
                >
                  <PlayCircleIcon className="h-6 w-6 mr-2" style={{ color: primaryColor }} /> Watch Video
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Info Cards Section */}
      <InfoCardsSection />

      {/* Tailwind CSS keyframe animation for the blob effect */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}