import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

// --- MOCK DATA & CONFIGURATION ---

const primaryColor = '#059669'; // Emerald Green for growth/relief

const mockListings = [
  {
    id: 'cause-1',
    name: 'Medical Aid for Children',
    description: 'Providing essential healthcare, vaccinations, and medical support to vulnerable children in remote areas, ensuring they receive the care they need to thrive.',
    images: ['https://placehold.co/600x400/059669/FFFFFF?text=Medical+Aid'],
    order: 1,
  },
  {
    id: 'cause-2',
    name: 'Education for All',
    description: 'Building schools, providing learning materials, and supporting teachers to ensure every child has access to quality education and a brighter future.',
    images: ['https://placehold.co/600x400/3B82F6/FFFFFF?text=Education+Support'],
    order: 2,
  },
  {
    id: 'cause-3',
    name: 'Clean Water Initiatives',
    description: 'Implementing sustainable water projects to provide clean and safe drinking water to communities, drastically improving health and quality of life.',
    images: ['https://placehold.co/600x400/0EA5E9/FFFFFF?text=Clean+Water'],
    order: 3,
  },
  {
    id: 'cause-4',
    name: 'Emergency Food Relief',
    description: 'Delivering urgent food supplies and nutritional support to families affected by sudden crises and natural disasters, acting as a critical lifeline.',
    images: ['https://placehold.co/600x400/EF4444/FFFFFF?text=Food+Relief'],
    order: 4,
  },
];

const mockStoreFormData = {
    name: "Children's Hope Foundation",
    slug: 'childrens-hope-foundation',
    projects: mockListings,
    themeSettings: { primaryColor: primaryColor },
};


// Function to simulate context data retrieval
const useStoreContext = () => ({ storeFormData: mockStoreFormData });

// --- UTILITY COMPONENTS ---

const ProgramCard = ({ listing, primaryColor, organizationSlug, mockRouterPush, index }: { listing: typeof mockListings[0]; primaryColor: string; organizationSlug: string; mockRouterPush: (path: string) => void; index: number }) => {
  const imageUrl = listing.images?.[0] || `https://placehold.co/600x400/D1D5DB/4B5563?text=Program+${index + 1}`;
  const progSlug = listing.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group flex-shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-full snap-center bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-3xl cursor-pointer flex flex-col h-full"
      onClick={() => mockRouterPush(`/${organizationSlug}/program/${progSlug}`)}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/600x400/CCCCCC/333333?text=Program+Image";
          }}
        />
        {/* Visual Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-100 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
        <div className="relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">
                {listing.name}
            </h3>
            <p className="text-gray-600 text-base leading-relaxed line-clamp-3 mb-4">
                {listing.description}
            </p>
        </div>
        <a
            href={`/${organizationSlug}/program/${progSlug}`}
            className="mt-4 inline-flex items-center font-bold transition-colors group-hover:translate-x-1 duration-300 text-lg"
            style={{ color: primaryColor }}
            onClick={(e) => { e.stopPropagation(); mockRouterPush(`/${organizationSlug}/program/${progSlug}`); }}
        >
            Discover Campaign
            <ArrowRightIcon className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
        </a>
      </div>
    </motion.div>
  );
};

// --- MAIN SECTION COMPONENT ---

export default function App() {
  const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#059669';
  const listingsToRender = storeFormData?.projects && Array.isArray(storeFormData?.projects) && storeFormData.projects.length > 0
    ? storeFormData.projects.sort((a, b) => (a.order || 0) - (b.order || 0))
    : mockListings;

  const organizationSlug = storeFormData?.slug || 'non-profit';

  const mockRouterPush = (path: string) => {
    console.log(`Navigating to: ${path}`);
  };

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Scroll roughly one card width
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="programs" className="py-20 md:py-32 bg-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-12 md:mb-16">
            <div className="max-w-xl">
                <p className="text-sm uppercase tracking-widest font-bold mb-2" style={{ color: primaryColor }}>
                    Our Work in Action
                </p>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                    High-Impact Programs
                </h2>
            </div>
            {/* Scroll Controls (Visible only on mobile/tablet) */}
            <div className="hidden sm:flex lg:hidden space-x-3">
                <button 
                    onClick={() => scroll('left')} 
                    className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition duration-200 shadow-md"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
                </button>
                <button 
                    onClick={() => scroll('right')} 
                    className="p-3 rounded-full hover:shadow-lg transition duration-200 shadow-md"
                    style={{ backgroundColor: primaryColor }}
                >
                    <ChevronRightIcon className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>

        {/* Programs Grid / Carousel */}
        <div 
          ref={scrollRef}
          className="grid grid-cols-1 sm:flex sm:flex-row lg:grid-cols-4 gap-8 overflow-x-auto sm:overflow-x-scroll lg:overflow-x-hidden pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ 
            // Hide scrollbar utility for the carousel effect on small screens
            msOverflowStyle: 'none',  /* IE and Edge */
            scrollbarWidth: 'none',  /* Firefox */
          }}
        >
            {/* Custom CSS to hide scrollbar for non-Firefox browsers */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

          {listingsToRender.map((listing, i) => (
            <ProgramCard
              key={listing.id}
              listing={listing}
              primaryColor={primaryColor}
              organizationSlug={organizationSlug}
              mockRouterPush={mockRouterPush}
              index={i}
            />
          ))}
          
          {/* Dedicated CTA Card for visual variety */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: listingsToRender.length * 0.1 }}
            className="flex-shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-full snap-center bg-white rounded-3xl p-8 shadow-inner border-2 border-dashed flex flex-col items-center justify-center text-center transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl"
            style={{ borderColor: primaryColor }}
          >
            <PlusCircleIcon className="w-12 h-12 mb-4" style={{ color: primaryColor }}/>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Can't Decide Where to Help?</h3>
            <p className="text-gray-600 mb-6">
                Explore our full registry of initiatives and donation options.
            </p>
            <a
                href={`/${organizationSlug}/programs`}
                className="inline-flex items-center font-bold py-3 px-6 rounded-full text-white transition duration-300 hover:scale-105"
                style={{ backgroundColor: primaryColor }}
                onClick={() => mockRouterPush(`/${organizationSlug}/programs`)}
            >
                View All Programs
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}