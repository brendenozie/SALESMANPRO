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

// NOTE: Assuming customLoader, handleImageError, scrollItemVariants, 
// and dynamic colors (primaryColor, accentColor) are available in the scope.
// Using default placeholders for accentColor in this isolated example.

// Placeholder colors for demonstration (replace with actual dynamic colors from scope)
const PRIMARY_COLOR_DEMO = '#06B6D4'; // Cyan
const ACCENT_COLOR_DEMO = '#FBBF24'; // Amber

// --- Reusable InfoCard Component (Transformed) ---
const InfoCard = ({ card }: any) => {
  const isIconCard = card.iconComponent;
  
  // Assume dynamic colors are available here:
  // const primaryColor = ...; 
  // const accentColor = ...;
  const primaryColor = PRIMARY_COLOR_DEMO; 
  const accentColor = ACCENT_COLOR_DEMO;

  // Custom border style for the gradient effect
  const gradientBorderStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid transparent',
    background: `linear-gradient(white, white) padding-box, 
                 linear-gradient(to right, ${primaryColor}, ${accentColor}) border-box`,
  };
  
  // Custom styles for the icon card background/icon color
  const iconCardIconStyle: React.CSSProperties = { color: primaryColor };
  const iconCardBgStyle: React.CSSProperties = { backgroundColor: `${primaryColor}1A` }; // Primary color with 10% opacity
  
  return (
    <motion.div
      className={clsx(
        `flex-shrink-0 w-80 md:w-96 snap-center my-2 
         bg-white dark:bg-gray-800 rounded-2xl shadow-lg 
         transition-all duration-300 group focus-within:ring-4 focus-within:ring-offset-2`,
        'hover:shadow-2xl' // Stronger base hover shadow
      )}
      style={{ 
        ...gradientBorderStyles, // Apply the gradient border style
        boxShadow: `0 10px 20px rgba(0,0,0,0.05)`,
        '--tw-ring-color': `${primaryColor} !important` 
      } as React.CSSProperties}
      variants={scrollItemVariants}
      whileHover={{ y: -8, boxShadow: `0 15px 30px ${primaryColor}40` }} // Stronger lift and color shadow
    >
      {isIconCard ? (
        // {/* --- ICON CARD DESIGN --- */}
        <div className="flex flex-col h-full p-8">
          <div 
            className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 transition-all duration-300"
            style={iconCardBgStyle}
          >
            <card.iconComponent className="w-8 h-8" style={iconCardIconStyle} />
          </div>
          <h3 className="text-2xl font-extrabold mb-3 text-gray-900 dark:text-white transition-colors duration-300">
            {card.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 flex-grow text-base mb-4">{card.description}</p>
          <a
            href={card.link || '#'}
            className={`inline-flex items-center font-bold transition-colors duration-300 group-hover:underline`}
            style={{ color: accentColor }}
          >
            Explore Now
            <ArrowRightIcon className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      ) : (
        // {/* --- IMAGE CARD DESIGN --- */}
        <div className="relative flex flex-col h-full">
          <div className="relative w-full h-48 sm:h-56 overflow-hidden">
            <Image
              src={card.image}
              alt={card.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loader={customLoader}
              onError={handleImageError}
            />
            {/* Gradient overlay for visual pop and title contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
            <h3 className="absolute bottom-4 left-6 text-xl md:text-2xl font-extrabold text-white z-10">
              {card.title}
            </h3>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <p className="text-gray-600 dark:text-gray-400 flex-grow text-sm mb-4">{card.description}</p>
            <a
              href={card.link || '#'}
              className={`inline-flex items-center font-bold transition-colors duration-300 mt-auto group-hover:underline`}
              style={{ color: accentColor }}
            >
              View Details
              <ArrowRightIcon className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// --- Main Section Component (Horizontal Scroll Gallery) ---
// (No structural changes to InfoCardsSection needed, only CSS is inherited)
function InfoCardsSection({ storeFormData }: any) { 
    
    const fallbackInfoCardsData = [
        { title: 'Global Education Programs', description: 'Explore our wide array of international study programs.', image: 'https://images.unsplash.com/photo-1541339907198-e087566d3f00?q=80&w=2670&auto=format&fit=crop', iconComponent: null, link: '#global-programs' },
        { title: 'Innovative Research Hubs', description: 'Engage with cutting-edge research projects across disciplines.', image: null, iconComponent: AcademicCapIcon, link: '#research' },
        { title: 'Student Wellness Services', description: 'Comprehensive support for mental health and well-being.', image: 'https://images.unsplash.com/photo-1534017366050-6a0b16f31623?q=80&w=2670&auto=format&fit=crop', iconComponent: null, link: '#wellness' },
        { title: 'Career Development Center', description: 'Personalized career counseling and job placement services.', image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2670&auto=format&fit=crop', iconComponent: BanknotesIcon, link: '#career-center' },
    ];
    // const dynamicInfoCardsData = storeFormData?.stats && storeFormData.stats.length > 0 ?
    //     storeFormData.stats.map((stat: any, index: number) => ({
    //         title: stat.label || `Dynamic Insight ${index + 1}`,
    //         description: stat.value ? `Value: ${stat.value}` : 'No description provided.',
    //         image: stat.iconUrl || null,
    //         iconComponent: index % 2 === 0 ? BanknotesIcon : AcademicCapIcon,
    //         link: '#'
    //     }))
    //     : fallbackInfoCardsData;

    const dynamicInfoCardsData = fallbackInfoCardsData; // Using fallback data for demonstration; replace with dynamic mapping as needed.
  return (
    <motion.section
      className="relative z-20 -mt-24 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div
        className="flex overflow-x-auto snap-x snap-mandatory py-8 gap-6
                   scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100
                   -mx-4 sm:mx-0 px-4 sm:px-0"
      >
        {dynamicInfoCardsData.map((card: any, i: number) => (
          <InfoCard key={i} card={card} />
        ))}
      </div>
    </motion.section>
  );
}

export default function HeroSection({storeFormData}: any) {
  // const { storeFormData } = useStoreContext();

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
      <InfoCardsSection storeFormData={storeFormData} />

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


//new more appealing design 
// "use client";

// import React from 'react';
// import { motion } from 'framer-motion';
// import { PlayCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
// import { AcademicCapIcon, BanknotesIcon, HeartIcon } from '@heroicons/react/24/outline';
// import { useStoreContext } from '@/contexts/StoreContext';
// import clsx from 'clsx';
// import Image from 'next/image';
// import { HeroSlide, Stat } from '@/types/typings'; // Assuming types are imported

// // Reusable loader and error handler (kept from original)
// const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
//   return `${src}?w=${width}&q=${quality || 75}`;
// };

// const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
//   e.currentTarget.onerror = null;
//   e.currentTarget.src = "https://placehold.co/400x250/CCCCCC/000000?text=Image+Error";
// };

// // Animation variants (re-defined for a staggered, left-aligned entrance)
// const heroVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       when: "beforeChildren",
//       staggerChildren: 0.15,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, x: -30 },
//   visible: {
//     opacity: 1,
//     x: 0,
//     transition: {
//       type: "spring",
//       stiffness: 80,
//       damping: 10,
//     },
//   },
// };

// const statVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       type: "spring",
//       stiffness: 100,
//       damping: 15,
//       delay: 0.8, // Stats appear after main content
//     },
//   },
// };


// // --- Reusable InfoCard Component (Kept for InfoCardsSection) ---
// // (InfoCard and InfoCardsSection code are omitted here for brevity, 
// // assuming they remain the same as the previous step and are included 
// // in the full application code.)
// // ... InfoCard and InfoCardsSection definitions ...

// // Placeholder for InfoCardsSection component to keep the import structure intact
// function InfoCardsSection() {
//     return null; 
// }


// // --- Main Hero Section Component (The New Design) ---
// export default function HeroSection() {
//   const { storeFormData } = useStoreContext();

//   const activeHeroSlide = storeFormData?.heroSlides?.[0];
//   const statsData: Stat[] = storeFormData?.stats || [];

//   const defaultHeadline = "Your Journey to Knowledge Begins Here";
//   const defaultSubline = "Explore a world of learning opportunities and unlock your full potential with our diverse courses and expert instructors.";
//   const defaultCtaText = "Discover Courses";
//   const defaultCtaLink = "#courses";
//   const defaultVideoLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
//   const defaultBannerUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop";
//   const defaultProductUrl = "https://images.unsplash.com/photo-1542435503-9d10e527f551?q=80&w=2787&auto=format&fit=crop"; // New default product image
//   const defaultTagline = "Empowering Minds, Shaping Futures";

//   const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
//   const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107'; // Ensure accent is distinct from primary

//   // Determine the image for the visual showcase
//   const visualImageUrl = activeHeroSlide?.productImageUrl || defaultProductUrl;
//   const backgroundImageUrl = activeHeroSlide?.imageUrl || defaultBannerUrl;


//   return (
//     <div className="font-sans">
//       <motion.section
//         className="relative bg-gray-900 min-h-[90vh] flex items-center overflow-hidden"
//         initial="hidden"
//         animate="visible"
//         variants={heroVariants}
//       >
//         {/* Layer 1: Massive Background Image for Depth */}
//         <div className="absolute inset-0 opacity-20 filter saturate-150 transition duration-500">
//             <Image
//                 src={backgroundImageUrl}
//                 alt="Background learning scene"
//                 fill
//                 className="object-cover object-center"
//                 loader={customLoader}
//                 sizes="100vw"
//                 priority
//             />
//         </div>
        
//         {/* Layer 2: Gradient Overlay and Geometric Shape */}
//         <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent">
//             {/* Dynamic Geometric Shape (Wedge on the right for visual break) */}
//             <div 
//                 className="absolute inset-y-0 right-0 w-full lg:w-3/5"
//                 style={{ 
//                     clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)', 
//                     backgroundColor: primaryColor,
//                     opacity: 0.15
//                 }}
//             />
//         </div>

//         {/* Layer 3: Main Content Grid */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20 lg:py-0">
//           <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
//             {/* Left Column: Text & CTA (60%) */}
//             <div className="w-full lg:w-7/12 text-center lg:text-left">
//               <motion.p
//                 className="text-lg md:text-xl mb-3 uppercase tracking-widest font-semibold drop-shadow-sm"
//                 style={{ color: accentColor }}
//                 variants={itemVariants}
//               >
//                 {storeFormData?.tagline || defaultTagline}
//               </motion.p>

//               <motion.h1
//                 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight drop-shadow-lg text-white"
//                 variants={itemVariants}
//               >
//                 {/* Visual Highlight on the first part of the headline */}
//                 <span className="relative">
//                     {activeHeroSlide?.headline?.split(' ')[0] || "Unlock"}
//                     <span 
//                         className="absolute bottom-0 left-0 w-full h-1 bg-white opacity-40 rounded-full"
//                         style={{ backgroundColor: primaryColor }}
//                     />
//                 </span>{' '}
//                 {activeHeroSlide?.headline?.split(' ').slice(1).join(' ') || "Your Potential"}
//               </motion.h1>

//               <motion.p
//                 className="text-xl md:text-2xl mb-10 max-w-2xl lg:max-w-none leading-relaxed drop-shadow-sm text-gray-300"
//                 variants={itemVariants}
//               >
//                 {activeHeroSlide?.subline || defaultSubline}
//               </motion.p>

//               {/* CTA Buttons */}
//               <motion.div
//                 className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
//                 variants={itemVariants}
//               >
//                 <motion.a
//                   href={activeHeroSlide?.ctaLink || defaultCtaLink}
//                   whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${primaryColor}70` }}
//                   whileTap={{ scale: 0.95 }}
//                   className="inline-flex items-center text-white min-w-[200px] text-center justify-center px-10 py-4 rounded-full text-lg font-bold shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-75"
//                   style={{
//                     background: primaryColor,
//                     '--tw-ring-color': `${primaryColor} !important`
//                   } as React.CSSProperties}
//                 >
//                   {activeHeroSlide?.ctaText || defaultCtaText}
//                   <ArrowRightIcon className="ml-2 w-5 h-5" />
//                 </motion.a>

//                 {activeHeroSlide?.videoLink && (
//                   <motion.a
//                     href={activeHeroSlide?.videoLink || defaultVideoLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     whileHover={{ scale: 1.05, backgroundColor: accentColor }}
//                     whileTap={{ scale: 0.95 }}
//                     className="inline-flex items-center text-gray-900 min-w-[200px] bg-white hover:bg-white/90 text-center justify-center px-10 py-4 rounded-full text-lg font-bold shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-75"
//                     style={{
//                         '--tw-ring-color': `${accentColor} !important`
//                       } as React.CSSProperties}
//                   >
//                     <PlayCircleIcon className="h-6 w-6 mr-2" style={{ color: primaryColor }} /> Watch Video
//                   </motion.a>
//                 )}
//               </motion.div>
              
//               {/* Integrated Stats / Social Proof */}
//               {statsData.length > 0 && (
//                   <motion.div 
//                       className="flex justify-center lg:justify-start gap-8 flex-wrap border-t border-gray-700 pt-6"
//                       variants={statVariants}
//                   >
//                       {statsData.slice(0, 3).map((stat, index) => (
//                           <motion.div key={index} className="text-left" variants={statVariants}>
//                               <p className="text-3xl font-extrabold text-white" style={{ color: accentColor }}>
//                                   {stat.value}
//                               </p>
//                               <p className="text-sm uppercase tracking-wider text-gray-400 mt-1">
//                                   {stat.label}
//                               </p>
//                           </motion.div>
//                       ))}
//                   </motion.div>
//               )}
//             </div>

//             {/* Right Column: Visual Showcase (40%) */}
//             <div className="w-full lg:w-5/12 relative min-h-[350px] lg:min-h-[500px]">
//                 {/* Floating Product Image with Perspective */}
//                 <motion.div
//                     className="absolute inset-0 flex items-center justify-center lg:justify-end"
//                     initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
//                     animate={{ opacity: 1, scale: 1, rotateY: 0 }}
//                     transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 50 }}
//                 >
//                     <div className="relative w-[85%] h-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
//                         <Image
//                             src={visualImageUrl}
//                             alt="Product preview"
//                             fill
//                             className="object-cover object-center"
//                             loader={customLoader}
//                             sizes="(max-width: 1024px) 85vw, 40vw"
//                             priority
//                         />
//                          {/* Subtle product overlay */}
//                         <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent"></div>
//                     </div>
//                 </motion.div>
//             </div>
//           </div>
//         </div>
//       </motion.section>

//       {/* Info Cards Section (remains below with overlap) */}
//       <InfoCardsSection />
//     </div>
//   );
// }