"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
const useStoreContext = () => ({
  storeFormData: {
    themeSettings: { primaryColor: '#F59E0B' }, // Tailwind 'amber-500'
  },
});

// Loader for next/image (required for external URLs with next/image)
const loader = ({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`;

// Static fallback data for staff writers
const staffWriters = [
  { name: 'Kristin Watson', role: 'Senior Writer', img: 'https://placehold.co/200x200/F59E0B/FFFFFF?text=Kristin' },
  { name: 'Marvin Roy', role: 'Journalist', img: 'https://placehold.co/200x200/EF4444/FFFFFF?text=Marvin' },
  { name: 'Leslie Aria', role: 'Publisher', img: 'https://placehold.co/200x200/0EA5E9/FFFFFF?text=Leslie' },
  { name: 'Hawkins Alex', role: 'Content Writer', img: 'https://placehold.co/200x200/10B981/FFFFFF?text=Hawkins' },
];

export default function StaffWritersSection() {
  // Destructure storeFormData from context, providing a fallback for when context is not available
  const { storeFormData } = useStoreContext() || {};
  const { themeSettings: { primaryColor = '#F59E0B' } = {} } = storeFormData || {}; // Default primary color (Tailwind amber-500)

  // Function to handle image loading errors, replacing with a generic placeholder
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevents infinite loop if placeholder also fails
    e.target.src = 'https://placehold.co/200x200/CCCCCC/333333?text=User'; // Generic placeholder
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 md:py-20 font-inter">
      {/* Section Title and View All Link */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10">
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold text-center sm:text-left text-gray-900 mb-4 sm:mb-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Meet Our Talented Writers
        </motion.h2>
        <motion.a
          href="/writers" // Link to your main writers archive page
          className="inline-block px-6 py-3 rounded-full font-semibold text-base shadow-md transition-all duration-300
                     bg-white text-gray-800 hover:bg-gray-100 hover:shadow-lg transform hover:scale-105"
          style={{
            borderColor: primaryColor,
            borderWidth: '2px',
            color: primaryColor,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          View All Writers &rarr;
        </motion.a>
      </div>

      {/* Grid of Staff Writers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
        {staffWriters.map((writer, idx) => (
          <motion.div
            key={idx}
            className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }} // Subtle scale on hover
          >
            {/* Writer Image */}
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
              <Image
                loader={loader}
                src={writer.img}
                alt={writer.name}
                width={128} // Corresponds to w-32
                height={128} // Corresponds to h-32
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={handleImageError} // Image error fallback
              />
            </div>
            
            {/* Writer Name and Role */}
            <h4 className="mt-2 font-bold text-lg text-gray-800">{writer.name}</h4>
            <p className="text-gray-500 text-sm mt-1">{writer.role}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
