'use client';

import React from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

// Import slick carousel styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Fallback static testimonials - updated with more diverse avatars
const staticTestimonials = [
  {
    author: 'Sarah L.',
    quote: 'Booking my service through this platform is incredibly smooth and easy. The user interface is intuitive, and I always find exactly what I need. Highly recommend!',
    rating: 5,
    avatarUrl: '/images/avatars/avatar1.png', // Placeholder, use actual paths
  },
  {
    author: 'James K.',
    quote: 'I was impressed by the quality of service providers and the seamless booking process. This platform truly sets a new standard for convenience and excellence.',
    rating: 5,
    avatarUrl: '/images/avatars/avatar2.png',
  },
  {
    author: 'Amara N.',
    quote: 'The personalized experience I received was outstanding. Every detail was taken care of, making my well-being journey truly special. A fantastic discovery!',
    rating: 5,
    avatarUrl: '/images/avatars/avatar3.png',
  },
  {
    author: 'David R.',
    quote: 'Finally, a platform that understands what clients need. Quick, reliable, and with top-tier professionals. My go-to for all my wellness needs now.',
    rating: 4,
    avatarUrl: '/images/avatars/avatar4.png',
  },
  {
    author: 'Fatuma A.',
    quote: 'The secure payment system gave me great peace of mind. Combined with the easy scheduling, it made the whole process stress-free from start to finish.',
    rating: 5,
    avatarUrl: '/images/avatars/avatar5.png',
  },
];

// Carousel settings for mobile and desktop (responsive adjustments)
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 800, // Slightly slower transition for smoothness
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 7000, // Longer display time for each slide
  pauseOnHover: true, // Pause autoplay on hover
  adaptiveHeight: true,
  customPaging: function(i: number) { // Custom dots for a modern look
    return (
      <div className="w-3 h-3 rounded-full bg-emerald-300 opacity-50 transition-all duration-300 mx-1"></div>
    );
  },
  appendDots: (dots: React.ReactNode) => ( // Position dots below the slider
    <div style={{ position: "absolute", bottom: "-40px", width: "100%" }}>
      <ul style={{ margin: "0px" }}> {dots} </ul>
    </div>
  ),
};


export default function TestimonialsSection() {
  const { storeFormData } = useStoreContext();
  const { name = 'Our Platform', testimonials = [], themeSettings } = storeFormData || {};
  const items = testimonials.length ? testimonials : staticTestimonials;

  const primaryColor = themeSettings?.primaryColor || '#00A880'; // Consistent primary color

  return (
    <section className="relative bg-gray-50 py-24 px-6 lg:px-12 text-gray-900 overflow-hidden"> {/* Light background, dark text */}
      {/* Dynamic background element (optional, subtle wave or pattern) */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url(/images/subtle-wave-pattern.svg)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />


      <div className="max-w-6xl mx-auto text-center relative z-10"> {/* Ensure content is above background */}
        <motion.span
          className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm" // Light mode tag
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          What Our Clients Say
        </motion.span>

        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold mt-6 text-gray-900 leading-tight" // Darker, bolder title
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
        >
          Real Stories, Real Results: Hear From <span style={{ color: primaryColor }}>Happy Clients</span>
        </motion.h2>

        <motion.p
          className="text-gray-700 max-w-2xl mx-auto mt-4 text-lg leading-relaxed" // Darker gray for readability
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          Discover how {name} is enhancing the well-being journey for our valued clients, one exceptional experience at a time.
        </motion.p>
      </div>

      {/* Testimonials Carousel (Mobile & Desktop with responsiveness) */}
      <div className="mt-20 max-w-4xl mx-auto relative px-4 md:px-0"> {/* Increased top margin, added horizontal padding */}
        <Slider {...sliderSettings}
          responsive={[
            {
              breakpoint: 768, // md breakpoint
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              }
            },
            {
              breakpoint: 9999, // large screens, show multiple if enough items
              settings: {
                slidesToShow: Math.min(items.length, 2), // Show 2 slides on large screens if available
                slidesToScroll: 1,
                centerMode: items.length > 1, // Center if more than one
                centerPadding: items.length > 1 ? '60px' : '0px', // Padding if centered
              }
            }
          ]}
        >
          {items.map((t, i) => (
            <motion.div
              key={i}
              className="px-4 py-2" // Padding for spacing between carousel items
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden h-full flex flex-col justify-between"> {/* Enhanced card styling */}
                {/* Quote Icon */}
                <svg className="absolute top-6 left-6 w-12 h-12 text-emerald-100 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.25 6.75a.75.75 0 01.75.75v3.5a.75.75 0 01-.75.75h-3.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 01.75-.75h3.5zm5.75 0a.75.75 0 01.75.75v3.5a.75.75 0 01-.75.75h-3.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 01.75-.75h3.5zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 5.5v3.5h3.5v-3.5h-3.5zm5.5 0v3.5h3.5v-3.5h-3.5z" />
                </svg>

                <p className="text-gray-800 text-lg sm:text-xl leading-relaxed mb-6 mt-4 relative z-10">
                  “{t.quote}”
                </p>

                <div className="flex items-center gap-4 mt-auto"> {/* Aligned at bottom */}
                  <Image
                    loader={loader}
                    src={t.avatarUrl || '/images/avatars/default.png'}
                    alt={t.author}
                    width={56} // Larger avatar
                    height={56}
                    className="rounded-full object-cover border-2 border-emerald-300 shadow-md" // Border and shadow for avatar
                  />
                  <div className="text-left">
                    <p className="text-lg font-bold text-gray-900">{t.author}</p>
                    <div className="flex text-yellow-500 mt-1"> {/* Brighter yellow for stars */}
                      {Array.from({ length: t.rating ?? 0 }).map((_, idx) => (
                        <StarIcon key={idx} className="w-5 h-5" /> 
                        // {/* Larger stars */}
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </Slider>
      </div>
    </section>
  );
}