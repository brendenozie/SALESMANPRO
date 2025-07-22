'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CheckBadgeIcon,
  LockClosedIcon,
  SparklesIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const staticBenefits = [
  {
    title: 'Effortless Booking',
    description: 'Streamlined process from start to finish, ensuring a quick and easy experience.',
    Icon: CheckBadgeIcon,
  },
  {
    title: 'Secure & Transparent Payments',
    description: 'All transactions are protected with advanced encryption for your peace of mind.',
    Icon: LockClosedIcon,
  },
  {
    title: 'Personalized Experience',
    description: 'Tailored services and recommendations to perfectly match your unique needs and preferences.',
    Icon: SparklesIcon,
  },
  {
    title: 'Flexible & Convenient Scheduling',
    description: 'Book appointments at your convenience, with options to reschedule easily.',
    Icon: CalendarDaysIcon,
  },
];

export default function BenefitsSection() {
  const { storeFormData } = useStoreContext();
  const {
    name = 'Our Service',
    description = 'Your comfort and convenience are our top priority.',
    bannerUrl,
    contactEmail,
    themeSettings,
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#00A880'; // Consistent primary color

  return (
    <section className="relative bg-white py-24 overflow-hidden text-gray-900"> {/* Changed to light background, dark text */}
      {/* Subtle Background Pattern/Texture (optional, if you have one) */}
      {/* <div className="absolute inset-0 bg-repeat opacity-5" style={{ backgroundImage: 'url(/images/subtle-light-pattern.png)' }} /> */}

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          className="rounded-3xl bg-white shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden transform transition-all duration-500 hover:shadow-emerald-200/50" // Light background, refined shadow, hover effect
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Text Side (Left in LTR) */}
          <div className="w-full lg:w-1/2 p-10 lg:p-16 space-y-8 flex flex-col justify-center"> {/* Increased padding and spacing, added flex for vertical centering */}
            <motion.span
              className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm" // Lighter, more defined tag
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              Why Choose {name}?
            </motion.span>

            <motion.h2
              className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900" // Darker, bolder title
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Experience the <span style={{ color: primaryColor }}>Difference</span>: Seamless Service, Unmatched Quality.
            </motion.h2>

            <motion.p
              className="text-lg text-gray-700 max-w-xl leading-relaxed" // Darker gray for readability
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {description || 'We are dedicated to providing an unparalleled service experience, focusing on your comfort, convenience, and complete satisfaction.'}
            </motion.p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6"> {/* Increased gap, more padding */}
              {staticBenefits.map(({ title, description, Icon }, i) => ( // Added description to staticBenefits
                <motion.li
                  key={title}
                  className="flex items-start space-x-4 bg-emerald-50 rounded-xl border border-emerald-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 group" // Light background, subtle shadow, hover effect
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110" // Larger icon container, hover scale
                    style={{
                      backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, #10B981)`, // Vibrant gradient for icon background
                      boxShadow: `0 4px 15px ${primaryColor}44`, // Subtle glow
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" /> {/* Icon color */}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h3> {/* Darker text */}
                    <p className="text-sm text-gray-600 mt-1">{description}</p> {/* Added description here */}
                  </div>
                </motion.li>
              ))}
            </ul>

            {/* Call to Action Button */}
            {contactEmail && (
              <motion.a
                href={`mailto:${contactEmail}`}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0, 168, 128, 0.4)" }} // More impactful shadow
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center mt-10 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl transition-all duration-200 max-w-xs" // Larger, bolder button with shadow
              >
                Get in Touch
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.907l-7.195 3.597a2.25 2.25 0 01-2.333 0L2.25 8.94a2.25 2.25 0 01-1.07-1.907V6.75" />
                </svg>
              </motion.a>
            )}
          </div>

          {/* Image Side (Right in LTR) */}
          <div className="w-full lg:w-1/2 min-h-[300px] lg:min-h-0 relative"> {/* min-h for small screens */}
            <Image
              src={bannerUrl || '/images/relaxed-woman.jpg'} // Ensure default image is suitable for light mode
              loader={loader}
              alt="Client enjoying a service" // More descriptive alt text
              fill
              className="object-cover rounded-b-3xl lg:rounded-bl-none lg:rounded-r-3xl opacity-90" // Adjusted rounding, slightly reduced opacity for blend
            />
            {/* Subtle gradient overlay on image for better text contrast if text were on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-white/5 to-transparent lg:bg-gradient-to-r lg:from-white/20 lg:via-white/5 lg:to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}