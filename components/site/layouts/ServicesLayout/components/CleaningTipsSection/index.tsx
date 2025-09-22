"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline'; // Using a sleeker arrow icon
import { useStoreContext } from '@/contexts/StoreContext'; // Assuming you want to use storeFormData for dynamic colors or data

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?src=${src}&w=${width}&q=${quality || 75}`;

// Placeholder data for cleaning tips (replace with dynamic data from storeFormData if available)
const defaultTips : any = [
  {
    id: 1, // Add unique IDs for better keying
    title: '55 Best Cleaning Tips for Every Room in Your Home',
    description: 'Unlock professional secrets to maintain a spotless living space, from quick tidies to deep cleans.',
    image: '/images/cleaning1.png',
    date: 'March 17, 2024',
    link: '/blog/55-best-cleaning-tips', // Example link, ideally dynamic
  },
  {
    id: 2,
    title: 'Tips For Cleaning Your Home Before A Party',
    description: 'Prepare your home effortlessly for guests with these essential pre-party cleaning hacks and tricks.',
    image: '/images/cleaning2.png',
    date: 'March 29, 2024',
    link: '/blog/party-cleaning-tips',
  },
  {
    id: 3,
    title: '6 Cleaning Tips For When You Have Allergies',
    description: 'Discover hypoallergenic cleaning methods and products to create a healthier, allergen-free environment.',
    image: '/images/cleaning3.png',
    date: 'August 28, 2024',
    link: '/blog/allergy-cleaning-tips',
  },
];

export default function CleaningTipsSection() {
  const { storeFormData } = useStoreContext(); // Access storeFormData for theme settings

  // Use dynamic tips from storeFormData if available, otherwise fallback to default
  const tips = storeFormData?.blogs || defaultTips;

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; // teal-600 fallback
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; // orange-500 fallback

  // Animation variants for section and cards
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 12 } },
    hover: { scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section id="blog" className="bg-gray-50 dark:bg-gray-950 py-16 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs for visual interest */}
      <div
        className="absolute top-0 -left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-alt animation-delay-0"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-alt animation-delay-2000"
        style={{ backgroundColor: secondaryColor }}
      />

      <motion.div
        className="max-w-7xl mx-auto text-center mb-16 relative z-10"
        initial="hidden"
        whileInView="visible"
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 text-gray-900 dark:text-gray-100" variants={titleVariants}>
          Insights & <span className="bg-clip-text text-transparent" style={{ backgroundColor: primaryColor }}>Cleaning Wisdom</span>
        </motion.h2>
        <motion.p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto" variants={titleVariants}>
          Stay informed with our latest cleaning tips, industry news, and expert advice to keep your space sparkling.
        </motion.p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {tips.map((tip: { id?: string; title: string; description: string; image: string; link: string; date: string }, index:number) => (
          <motion.div
            key={tip.id || index} // Use unique ID for key
            className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
            onClick={() => window.location.href = tip.link} // Navigate on card click
          >
            <div className="relative w-full h-60 overflow-hidden">
              <Image
                src={tip.image}
                alt={tip.title}
                loader={loader}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 hover:scale-110 rounded-t-2xl" // Zoom effect on hover
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" /> {/* Overlay for text readability */}
            </div>

            <div className="p-6 flex flex-col justify-between h-[calc(100%-15rem)]"> {/* Adjust height based on image height */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
                  {tip.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3"> {/* Limit description lines */}
                  {tip.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link
                  href={tip.link}
                  className="inline-flex items-center gap-1 font-semibold transition-all duration-200 hover:gap-2"
                  style={{ color: primaryColor }} // Use primary brand color
                >
                  Read Article
                  <ArrowLongRightIcon className="w-5 h-5" />
                </Link>
                <span className="text-sm text-gray-500 dark:text-gray-400">{tip.date}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Optional: View All Tips button */}
      {tips.length > 3 && ( // Only show if you have more than 3 tips typically displayed
        <motion.div className="text-center mt-16" initial="hidden" whileInView="visible" variants={titleVariants} viewport={{ once: true }}>
          <Link href="/blog" passHref> {/* Link to your main blog/tips page */}
            <button
              className="inline-flex items-center px-8 py-4 rounded-full font-bold text-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105"
              style={{ backgroundColor: primaryColor, color: 'white' }}
              // whileHover={{ backgroundColor: secondaryColor }}
              // whileTap={{ scale: 0.95 }}
            >
              View All Tips
              <ArrowLongRightIcon className="w-5 h-5 ml-2" />
            </button>
          </Link>
        </motion.div>
      )}
    </section>
  );
}