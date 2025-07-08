"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Added ArrowRightIcon for consistency
import { StarIcon, TvIcon, UsersIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // Added for MainCoursesSection
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking the image loader since Next.js Image is not available
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function CoursesSection() { // Renamed from HeroSection to CoursesSection for clarity
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  // For this specific issue, I'm using a mock to ensure consistent defaults and data structure.
  const useMockStoreContext = () => ({
    storeFormData: {
      id: '683581bba1bdf6ca3624b530',
      name: 'Educational & Online Courses',
      slug: 'educational-online-courses',
      tagline: 'Unlock Your Potential',
      description: 'sample description',
      hasWebsite: true,
      companyCategoryId: null,
      category: 'Educational & Online Courses',
      logoUrl: 'https://ghubabucket.s3.amazonaws.com/images/c370dc36-17c2-4edd-841a-b033337a73b2.png',
      bannerUrl: 'https://ghubabucket.s3.amazonaws.com/images/015fda07-de70-4629-817b-7c735ad4e844.jpeg',
      contactEmail: 'brendenodhiambo@gmail.com',
      contactPhone: '0706448146',
      site: null,
      address: 'Redeemed Gospel Church, Mau Mau Road, Mathare 3B, Mlango Kubwa ward, Mathare, Nairobi, Nairobi County, 00611, Kenya',
      geoLocation: { lat: -1.261568, lng: 36.8574464 },
      openingHours: {
        mon: { open: '09:00', close: '17:00' },
        tue: { open: '09:00', close: '17:00' },
        wed: { open: '09:00', close: '17:00' },
        thu: { open: '09:00', close: '17:00' },
        fri: { open: '09:00', close: '17:00' },
        sat: '',
        sun: ''
      },
      domain: 'https://www.educational-online-courses.ghuba.shop',
      currency: 'KES',
      locale: 'en-US',
      pricingTiers: [],
      themeSettings: { primaryColor: '#fd2121', secondaryColor: '#ffffff' },
      userId: '67c5b0182e2372b5f2366dbe',
      createdAt: '2025-05-27T09:11:21.971Z',
      updatedAt: '2025-06-24T15:15:19.118Z',
      deletedAt: null,
      sEOId: '683581baa1bdf6ca3624b525',
      analyticsConfigId: '6847f49ce97163f3ad22af10',
      paymentSettingsId: '6847f49ce97163f3ad22af11',
      shippingSettingsId: '6847f49ce97163f3ad22af12',
      awards: [],
      metrics: [],
      stats: [
        {
          label: 'Students Enrolled',
          value: '5000+',
          iconUrl: 'https://img.icons8.com/ios-filled/50/ffffff/student-male.png' // Example icon
        },
        {
          label: 'Courses Offered',
          value: '150+',
          iconUrl: 'https://img.icons8.com/ios-filled/50/ffffff/book.png' // Example icon
        },
        {
          label: 'Expert Tutors',
          value: '50+',
          iconUrl: 'https://img.icons8.com/ios-filled/50/ffffff/teacher.png' // Example icon
        }
      ],
      socialLinks: [],
      blogs: [],
      policies: [],
      faqs: [],
      testimonials: [],
      heroSlides: [
        {
          id: '685ac107c15bfc6a22259017',
          companyId: '683581bba1bdf6ca3624b530',
          imageUrl: 'https://ghubabucket.s3.amazonaws.com/images/55f2153f-da53-4c40-8810-25c6722db88a.jpeg',
          productImageUrl: 'https://ghubabucket.s3.amazonaws.com/images/e9736357-c689-4a62-92f1-680a7b23009b.jpeg',
          headline: 'Master New Skills Online',
          subline: 'Access a vast library of courses taught by industry leaders, designed to accelerate your career.',
          ctaText: 'Start Learning',
          ctaLink: 'viewlink.com/start-learning',
          badgeText: null,
          price: null,
          endsAt: null,
          order: 0,
          videoLink: 'https://www.youtube.com/watch?v=your-actual-video-id' // Example video link
        },
      ],
      promotions: [],
      seo: {},
      analyticsConfig: {},
      paymentSettings: {},
      shippingSettings: {},
      marketplaceListings: [],
      StoreCategory: [],
      // Adding a mock courses array to storeFormData for this section
      courses: [
        {
          title: 'Electrical Engineering',
          image: 'https://placehold.co/600x350/FF8C00/FFFFFF?text=Electrical',
          grade: '3rd Grade',
          rating: '4.8',
          students: '120',
          description: 'Dive deep into circuits, power systems, and electronics with hands-on projects and expert guidance.',
        },
        {
          title: 'General English',
          image: 'https://placehold.co/600x350/228B22/FFFFFF?text=English',
          grade: 'All Levels',
          rating: '4.9',
          students: '250',
          description: 'Master grammar, enhance vocabulary, and perfect your communication skills for academic and professional success.',
        },
        {
          title: 'Civil Engineering',
          image: 'https://placehold.co/600x350/8A2BE2/FFFFFF?text=Civil',
          grade: 'Advanced',
          rating: '4.7',
          students: '90',
          description: 'Learn to design, construct, and maintain infrastructures that shape our modern world, from bridges to buildings.',
        },
        {
          title: 'Textile Engineering',
          image: 'https://placehold.co/600x350/DDA0DD/FFFFFF?text=Textile',
          grade: 'Undergraduate',
          rating: '4.5',
          students: '75',
          description: 'Explore the fascinating world of fibers, fabrics, and textile production, blending science with creativity.',
        },
        {
          title: 'Mathematics',
          image: 'https://placehold.co/600x350/4169E1/FFFFFF?text=Mathematics',
          grade: 'All Grades',
          rating: '4.9',
          students: '300',
          description: 'Build a strong foundation in calculus, algebra, and geometry, essential for problem-solving and critical thinking.',
        },
        {
          title: 'Information Technology',
          image: 'https://placehold.co/600x350/FF4500/FFFFFF?text=IT',
          grade: 'Diploma',
          rating: '4.9',
          students: '180',
          description: 'Stay ahead in the digital age with courses covering programming, cybersecurity, data science, and more.',
        },
      ],
    },
  });

  const { storeFormData } = useMockStoreContext(); // Using mock to ensure consistent defaults
  
  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121'; // Your brand's primary color (red)
  const accentColor = "#FFC107"; // A vibrant amber/yellow for highlights, matching header's interactive elements

  // Animation variants for section content
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10,
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

  // Animation variants for course cards
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

  // Data for MainCoursesSection - now dynamically fetched from storeFormData
  const courses = storeFormData?.courses || [
    // Fallback courses if storeFormData.courses is empty or null
    {
      title: 'Electrical Engineering',
      image: 'https://placehold.co/600x350/FF8C00/FFFFFF?text=Electrical',
      grade: '3rd Grade',
      rating: '4.8',
      students: '120',
      description: 'Dive deep into circuits, power systems, and electronics with hands-on projects and expert guidance.',
    },
    {
      title: 'General English',
      image: 'https://placehold.co/600x350/228B22/FFFFFF?text=English',
      grade: 'All Levels',
      rating: '4.9',
      students: '250',
      description: 'Master grammar, enhance vocabulary, and perfect your communication skills for academic and professional success.',
    },
    {
      title: 'Civil Engineering',
      image: 'https://placehold.co/600x350/8A2BE2/FFFFFF?text=Civil',
      grade: 'Advanced',
      rating: '4.7',
      students: '90',
      description: 'Learn to design, construct, and maintain infrastructures that shape our modern world, from bridges to buildings.',
    },
  ];

  return (
    <div className="font-sans">
      {/* Main Courses Section - Redesigned */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white text-center" // Lighter background, better padding
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants} // Reusing container variants
      >
        {/* Heading */}
        <motion.div
          className="mb-14 max-w-3xl mx-auto" // Wider and centered
          variants={itemVariants}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 leading-tight">
            Explore Our <span className={`text-[${primaryColor}]`}>Main Courses</span> {/* Dynamic primary color */}
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Discover a diverse range of programs crafted to ignite your passion and accelerate your career. Each course is designed for excellence and taught by industry experts.
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {courses.map((course, index) => (
            <motion.div
              key={index}
              className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200
                          transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              variants={cardItemVariants}
            >
              <div className="relative w-full h-56 overflow-hidden">
                <img
                  src={customLoader({ src: course.image, width: 600 })}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/600x350/A0A0A0/FFFFFF?text=Course+Image";
                  }}
                />
                {/* Image Overlay on Hover */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PlayCircleIcon className={`w-16 h-16 text-white text-opacity-80 group-hover:text-[${accentColor}] transition-colors duration-300`} />
                </div>
              </div>
              <div className="p-6 text-left">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{course.title}</h3>
                <p className="text-gray-600 text-base mb-4 leading-relaxed">
                  {course.description}
                </p>
                {/* Info row */}
                <div className="flex items-center text-sm text-gray-700 gap-6 mb-6">
                  <span className="flex items-center gap-2 font-medium">
                    <TvIcon className={`w-5 h-5 text-[${accentColor}]`} /> {course.grade}
                  </span>
                  <span className="flex items-center gap-2 font-medium">
                    <StarIcon className={`w-5 h-5 text-[${accentColor}]`} /> {course.rating}
                  </span>
                  <span className="flex items-center gap-2 font-medium">
                    <UsersIcon className={`w-5 h-5 text-[${accentColor}]`} /> {course.students} Students
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: `0 5px 15px ${primaryColor}40` }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-white py-3 rounded-md text-lg font-bold
                              transition-all duration-300 shadow-md focus:outline-none focus:ring-4 focus:ring-opacity-75`}
                  style={{
                    background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
                    '--tw-ring-color': `${accentColor} !important`
                  }}
                  onClick={() => console.log(`Apply for ${course.title} clicked!`)}
                >
                  Enroll Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="mt-16 flex justify-center items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 border-2 border-[${accentColor}] rounded-full text-[${accentColor}] hover:bg-[${accentColor}] hover:text-white transition-all duration-200`}
            onClick={() => console.log('Previous Page')}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </motion.button>
          <span className="text-lg font-semibold text-gray-800">
            1 <span className="text-gray-500">/ 5</span>
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 border-2 border-[${accentColor}] rounded-full text-[${accentColor}] hover:bg-[${accentColor}] hover:text-white transition-all duration-200`}
            onClick={() => console.log('Next Page')}
          >
            <ChevronRightIcon className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
