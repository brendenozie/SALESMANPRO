'use client';

import React from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StarIcon, } from '@heroicons/react/24/solid'; // Importing solid star for ratings and quote icons
import { useStoreContext } from '@/contexts/StoreContext';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

// Ensure react-slick styles are imported in your global CSS or _app.tsx
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Type definitions for clarity
interface Testimonial {
  name: string;
  text: string;
  rating: number;
  image?: string;
  company?: string; // New field for company name
}

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string; // Allowing for a specific background color for this section
}

interface StoreFormData {
  themeSettings?: ThemeSettings;
  testimonials?: Testimonial[];
  name?: string; // Company/Personal name
}

// Static fallback testimonials with more detail
const staticTestimonials: Testimonial[] = [
  {
    name: "Sarah L.",
    text: "“Working with [Your Company Name/Name] has been a game-changer for my business. Their insights and strategies are incredibly practical and have led to tangible growth. The service is seamless, and their dedication is truly inspiring!”",
    rating: 5,
    image: "/avatars/sarah.png",
    company: "Founder, InnovateCorp",
  },
  {
    name: "James K.",
    text: "“From the very first discovery call, I knew I was in capable hands. The personalized coaching sessions helped me overcome my biggest challenges and achieve goals I thought were out of reach. Absolutely top-tier support!”",
    rating: 5,
    image: "/avatars/james.png",
    company: "CEO, GrowthPath Solutions",
  },
  {
    name: "Aisha R.",
    text: "“I was hesitant at first, but [Your Company Name/Name] exceeded all my expectations. Their unique approach transformed my understanding of leadership, and the results speak for themselves. Highly recommend for anyone serious about growth.”",
    rating: 5,
    image: "/avatars/aisha.png",
    company: "Director, FutureMakers Inc.",
  },
  {
    name: "Michael B.",
    text: "“The clarity and direction I gained from these sessions are invaluable. It’s not just about advice; it's about empowerment. My team and I are more aligned and productive than ever before.”",
    rating: 4,
    image: "/avatars/michael.png", // Assuming you have more placeholder avatars
    company: "Team Lead, Synergy Tech",
  },
  {
    name: "Emily C.",
    text: "“Exceptional guidance! [Your Company Name/Name] provided actionable strategies that directly impacted our bottom line. Truly a partner in success.”",
    rating: 5,
    image: "/avatars/emily.png",
    company: "Marketing Manager, BrightIdea Co.",
  },
];

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 800, // Slightly faster transition
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 6000, // Longer display time per slide
  adaptiveHeight: true,
  pauseOnHover: true, // Pause autoplay on hover
  customPaging: function (i: number) {
    return (
      <div className="w-3 h-3 rounded-full bg-gray-400 opacity-70 transition-all duration-300 hover:opacity-100 hover:bg-gray-600 focus:outline-none" />
    );
  },
  appendDots: (dots: any) => (
    <div style={{ position: 'absolute', bottom: '-40px', display: 'flex', justifyContent: 'center', width: '100%' }}>
      <ul className="flex justify-center items-center gap-2">{dots}</ul>
    </div>
  ),
  responsive: [
    {
      breakpoint: 768, // On smaller screens, only show 1 slide
      settings: {
        slidesToShow: 1,
      },
    },
    {
      breakpoint: 1024, // On medium screens, show 2 slides
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        initialSlide: 0,
      },
    },
    {
      breakpoint: 1280, // On larger screens, show 3 slides
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
  ],
};

export default function TestimonialsSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
  const { themeSettings = {}, testimonials: dynamicTestimonials, name } = storeFormData;

  // Ensure theme colors are available and provide robust fallbacks
  const primaryColor = themeSettings.primaryColor || '#007bff'; // Default to a vibrant blue
  const secondaryColor = themeSettings.secondaryColor || '#6c757d'; // Default to a neutral gray
  const sectionBgColor = themeSettings.backgroundColor || '#f8f9fa'; // Light gray for section background
  const accentColor = primaryColor; // Using primary for accents on text and background elements
  const accentBgOpacity = `${primaryColor}15`; // ~15% opacity of primary color for light background elements

  // Build testimonials array: prefer dynamicTestimonials if available and valid
  const testimonialsData: Testimonial[] =
    Array.isArray(dynamicTestimonials) && dynamicTestimonials.length > 0
      ? dynamicTestimonials.map((t: any) => ({
          name: t.author || 'Anonymous',
          text: t.quote || '',
          rating: typeof t.rating === 'number' ? Math.max(0, Math.min(5, t.rating)) : 5, // Ensure rating is 0-5
          image: t.avatarUrl || '/placeholder-avatar.png',
          company: t.company || '',
        }))
      : staticTestimonials.map(t => ({
          ...t,
          text: t.text.replace('[Your Company Name/Name]', name || 'our team'), // Personalize static testimonials
        }));

  // Framer Motion variants for staggered animations
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const ratingStars = (rating: number) => (
    <div className="flex text-yellow-400 gap-0.5">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <motion.section
      id="testimonials"
      className="relative py-20 md:py-32 px-6 lg:px-12 overflow-hidden"
      style={{ backgroundColor: sectionBgColor }} // Use flexible background color
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
    >
      {/* Background gradients for visual depth */}
      <div
        className="absolute top-0 right-0 w-1/2 h-1/2 opacity-5"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${primaryColor}, transparent 50%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-5"
        style={{
          background: `radial-gradient(circle at 0% 100%, ${secondaryColor}, transparent 50%)`,
        }}
      />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.span
          className="inline-block text-sm font-semibold px-4 py-1 rounded-full mb-4 shadow-sm"
          variants={itemVariants}
          style={{
            backgroundColor: accentBgOpacity, // Lighter, transparent background for the tag
            color: accentColor, // Primary color for text
          }}
        >
          Client Stories
        </motion.span>

        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-800 mb-4 leading-tight drop-shadow-sm"
          variants={itemVariants}
        >
          What Our Clients <span style={{ color: primaryColor }}>Love</span> About {name || 'Us'}
        </motion.h2>

        <motion.p
          className="text-gray-700 dark:text-gray-600 max-w-2xl mx-auto text-lg md:text-xl mb-12"
          variants={itemVariants}
        >
          Don't just take our word for it. Hear directly from those who have experienced the difference.
        </motion.p>

        {/* Testimonials Slider/Grid */}
        <div className="relative">
          <Slider {...sliderSettings}>
            {testimonialsData.map((t, index) => (
              <div key={index} className="px-3 py-8"> {/* Added padding for spacing between slides */}
                <motion.div
                  className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-between transform hover:scale-[1.01] transition-all duration-300"
                  variants={itemVariants}
                >
                  <div className="relative mb-6">
                    <QuestionMarkCircleIcon className="absolute -top-4 -left-4 w-12 h-12 text-gray-200 dark:text-gray-700 opacity-80" />
                    <p className="text-gray-800 dark:text-gray-200 text-lg md:text-xl leading-relaxed italic font-medium">
                      {t.text}
                    </p>
                    <QuestionMarkCircleIcon className="absolute -bottom-4 -right-4 w-12 h-12 text-gray-200 dark:text-gray-700 opacity-80" />
                  </div>

                  <div className="flex items-center mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
                    <Image
                      src={t.image || '/placeholder-avatar.png'}
                      alt={t.name}
                      loader={loader}
                      width={64} // Larger avatar
                      height={64} // Larger avatar
                      className="rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-md"
                    />
                    <div className="text-left ml-4">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {t.name}
                      </p>
                      {t.company && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          {t.company}
                        </p>
                      )}
                      {ratingStars(t.rating)}
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </motion.section>
  );
}