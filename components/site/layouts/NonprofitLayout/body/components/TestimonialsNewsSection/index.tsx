import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRightIcon, ChevronDoubleDownIcon } from '@heroicons/react/24/outline';

// --- MOCK DATA & CONFIGURATION ---

const primaryColor = '#FF5722'; // Default Orange (Warm and Energetic)

// Placeholder for external context data (simulating storeFormData)
const mockTestimonials = [
    {
        id: 'test-1',
        authorName: 'Alex Johnson',
        quote: "This organization truly changed the lives of many in my community. Their dedication is inspiring and their impact is undeniable!",
        avatarUrl: 'https://placehold.co/60x60/FF5722/FFFFFF?text=AJ',
        role: 'Community Volunteer',
        order: 1,
    },
    {
        id: 'test-2',
        authorName: 'Emily Carter',
        quote: "The support provided by this non-profit has been invaluable to countless families in desperate need. Their programs are well-managed and incredibly transparent.",
        avatarUrl: 'https://placehold.co/60x60/34D399/FFFFFF?text=EC', // Light Green
        role: 'Beneficiary Parent',
        order: 2,
    },
    {
        id: 'test-3',
        authorName: 'David Lee',
        quote: "I've seen firsthand the positive change they bring. Every donation makes a real difference in the lives of children. Proud to be a dedicated supporter!",
        avatarUrl: 'https://placehold.co/60x60/2563EB/FFFFFF?text=DL', // Blue
        role: 'Corporate Partner',
        order: 3,
    },
    {
        id: 'test-4',
        authorName: 'Maria Garcia',
        quote: "A beacon of hope for our community. Their work in providing essential services has been life-changing. We are forever grateful for their presence.",
        avatarUrl: 'https://placehold.co/60x60/A855F7/FFFFFF?text=MG', // Purple
        role: 'Local Leader',
        order: 4,
    },
];

const mockStoreFormData = {
    slug: 'childrens-hope-foundation',
    testimonials: mockTestimonials,
    themeSettings: { primaryColor: primaryColor, secondaryColor: '#FFFFFF' },
};

// Function to simulate context data retrieval
const useStoreContext = () => ({ storeFormData: mockStoreFormData });


// --- FRAMER MOTION VARIANTS ---

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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

// --- TESTIMONIAL CARD COMPONENT ---

const TestimonialCard = ({ test, primaryColor, index }: { test: typeof mockTestimonials[0]; primaryColor: string; index: number }) => {
    // Note: Replaced Next/Image with standard <img> for single-file component compatibility
    return (
        <motion.div
            variants={itemVariants}
            className="p-8 rounded-3xl shadow-xl border-t-4 relative group transition-all duration-300 hover:shadow-2xl flex flex-col justify-between h-full"
            style={{ 
                borderColor: primaryColor,
                backgroundColor: '#FFFFFF',
            }}
        >
            <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-50 transition-opacity duration-300" style={{ color: primaryColor }}>
                <ChevronDoubleDownIcon className="w-12 h-12 rotate-180" />
            </div>

            {/* Quote Body */}
            <div className="mb-8 relative z-10">
                <p className="text-gray-800 text-xl font-medium leading-relaxed">
                    {test.quote}
                </p>
            </div>

            {/* Author Info */}
            <div className="flex items-center mt-auto pt-4 border-t border-gray-100">
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 mr-4 border-2" style={{ borderColor: primaryColor }}>
                    <img
                        src={test.avatarUrl}
                        alt={test.authorName || 'Avatar'}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://placehold.co/60x60/CCCCCC/333333?text=${test.authorName?.split(' ').map(n => n[0]).join('') || 'NN'}`;
                        }}
                    />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-lg">{test.authorName}</h4>
                    <p className="text-sm font-medium" style={{ color: primaryColor }}>{test.role}</p>
                </div>
            </div>
        </motion.div>
    );
};

// --- MAIN SECTION COMPONENT ---

export default function App() {
  const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#FFFFFF';
  const organizationSlug = storeFormData?.slug || 'non-profit';

  // Determine which testimonials to render (max 3 for best layout aesthetic)
  const allTestimonials = storeFormData?.testimonials || mockTestimonials;
  const testimonialsToRender = (allTestimonials.length >= 3 
    ? allTestimonials.slice(0, 3) 
    : allTestimonials)
    .sort((a, b) => (a.order || 0) - (b.order || 0));


  return (
    <section id="testimonials" className="py-24 md:py-32 bg-gray-50 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest font-bold mb-2" style={{ color: primaryColor }}>
            Proof of Trust
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Voices from the Community
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            These authentic stories from supporters, volunteers, and beneficiaries highlight the real, human impact of our mission.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="relative" ref={ref}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className={`grid grid-cols-1 md:grid-cols-2 ${testimonialsToRender.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2 lg:max-w-4xl lg:mx-auto'} gap-8`}
          >
            {testimonialsToRender.map((test, index) => (
              <TestimonialCard
                key={test.id}
                test={test}
                primaryColor={primaryColor}
                index={index}
              />
            ))}
          </motion.div>
        </div>

        {/* Dynamic CTA - Prominent and action-oriented */}
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="p-10 rounded-3xl shadow-3xl flex flex-col md:flex-row items-center justify-between mt-20 text-center md:text-left"
            style={{ background: primaryColor, color: secondaryColor }}
        >
            <ChevronDoubleDownIcon className="w-12 h-12 mb-4 md:mb-0 md:mr-6 flex-shrink-0 opacity-80" />
            <div className="flex-1">
                <h3 className="text-3xl font-bold mb-3 md:mb-0 leading-tight">
                    Inspired by their journey? Join the movement today!
                </h3>
            </div>
            <motion.a
                href={`/${organizationSlug}/donate`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 md:mt-0 inline-flex items-center px-8 py-3 rounded-full font-semibold shadow-2xl transition duration-300 flex-shrink-0"
                style={{ backgroundColor: secondaryColor, color: primaryColor }}
            >
                Donate Now
                <ArrowRightIcon className="w-5 h-5 ml-2" />
            </motion.a>
        </motion.div>

      </div>
    </section>
  );
}