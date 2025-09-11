import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// --- MOCK for useStoreContext to make the file self-contained ---
// const useStoreContext = () => {
  const storeFormDatas = {
    marketplaceListings: [
      {
        id: "1",
        name: "Corporate & Business Law",
        description: "Navigate business formation, M&A, and regulatory compliance with expert legal counsel.",
        finalPrice: 500,
        images: [{ url: "https://images.unsplash.com/photo-1579762635293-9c869911e3b5?q=80&w=2670&auto=format&fit=crop" }],
        slug: "/services/corporate-business-law",
      },
      {
        id: "2",
        name: "Strategic Financial Advisory",
        description: "Develop robust financial plans, investment strategies, and wealth management solutions.",
        finalPrice: 850,
        images: [{ url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2670&auto=format&fit=crop" }],
        slug: "/services/financial-advisory",
      },
      {
        id: "3",
        name: "Real Estate & Property",
        description: "Secure your property interests with comprehensive support for transactions and disputes.",
        finalPrice: 1200,
        images: [{ url: "https://images.unsplash.com/photo-1516766432777-66a9d5926c48?q=80&w=2670&auto=format&fit=crop" }],
        slug: "/services/real-estate-law",
      },
      {
        id: "4",
        name: "Tax Planning & Compliance",
        description: "Optimize tax liabilities and ensure compliance for individuals and corporate entities.",
        finalPrice: 700,
        images: [{ url: "https://images.unsplash.com/photo-1544377033-ff14175b94ff?q=80&w=2670&auto=format&fit=crop" }],
        slug: "/services/tax-planning",
      },
      {
        id: "5",
        name: "Litigation & Dispute Resolution",
        description: "Achieve favorable outcomes with our skilled representation in complex legal disputes.",
        finalPrice: 2500,
        images: [{ url: "https://images.unsplash.com/photo-1579762635293-9c869911e3b5?q=80&w=2670&auto=format&fit=crop" }],
        slug: "/services/litigation",
      },
      {
        id: "6",
        name: "Estate Planning & Wills",
        description: "Protect your legacy and assets through thoughtful wills, trusts, and estate strategies.",
        finalPrice: 950,
        images: [{ url: "https://images.unsplash.com/photo-1517457210740-420131464303?q=80&w=2670&auto=format&fit=crop" }],
        slug: "/services/estate-planning",
      },
    ],
    themeSettings: {
      primaryColor: "#004085",
      secondaryColor: "#1F77B4",
      accentColor: "#66B2FF",
    },
    slug: 'finance-legal',
  };
//   return { storeFormData };
// };

// SVG Icons to replace Heroicons for self-containment
// const BriefcaseIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0v3.75a.75.75 0 01-1.5 0V6a3 3 0 10-6 0v3.75a.75.75 0 01-1.5 0V6z" clipRule="evenodd" /><path fillRule="evenodd" d="M3.522 17.5a.75.75 0 01.536-.707l16.5-4.5a.75.75 0 01.815.426 1.5 1.5 0 00.329.405l2.25 2.25a1.5 1.5 0 01.405.33l1.886 3.144a.75.75 0 01-1.25.668l-4.5-2.75a.75.75 0 01-.668 0l-4.5 2.75a.75.75 0 01-1.25-.668l1.886-3.144a1.5 1.5 0 01.405-.33l2.25-2.25a1.5 1.5 0 00.329-.405z" clipRule="evenodd" /></svg>;
// const ArrowRightIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M3.75 12a.75.75 0 01.75-.75h12.564l-4.78-4.78a.75.75 0 011.06-1.06l6 6a.75.75 0 010 1.06l-6 6a.75.75 0 11-1.06-1.06l4.78-4.78H4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>;

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export default function App() {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {}, marketplaceListings = [] } = storeFormData || storeFormDatas;
  // const { accentColor } = themeSettings;

  const darkBackground = "#0A192F"; // A dark navy for section background
  const cardBackground = "#1B2A41"; // Slightly lighter for card base
  
  // Use a fallback for listings in case the array is empty
  const listingsToDisplay = marketplaceListings.length > 0 ? marketplaceListings : [];

  return (
    <section
      id="services"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden font-sans"
      style={{ background: darkBackground }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
            Our Core Expertise
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Discover how our specialized services can provide clarity and strategic advantage in your financial and legal endeavors.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {listingsToDisplay.map((listing) => (
            <motion.a
              key={listing.id}
              href={listing.id}
              variants={itemVariants}
              className="group relative p-8 rounded-3xl shadow-xl border border-transparent hover:border-blue-500/50 transition-all duration-300 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer flex flex-col"
              style={{ background: cardBackground }}
            >
              <div className="relative z-10 flex-grow">
                <div className="flex items-center justify-center p-4 rounded-full bg-blue-600/20 text-blue-400 group-hover:bg-blue-500/30 group-hover:text-blue-300 transition-colors duration-300 mb-6 w-fit"
                  style={{ backgroundColor: `${themeSettings?.accentColor}15`, color: themeSettings?.accentColor }}
                >
                  <BriefcaseIcon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors duration-300">
                  {listing.name}
                </h3>
                <p className="text-blue-100/80 text-base leading-relaxed mb-6">
                  {listing.description}
                </p>
                <p className="text-2xl font-bold" style={{ color: themeSettings?.accentColor }}>
                  ${listing.finalPrice}
                </p>
              </div>
              <span className="mt-auto inline-flex items-center text-blue-300 font-medium group-hover:text-white transition-colors duration-300"
                style={{ color: themeSettings?.accentColor }}
              >
                Learn More
                <ArrowRightIcon className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
