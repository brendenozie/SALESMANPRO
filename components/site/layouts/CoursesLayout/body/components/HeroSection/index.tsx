"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon, BanknotesIcon, HeartIcon } from '@heroicons/react/24/outline'; // Importing specific icons
import { useStoreContext } from '@/contexts/StoreContext';
// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type HeroSlide = {
  id: string;
  imageUrl: string;
  productImageUrl?: string; // Not used in this component, but part of schema
  headline: string;
  subline: string;
  ctaText: string;
  ctaLink: string;
  badgeText?: string | null;
  price?: number | null;
  endsAt?: string | null;
  order: number;
  videoLink?: string | null; // Added videoLink
};

export type Stat = {
  label: string;
  value: string;
  iconUrl?: string; // URL for the icon image
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
  bannerUrl?: string; // Main company banner, not necessarily for hero slide
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
  stats?: Stat[]; // Array of Stat objects for info cards
  socialLinks?: any[];
  blogs?: any[];
  policies?: any[];
  faqs?: any[];
  testimonials?: any[];
  heroSlides?: HeroSlide[]; // Array of HeroSlide objects for hero section
  promotions?: any[];
  marketplaceListings?: any[];
  StoreCategory?: any[];
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
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
//     contactPhone: '0706448146',
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
//     domain: 'https://www.educational-online-courses.tulivuapps.com',
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
//         iconUrl: 'https://img.icons8.com/ios-filled/50/ffffff/student-male.png' // Example icon
//       },
//       {
//         label: 'Courses Offered',
//         value: '150+',
//         iconUrl: 'https://img.icons8.com/ios-filled/50/ffffff/book.png' // Example icon
//       },
//       {
//         label: 'Expert Tutors',
//         value: '50+',
//         iconUrl: 'https://img.icons8.com/ios-filled/50/ffffff/teacher.png' // Example icon
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
//         // companyId: '683581bba1bdf6ca3624b530',
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
//         videoLink: 'https://www.youtube.com/watch?v=your-actual-video-id' // Example video link
//       },
//     ],
//     promotions: [],
//     seo: {},
//     analyticsConfig: {},
//     paymentSettings: {},
//     shippingSettings: {},
//     marketplaceListings: [],
//     StoreCategory: [],
//   } as StoreForm, // Cast to StoreForm for type safety in mock
// });

// Mocking the image loader since Next.js Image is not available in this environment
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function HeroSection() {
  const { storeFormData } = useStoreContext();

  // Determine the active hero slide
  const activeHeroSlide = storeFormData?.heroSlides?.[0]; // Assuming we display the first slide or a default

  // Default values for when storeFormData or specific fields are null/empty
  const defaultHeadline = "Your Journey to Knowledge Begins Here";
  const defaultSubline = "Explore a world of learning opportunities and unlock your full potential with our diverse courses and expert instructors.";
  const defaultCtaText = "Discover Courses";
  const defaultCtaLink = "#courses";
  const defaultVideoLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // A generic placeholder video
  const defaultBannerUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // High-quality tech/learning image
  const defaultTagline = "Empowering Minds, Shaping Futures";

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121'; // Your brand's primary color (red)
  const accentColor = "#FFC107"; // A vibrant amber/yellow for highlights, matching header's interactive elements

  // Animation variants for hero text and buttons
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
        staggerChildren: 0.2
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
        damping: 15
      },
    },
  };

  // Animation variants for info cards
  const cardContainerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10,
        when: "beforeChildren",
        staggerChildren: 0.15
      },
    },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      },
    },
  };

  // Determine info cards data with richer descriptions and default icons
  const infoCardsData = storeFormData?.stats && storeFormData.stats.length > 0 ?
    storeFormData.stats.map(stat => ({
      title: stat.label || 'Insight',
      description: stat.value ? `${stat.value}` : 'No description provided.',
      image: stat.iconUrl || 'https://placehold.co/400x250/CCCCCC/000000?text=Statistic',
      iconComponent: null, // Dynamic icons from URL, so no Heroicon component directly
      link: '#' // Default link for stats, can be enhanced
    })) :
    [
      {
        title: 'Scholarship Facility',
        description: 'Unlock your potential with various scholarship opportunities designed to support your educational journey.',
        image: 'https://placehold.co/400x250/FFD700/6A0DAD?text=Scholarship',
        iconComponent: BanknotesIcon, // Example Heroicon
        link: '#scholarships'
      },
      {
        title: 'Academics Excellence',
        description: 'Experience a rigorous and engaging curriculum delivered by top educators to foster intellectual growth.',
        image: 'https://placehold.co/400x250/007BFF/FFFFFF?text=Academics',
        iconComponent: AcademicCapIcon, // Example Heroicon
        link: '#academics'
      },
      {
        title: 'Vibrant Community',
        description: 'Participate in a dynamic student community with diverse clubs, events, and extracurricular activities.',
        image: 'https://placehold.co/400x250/28A745/FFFFFF?text=School+Life',
        iconComponent: HeartIcon, // Example Heroicon
        link: '#community'
      },
    ];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevents infinite loop if placeholder also fails
    e.currentTarget.src = "https://placehold.co/400x250/CCCCCC/000000?text=Image+Error";
  };

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
        {/* Overlay with a semi-transparent white background and subtle patterns */}
        <div className="absolute inset-0 bg-white/30 flex flex-col items-center justify-center text-center px-4">
          {/* Abstract geometric shapes or patterns */}
          {/* Using inline style for dynamic background color for blobs */}
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{ backgroundColor: primaryColor }}></div>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" style={{ backgroundColor: accentColor }}></div>
          <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

          <motion.div
            className="relative z-10 max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={heroVariants}
          >
            <motion.p
              className="text-lg md:text-xl mb-3 uppercase tracking-widest font-medium text-gray-700"
              variants={itemVariants}
            >
              {storeFormData?.tagline || defaultTagline}
            </motion.p>

            <motion.h1
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-sm text-gray-900"
              variants={itemVariants}
            >
              {activeHeroSlide?.headline || defaultHeadline}
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed"
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
                className="inline-flex items-center text-white min-w-[200px] text-center justify-center px-10 py-4 rounded-md text-lg font-bold shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-75"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}90)`,
                  '--tw-ring-color': `${primaryColor} !important` as any // Type assertion for custom property
                }}
                onClick={() => window.location.href = activeHeroSlide?.ctaLink || defaultCtaLink}
              >
                {activeHeroSlide?.ctaText || defaultCtaText}
              </motion.button>

              {activeHeroSlide?.videoLink && (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: `0 10px 20px ${accentColor}40` }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center text-gray-800 min-w-[200px] bg-white hover:bg-gray-100 text-center justify-center px-10 py-4 rounded-md text-lg font-bold shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-75"
                  style={{
                    '--tw-ring-color': `${accentColor} !important` as any // Type assertion for custom property
                  }}
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
      <motion.section
        className="relative z-20 -mt-24 px-4 sm:px-6 lg:px-8 "
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={cardContainerVariants}
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {infoCardsData.map((card, i) => (
            <motion.div
              key={i}
              className={`bg-white shadow-xl rounded-2xl overflow-hidden cursor-pointer
                          hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                          border-2 border-transparent`}
              style={{ '--tw-hover-border-color': accentColor } as React.CSSProperties} // Dynamic hover border color
              variants={cardItemVariants}
              whileHover={{ scale: 1.02 }}
            >
              {card.iconComponent ? ( // Render Heroicon component if available (for fallback data)
                <div className={`w-full h-60 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-2xl`}>
                  <card.iconComponent className={`w-24 h-24`} style={{ color: accentColor }} />
                </div>
              ) : ( // Render image if iconUrl is provided (for dynamic data)
                <img
                  src={customLoader({ src: card.image, width: 400 })}
                  alt={card.title}
                  className="w-full h-60 object-cover rounded-t-2xl"
                  onError={handleImageError}
                />
              )}
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{card.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{card.description}</p>
                <a
                  href={card.link || '#'}
                  className={`inline-flex items-center font-medium hover:underline group`}
                  style={{ color: accentColor }} // Dynamic text color for link
                  onClick={(e) => { e.preventDefault(); console.log(`Explore ${card.title} clicked!`); }}
                >
                  Explore More
                  <ArrowRightIcon className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
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
