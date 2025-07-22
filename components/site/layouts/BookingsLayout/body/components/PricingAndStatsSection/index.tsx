'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion'; // Import useInView hook
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Simple CountUp component for engaging statistics
const CountUp = ({ end, duration = 2000, start = 0 }: { end: number; duration?: number; start?: number }) => {
  const [count, setCount] = useState(start);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 }); // Trigger when 50% in view

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animateCount = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.min(end, Math.floor(start + progress * (end - start))));
        requestAnimationFrame(animateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animateCount);

    return () => {
      // Cleanup if component unmounts before animation finishes
      startTime = null;
    };
  }, [end, duration, start, isInView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};


export default function PricingAndStatsSection() { // Renamed for clarity within the context of this snippet
  const { storeFormData } = useStoreContext();
  const {
    name,
    themeSettings,
    stats = [],
    metrics = [],
    pricingTiers = [],
  } = storeFormData;

  // Adjusting primary color for a vibrant but not overwhelming feel in light mode
  const primaryColor = themeSettings?.primaryColor || '#00A880'; // A slightly deeper, more striking emerald for contrast

  const featuredPricing = pricingTiers.find((p) => p.isFeatured);

  return (
    <div className="mt-20 max-w-5xl mx-auto text-center space-y-12 relative z-10 px-4 sm:px-6 lg:px-8"> {/* Increased spacing, added horizontal padding */}

      {/* Featured Pricing Highlight */}
      {featuredPricing && (
        <motion.div
          className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-xl relative overflow-hidden group hover:shadow-emerald-300/50 transition-all duration-300 transform hover:-translate-y-1" // Enhanced styling, subtle hover effect
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% in view
        >
          {/* Background element for visual flair */}
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"
            style={{ background: `linear-gradient(to bottom right, ${primaryColor}, #81c784)` }}
          ></div>
          <div className="relative z-10">
            <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-2">
              Our Most Popular Plan
            </h4>
            <p className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-none">
              <span className="text-3xl font-normal align-top mr-1">KES</span>
              {featuredPricing.price}
            </p>
            <p className="text-lg text-gray-600 mt-3 max-w-lg mx-auto">
              {featuredPricing.description || `Experience premium features tailored for your needs. Best value for money.`}
            </p>

            {/* Call to Action Button */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0, 168, 128, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-full shadow-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
            >
              Get Started Today
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 14l-5 5-5-5M12 5.75v12.5" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Engaging Stats/Metrics Grid */}
      {(stats.length > 0 || metrics.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-16"> {/* More responsive grid, increased gap */}
          {[...stats, ...metrics].map(({ label, value, iconUrl }, i) => (
            <motion.div
              key={label}
              className="text-center bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center" // Clean background, subtle hover
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true, amount: 0.5 }} // Trigger when 50% in view
            >
              {iconUrl && (
                <Image
                  src={iconUrl}
                  loader={loader}
                  alt={label}
                  width={60} // Larger icons for impact
                  height={60}
                  className="mx-auto mb-4 object-contain" // Centered and ensure content fit
                />
              )}
              
              <h5 className="text-5xl font-extrabold text-emerald-600 leading-tight">
                <CountUp end={parseInt(String(value).replace(/[^0-9]/g, '')) || 0} /> {/* Add String() conversion here */}
                {/* Append non-numeric parts if any, e.g., '+' or '%' */}
                {String(value).includes('+') && '+'} {/* Also convert to string here */}
                {String(value).includes('%') && '%'} {/* And here */}
              </h5>
              <p className="text-lg text-gray-700 mt-2 font-medium">{label}</p> {/* Clearer label */}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}