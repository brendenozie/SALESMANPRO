'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';

const sampletestimonials = [
    {
      authorName: 'Johnathon',
      quote: 'The products exceeded my expectations! The quality is incredible and the style is unmatched. I will definitely be a returning customer.',
      avatarUrl: 'https://placehold.co/100x100/FFF?text=J',
    },
    {
      authorName: 'Alina',
      quote: 'I am so happy with my purchase. The shoes are comfortable and stylish, and the delivery was incredibly fast. Highly recommended!',
      avatarUrl: 'https://placehold.co/100x100/FFF?text=A',
    },
    {
      authorName: 'Mikey',
      quote: 'Fantastic experience from start to finish. The customer support was excellent, and the product arrived exactly as described. Love my new shoes!',
      avatarUrl: 'https://placehold.co/100x100/FFF?text=M',
    },
  ];

  interface TestimonialsSectionProps {
    testimonials?: Testimonial[] | null;
  }
  

// Main App component containing the "Testimonials" section
export default function TestimonialsSection( { testimonials = sampletestimonials }: TestimonialsSectionProps) {

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-sans p-8 flex items-center justify-center">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-16"
        >
          Testimonials
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {testimonials?.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.2, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg transition-shadow duration-300"
            >
              <div className="w-24 h-24 mb-4">
                <img
                  src={testimonial.avatarUrl || 'https://placehold.co/100x100/FFF?text=User'}
                  alt={testimonial.authorName || 'author' }
                  className="rounded-full w-full h-full object-cover border-4 border-red-500"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {testimonial.authorName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                "{testimonial.quote}"
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

// 'use client';

// import React from 'react';
// import { motion } from 'framer-motion';
// import { useStoreContext } from '../../../contexts/StoreContext';
// import Section from '../Section/Section';
// import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
// import { Testimonial } from '@/types/typings';

// interface TestimonialsSectionProps {
//   testimonials: Testimonial[];
// }

// export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
//   const { storeFormData } = useStoreContext();
//   const { themeSettings = {} } = storeFormData || {};
//   const primary = themeSettings?.primaryColor || '#f97316';
//   const secondary = themeSettings?.secondaryColor || '#3b82f6';

//   if (!testimonials || testimonials.length === 0) return null;

//   const cardVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: (idx: number) => ({
//       opacity: 1,
//       y: 0,
//       transition: { delay: idx * 0.2, duration: 0.6, ease: 'easeOut' },
//     }),
//   };

//   return (
//     <Section title="What Our Customers Say">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {testimonials.map((t, idx) => (
//             <motion.div
//               key={idx}
//               custom={idx}
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true, amount: 0.3 }}
//               variants={cardVariants}
//               whileHover={{ scale: 1.02 }}
//               className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
//             >
//               {/* Top Gradient Accent */}
//               <div
//                 className="h-1 w-full"
//                 style={{
//                   background: `linear-gradient(90deg, ${primary}, ${secondary})`,
//                 }}
//               />

//               <div className="p-6 flex flex-col h-full">
//                 {/* Quote Icon */}
//                 <div className="flex items-center mb-4 text-primary">
//                   <ChatBubbleLeftRightIcon className="h-6 w-6" style={{ color: primary }} />
//                 </div>

//                 {/* Quote Text */}
//                 <p className="flex-grow text-lg italic text-gray-700 dark:text-gray-200 h-12 overflow-clip">
//                   “{t.quote}”
//                 </p>

//                 {/* Author */}
//                 <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">
//                   — {t.authorName}
//                 </p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </Section>
//   );
// }
