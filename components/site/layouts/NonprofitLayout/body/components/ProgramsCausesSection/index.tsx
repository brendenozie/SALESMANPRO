'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';

// --- MOCK DATA & CONFIGURATION ---
const primaryColor = '#059669'; // Emerald Green standard fallback

const mockListings = [
  {
    id: 'cause-1',
    name: 'Medical Aid for Children',
    description: 'Providing essential healthcare, vaccinations, and medical support to vulnerable children in remote areas, ensuring they receive the care they need to thrive.',
    images: ['https://images.unsplash.com/photo-1584515933487-75982136b247?auto=format&fit=crop&q=80&w=600'],
    order: 1,
  },
  {
    id: 'cause-2',
    name: 'Education for All',
    description: 'Building schools, providing learning materials, and supporting teachers to ensure every child has access to quality education and a brighter future.',
    images: ['https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600'],
    order: 2,
  },
  {
    id: 'cause-3',
    name: 'Clean Water Initiatives',
    description: 'Implementing sustainable water projects to provide clean and safe drinking water to communities, drastically improving health and quality of life.',
    images: ['https://images.unsplash.com/photo-1541814066-557ff20dc9ca?auto=format&fit=crop&q=80&w=600'],
    order: 3,
  },
  {
    id: 'cause-4',
    name: 'Emergency Food Relief',
    description: 'Delivering urgent food supplies and nutritional support to families affected by sudden crises and natural disasters, acting as a critical lifeline.',
    images: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'],
    order: 4,
  },
];

const mockStoreFormData = {
  name: "Children's Hope Foundation",
  slug: 'childrens-hope-foundation',
  projects: mockListings,
  themeSettings: { primaryColor: primaryColor },
};

const useStoreContext = () => ({ storeFormData: mockStoreFormData });

// --- ANIMATION CONFIGURATION ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.215, 0.610, 0.355, 1.000] }
  }
};

// --- PROGRAM CARD COMPONENT ---
const ProgramCard = ({ 
  listing, 
  organizationSlug, 
  mockRouterPush, 
  index 
}: { 
  listing: typeof mockListings[0]; 
  organizationSlug: string; 
  mockRouterPush: (path: string) => void; 
  index: number 
}) => {
  const imageUrl = listing.images?.[0] || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600';
  const targetPath = `/${organizationSlug}/program/${listing.id}`;

  return (
    <motion.div
      variants={cardVariants}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
    >
      <div 
        className="cursor-pointer overflow-hidden aspect-[16/10] bg-slate-100 relative"
        onClick={() => mockRouterPush(targetPath)}
      >
        <img
          src={imageUrl}
          alt={listing.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600";
          }}
        />
        <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors duration-300" />
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            className="text-lg font-bold text-slate-900 line-clamp-1 mb-2 hover:text-slate-800 transition-colors cursor-pointer"
            onClick={() => mockRouterPush(targetPath)}
          >
            {listing.name}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-6">
            {listing.description}
          </p>
        </div>

        <button
          onClick={() => mockRouterPush(targetPath)}
          className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-slate-900 group/btn transition-colors hover:text-slate-700 w-fit"
        >
          <span>Explore Campaign</span>
          <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400 transition-transform duration-300 group-hover/btn:translate-x-1" strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
};

// --- MAIN SECTION COMPONENT ---
export default function HighImpactPrograms({storeFormData}: {storeFormData: any}) {
  // const { storeFormData } = useStoreContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const listingsToRender = storeFormData?.projects?.length
    ? [...storeFormData.projects].sort((a, b) => (a.order || 0) - (b.order || 0))
    : mockListings;

  const organizationSlug = storeFormData?.slug || 'non-profit';

  const mockRouterPush = (path: string) => {
    console.log(`Navigating to: ${path}`);
  };

  const handleCarouselScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardElement = scrollContainerRef.current.firstElementChild as HTMLElement;
      const cardWidth = cardElement ? cardElement.offsetWidth + 24 : 320; 
      
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="programs" className="py-24 md:py-32 bg-white border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: Framing Sticky Header Panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 flex flex-col justify-between h-full min-h-[260px]">
            <div>
              <span className="text-xs uppercase tracking-widest font-black text-slate-500 block mb-3">
                Our Work In Action
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
                High-Impact <br />Initiatives.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
                Direct community support networks tailored to address foundational infrastructure, survival systems, and personal enrichment directly.
              </p>
            </div>

            {/* Pagination Controls Integrated Directly into Left Frame */}
            <div className="flex items-center gap-3 mt-8 lg:mt-12">
              <button 
                onClick={() => handleCarouselScroll('left')} 
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeftIcon className="w-4 h-4 text-slate-700" strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => handleCarouselScroll('right')} 
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm active:scale-95"
                aria-label="Scroll right"
              >
                <ChevronRightIcon className="w-4 h-4 text-slate-700" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Asynchronous Dynamic Horizontal Scroll Scoped Block */}
          <div className="lg:col-span-8 w-full min-w-0">
            <motion.div 
              ref={scrollContainerRef}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex gap-6 overflow-x-auto pb-6 pt-1 snap-x snap-mandatory scrollbar-none"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              {listingsToRender.map((listing, i) => (
                <div key={listing.id} className="w-[280px] sm:w-[340px] flex-shrink-0 snap-start">
                  <ProgramCard
                    listing={listing}
                    organizationSlug={organizationSlug}
                    mockRouterPush={mockRouterPush}
                    index={i}
                  />
                </div>
              ))}
              
              {/* Specialized Dynamic CTA Registry Block Endcap */}
              <div className="w-[280px] sm:w-[340px] flex-shrink-0 snap-start">
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 flex flex-col justify-between h-full min-h-[360px] text-left">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700">
                    <SparklesIcon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      Looking for more fields of action?
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      Explore our centralized active registry catalog directory to find specific community campaigns tracking your target goal values directly.
                    </p>
                    <button
                      onClick={() => mockRouterPush(`/${organizationSlug}/programs`)}
                      className="inline-flex items-center justify-center px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition-all active:scale-98 w-full"
                    >
                      View All Initiatives
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>

      </div>
      
      {/* Structural Cross-Browser Scrollbar Hiding Engine Injection */}
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>
    </section>
  );
}