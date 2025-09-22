'use client';

import React from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Import slick carousel styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Fallback static testimonials - updated with more diverse avatars and quotes
const staticTestimonials = [
  {
    authorName: 'Sarah L.',
    quote: 'Booking my service through this platform is incredibly smooth and easy. The user interface is intuitive, and I always find exactly what I need. Highly recommend!',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734b319?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    authorName: 'James K.',
    quote: 'I was impressed by the quality of service providers and the seamless booking process. This platform truly sets a new standard for convenience and excellence.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1549040846-95ff88301f2f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    authorName: 'Amara N.',
    quote: 'The personalized experience I received was outstanding. Every detail was taken care of, making my well-being journey truly special. A fantastic discovery!',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1542345513-8a9d18b6e632?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    authorName: 'David R.',
    quote: 'Finally, a platform that understands what clients need. Quick, reliable, and with top-tier professionals. My go-to for all my wellness needs now.',
    rating: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1557088924-d2e825a0b73c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    authorName: 'Fatuma A.',
    quote: 'The secure payment system gave me great peace of mind. Combined with the easy scheduling, it made the whole process stress-free from start to finish.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1596461404986-e88e404b4c73?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

// Custom Arrow Components for the Slider
const PrevArrow = (props: any) => {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow absolute left-0 z-10 top-1/2 -translate-y-1/2`}
      onClick={onClick}
    >
      <ChevronLeftIcon className="w-10 h-10 text-gray-500 hover:text-gray-900 transition-colors duration-300 cursor-pointer" />
    </div>
  );
};

const NextArrow = (props: any) => {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow absolute right-0 z-10 top-1/2 -translate-y-1/2`}
      onClick={onClick}
    >
      <ChevronRightIcon className="w-10 h-10 text-gray-500 hover:text-gray-900 transition-colors duration-300 cursor-pointer" />
    </div>
  );
};

export default function TestimonialsSection() {
  const { storeFormData } = useStoreContext();
  const { name = 'Our Platform', testimonials = [], themeSettings } = storeFormData || {};
  const items = testimonials.length ? testimonials : staticTestimonials;

  const primaryColor = themeSettings?.primaryColor || '#00A880';

  const sliderSettings = {
    dots: false, // We'll create our own dots for better styling
    infinite: items.length > 1,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true, // Use custom arrows
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1024, // lg breakpoint
        settings: {
          slidesToShow: Math.min(items.length, 2),
          slidesToScroll: 1,
          arrows: true,
        }
      },
      {
        breakpoint: 768, // md breakpoint
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false, // Turn off arrows for mobile
        }
      }
    ],
  };

  return (
    <section id="testimonials" className="relative bg-gray-50 py-24 lg:py-36 px-6 lg:px-12 text-gray-900 overflow-hidden">
      {/* Subtle, abstract background pattern */}
      <div className="absolute inset-0 z-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, #00A88030 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.span
          className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          What Our Clients Say
        </motion.span>
        
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold mt-6 text-gray-900 leading-tight"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
        >
          Real Stories, Real Results: Hear From <span style={{ color: primaryColor }}>Happy Clients</span>
        </motion.h2>

        <motion.p
          className="text-gray-700 max-w-2xl mx-auto mt-4 text-lg leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          Discover how **{name}** is enhancing the well-being journey for our valued clients, one exceptional experience at a time.
        </motion.p>
      </div>

      {/* Main Testimonials Container */}
      <div className="mt-20 max-w-6xl mx-auto relative px-4 sm:px-0">
        <Slider {...sliderSettings}>
          {items.map((t, i) => (
            <motion.div
              key={i}
              className="p-2 lg:p-4" // Padding for spacing between carousel items
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl border border-gray-200 hover:shadow-3xl hover:shadow-emerald-100/60 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden h-full flex flex-col justify-between">
                
                {/* Quote Icon as a subtle background element */}
                <svg className="absolute top-6 left-6 w-12 h-12 text-emerald-100 opacity-80 z-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.25 6.75A.75.75 0 0110 7.5v3.5a.75.75 0 01-.75.75H6.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 01.75-.75h2.75zm5.75 0a.75.75 0 01.75.75v3.5a.75.75 0 01-.75.75h-3.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 01.75-.75h3.5z" />
                </svg>

                <p className="text-gray-800 text-lg sm:text-xl leading-relaxed mb-6 mt-4 relative z-10">
                  “{t.quote}”
                </p>

                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100">
                  <Image
                    loader={loader}
                    src={t.avatarUrl || 'https://images.unsplash.com/photo-1542345513-8a9d18b6e632?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                    alt={`Avatar of ${t.authorName}`}
                    width={56}
                    height={56}
                    className="rounded-full object-cover border-2 border-emerald-300 shadow-md"
                  />
                  <div className="text-left">
                    <p className="text-lg font-bold text-gray-900">{t.authorName}</p>
                    <div className="flex text-yellow-500 mt-1">
                      {Array.from({ length: t.rating ?? 0 }).map((_, idx) => (
                        <StarIcon key={idx} className="w-5 h-5" />
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