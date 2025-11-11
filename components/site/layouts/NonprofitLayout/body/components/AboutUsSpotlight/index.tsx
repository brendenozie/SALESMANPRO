import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BookOpenIcon, GlobeAltIcon, HandRaisedIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline';
// Using Lucide Icons for clean, modern symbols
// import { Users, BookOpen, HandHelping, Globe, Star } from 'lucide-react';


// --- MOCK DATA & CONFIGURATION (Replaces external context/dependencies) ---

const primaryColor = '#22C55E'; // Vibrant Green for growth/trust

const mockData = {
  name: 'Global Change Collective',
  description: "Since our founding, we've been dedicated to improving lives through targeted support and compassionate care. Our mission is to empower communities and provide a brighter future for those most in need. We believe that lasting change starts with grassroots efforts, integrity, and unwavering commitment to those we serve. Join us in our endeavor to uplift lives and create a monumental, lasting impact across the globe.",
  // Placeholder image for development environment
  aboutImageUrl: 'https://placehold.co/800x600/10B981/ffffff?text=Our+Team+in+Action', 
  stats: [
    { id: 'stat-1', label: "Children Helped", value: "1200+", order: 1, Icon: UsersIcon },
    { id: 'stat-2', label: "Schools Supported", value: "15", order: 2, Icon: BookOpenIcon },
    { id: 'stat-3', label: "Volunteers Engaged", value: "500+", order: 3, Icon: HandRaisedIcon },
    { id: 'stat-4', label: "Communities Served", value: "20+", order: 4, Icon: GlobeAltIcon },
  ],
};

const mockRouterPush = (path:string) => {
  console.log(`Navigating to: ${path}`);
  // In a real environment, this would be a router call
};

// --- FRAMER MOTION VARIANTS ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger stats
      delayChildren: 0.4,
    },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

// --- STAT CARD COMPONENT ---

const StatCard = ({ stat, primaryColor }: { stat: any; primaryColor: string }) => {
    const IconComponent = stat.Icon;
    return (
        <motion.div
            variants={statItemVariants}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-md flex items-center space-x-4 border-l-4 transition-all duration-300 transform hover:shadow-lg hover:scale-[1.02]"
            style={{ borderColor: primaryColor }}
        >
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                <IconComponent className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-0 leading-none">
                    {stat.value}
                </h3>
                <p className="text-sm text-gray-600 font-medium mt-1">
                    {stat.label}
                </p>
            </div>
        </motion.div>
    );
};


// --- MAIN SECTION COMPONENT ---

export default function AboutUsSpotlightSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const statsToRender = mockData.stats.sort((a, b) => a.order - b.order);

  return (
    <section id="about" className="py-20 md:py-32 bg-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative h-96 md:h-[550px] w-full"
          >
            <div className="absolute inset-0 bg-gray-200 rounded-[3rem] shadow-3xl overflow-hidden">
                <img
                    src={mockData.aboutImageUrl}
                    alt="A team of people working together in a community setting"
                    className="w-full h-full object-cover transform scale-[1.03]"
                    // Fallback using onerror
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/800x600/CCCCCC/333333?text=Image+Not+Found"; }}
                />
            </div>
            {/* Decorative accent box */}
            <div className="absolute bottom-[-1rem] right-[-1rem] w-32 h-32 rounded-3xl opacity-80 z-10 hidden md:block" style={{ backgroundColor: primaryColor }}>
                <StarIcon className="w-10 h-10 text-white absolute bottom-4 right-4 animate-pulse"/>
            </div>
          </motion.div>
          
          {/* RIGHT: Text and CTA Section */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <p className="text-sm uppercase tracking-widest font-bold mb-2" style={{ color: primaryColor }}>
                Who We Are
            </p>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Empowering Change, <span style={{ color: primaryColor }}>Building Futures</span>.
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              {mockData.description}
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center font-bold py-3 px-8 rounded-full shadow-xl text-white transition-all duration-300 hover:shadow-2xl"
                style={{ backgroundColor: primaryColor }}
                onClick={() => mockRouterPush('/donate')}
              >
                Start Your Impact Today
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 font-bold py-3 px-8 rounded-full transition-all duration-300 hover:text-white"
                style={{ borderColor: primaryColor, color: primaryColor, '--hover-bg': primaryColor }}
                // Custom style for cleaner hover
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = primaryColor;
                    e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = primaryColor;
                }}
                onClick={() => mockRouterPush('/about')}
              >
                Our History
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Stats Section (Underneath Main Content) */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20 p-6 rounded-2xl shadow-inner bg-gray-50 border border-gray-100"
        >
          {statsToRender.map((stat,idx) => (
            <StatCard key={idx} stat={stat} primaryColor={primaryColor} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}