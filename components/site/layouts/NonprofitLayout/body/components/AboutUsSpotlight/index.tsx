"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HandRaisedIcon, UserCircleIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Placeholder for useStoreContext
// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'Children\'s Hope Foundation',
//     description: 'We’ve been dedicated to improving lives through targeted support and compassionate care. Our mission is to empower communities and provide a brighter future for those most in need. Join us in our endeavor to uplift lives and create lasting change.',
//     aboutImageUrl: 'https://images.unsplash.com/photo-1594918231010-0a3b2b5f5f0b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//     stats: [
//       { id: 'stat-1', label: "Children Helped", value: "1200", order: 1, icon: <UserCircleIcon className="text-4xl text-white w-5 h-5" /> },
//       { id: 'stat-2', label: "Schools Built", value: "15", order: 2, icon: <UserGroupIcon className="text-4xl text-white w-5 h-5" /> },
//       { id: 'stat-3', label: "Volunteers Engaged", value: "500", order: 3, icon: <HandRaisedIcon className="text-4xl text-white w-5 h-5" /> },
//       { id: 'stat-4', label: "Communities Served", value: "20", order: 4, icon: <UserIcon className="text-4xl text-white w-5 h-5" /> },
//     ],
//     themeSettings: {
//       primaryColor: "#FF5722",
//       secondaryColor: "#FFFFFF",
//     },
//   },
// });

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const mockRouterPush = (path: string) => {
  console.log(`Navigating to: ${path}`);
};

// Variants for staggered animation
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function AboutUsSpotlight() {
  const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';
  const aboutImage = storeFormData?.bannerUrl || "https://placehold.co/600x450/CCCCCC/333333?text=Image+Not+Found";
  


  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/600x450/CCCCCC/333333?text=Image+Not+Found";
  };

  return (
    <section id="about" className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="relative h-96 md:h-[500px] w-full"
          >
            <Image
              src={aboutImage}
              alt="A child smiling and giving a thumbs up"
              layout="fill"
              objectFit="cover"
              loader={loader}
              className="rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              onError={handleImageError}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              <span style={{ color: primaryColor }}>{storeFormData?.name || "A Trusted Organization"}</span>
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {storeFormData?.description || "We’ve been dedicated to improving lives through targeted support and compassionate care. Our mission is to empower communities and provide a brighter future for those most in need. Join us in our endeavor to uplift lives and create lasting change."}
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: primaryColor }}
                onClick={() => mockRouterPush('/donate')}
              >
                Make a Donation
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-blue-600 text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
                style={{ borderColor: primaryColor, color: primaryColor }}
                onClick={() => mockRouterPush('/about')}
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16"
        >
          {statsToRender.map((stat,idx:number) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-white rounded-3xl p-8 shadow-xl flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {stat.iconUrl || <UserCircleIcon className="text-4xl text-white" />}
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-lg text-gray-600 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div> */}
      </div>
    </section>
  );
}