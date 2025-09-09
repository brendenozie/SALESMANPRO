"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HandRaisedIcon, HeartIcon, LightBulbIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';


const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Placeholder for useStoreContext
// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'Children\'s Hope Foundation',
//     CoreValues: [
//       {
//         id: 'feat-1',
//         title: "Medical Aid",
//         description: "Providing essential healthcare and medical support to vulnerable children, ensuring they receive the care they need to thrive.",
//         icon: <HeartIcon className="text-red-500 w-5 h-5" />,
//         order: 1,
//       },
//       {
//         id: 'feat-2',
//         title: "Education Support",
//         description: "Ensuring access to quality education and learning resources for a brighter future, empowering young minds with knowledge.",
//         icon: <LightBulbIcon className="text-yellow-500 w-5 h-5" />,
//         order: 2,
//       },
//       {
//         id: 'feat-3',
//         title: "Community Development",
//         description: "Investing in sustainable community projects that uplift families and children, building a foundation for long-term success.",
//         icon: <HandRaisedIcon className="text-green-500 w-5 h-5" />,
//         order: 3,
//       },
//       {
//         id: 'feat-4',
//         title: "Emergency Relief",
//         description: "Delivering urgent aid and support in times of crisis and natural disasters, acting as a lifeline when it's needed most.",
//         icon: <ShieldCheckIcon className="text-blue-500 w-5 h-5" />,
//         order: 4,
//       },
//       // You can add more for demonstration purposes
//       {
//         id: 'feat-5',
//         title: "Clean Water Initiatives",
//         description: "Implementing projects to provide safe and accessible drinking water to communities, fostering health and sanitation.",
//         icon: <HandRaisedIcon className="text-teal-500 w-5 h-5" />,
//         order: 5,
//       },
//     ],
//   },
// });

// Static fallback data with React Icons
const fallbackFeatures = [
  {
    id: 'fb-feat-1',
    title: "Food Security",
    description: "Ensuring nutritious meals for children and families facing hunger, providing a sense of stability and well-being.",
    icon: <HeartIcon className="text-purple-500 w-5 h-5" />,
    order: 1,
  },
  {
    id: 'fb-feat-2',
    title: "Shelter & Safety",
    description: "Providing safe homes and protective environments for displaced children, offering a refuge from harm.",
    icon: <ShieldCheckIcon className="text-pink-500 w-5 h-5" />,
    order: 2,
  },
  {
    id: 'fb-feat-3',
    title: "Child Protection",
    description: "Advocating for children's rights and protecting them from exploitation and abuse, ensuring they grow up safe and loved.",
    icon: <HandRaisedIcon className="text-indigo-500 w-5 h-5" />,
    order: 3,
  },
  {
    id: 'fb-feat-4',
    title: "Healthcare Access",
    description: "Facilitating access to medical services, vaccinations, and health education, building a healthier generation.",
    icon: <LightBulbIcon className="text-orange-500 w-5 h-5" />,
    order: 4,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function CoreHighlightsSection() {
  const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const featuresToRender = Array.isArray(storeFormData?.CoreValues) && storeFormData.CoreValues.length > 0
    ? storeFormData.CoreValues//.sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackFeatures;

  const sectionTitle = storeFormData?.name ? `Our Core Mission at ${storeFormData.name}` : "Our Core Mission";

  return (
    <section id="services" className="py-20 bg-gradient-to-r from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background shape for visual appeal */}
      <div className="absolute top-0 left-0 w-full h-full bg-no-repeat bg-cover opacity-10 pointer-events-none" style={{ backgroundImage: "url('/images/background-pattern.svg')" }}></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-blue-600 font-semibold mb-2">Our Pillars of Impact</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            We are dedicated to making a tangible difference in the lives of children. These core values guide every action we take and every life we touch.
          </p>
        </motion.div>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
        >
          {featuresToRender.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              variants={itemVariants}
              className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-start text-left border border-gray-100 group"
            >
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-blue-50 transition-colors duration-300 group-hover:bg-blue-100">
                {/* Check if the icon is a React element (JSX) or a string/path */}
                {React.isValidElement(item.icon) ? (
                  item.icon
                ) : (
                  <Image
                    src={ "https://placehold.co/64x64/CCCCCC/333333?text=Icon"} //item.icon ||
                    alt={item.title}
                    loader={loader}
                    width={64}
                    height={64}
                    className="filter group-hover:brightness-110 transition-all"
                  />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-gray-600 text-lg">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}