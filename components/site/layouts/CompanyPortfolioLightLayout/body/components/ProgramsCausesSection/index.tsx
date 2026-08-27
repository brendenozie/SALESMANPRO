"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusCircleIcon
} from '@heroicons/react/24/outline';

// --- TYPES & INTERFACES ---

export interface IProjectListing {
  id: string;
  name: string;
  description: string;
  mediaUrls?: string[];
  order?: number;
}

interface CorporateProjectsProps {
  pagedata?: {
    companyName?: string;
    sectionSubtitle?: string | null | undefined;
    sectionTitle?: string | null | undefined;
    projects?: IProjectListing[];
    slug?: string;
  };
}

// --- STATIC PROJECT LISTINGS FALLBACK (AURUM METALS THEMING) ---
const mockMetalsProjects: IProjectListing[] = [
  {
    id: 'project-1',
    name: 'East African Sourcing Corridor',
    description: 'Establishing primary secure aggregation hubs and verified supply lines routing responsibly sourced gold doré from localized mines directly to strategic shipping corridors.',
    mediaUrls: ['https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=600&q=80'],
    order: 1,
  },
  {
    id: 'project-2',
    name: 'Industrial Cathode Distribution',
    description: 'High-volume international freight setup handling the distribution of commercial Grade-A copper cathodes across industrial manufacturing centers.',
    mediaUrls: ['https://images.unsplash.com/photo-1535557142533-b5e1cc6e2a5d?auto=format&fit=crop&w=600&q=80'],
    order: 2,
  },
  {
    id: 'project-3',
    name: 'Tier-1 Assay & Liquidity Integration',
    description: 'Partnering directly with global LBMA-accredited refinery facilities to provide seamless custody transfer, precise assaying, and rapid spot settlement.',
    mediaUrls: ['https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=600&q=80'],
    order: 3,
  },
  {
    id: 'project-4',
    name: 'Secure Transit & Vaulting Networks',
    description: 'Hardened, multi-modal secure transportation deployment in coordination with leading global high-value logistics providers for bulletproof custody management.',
    mediaUrls: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80'],
    order: 4,
  },
];

// --- UTILITY COMPONENTS ---

interface ProjectCardProps {
  project: IProjectListing;
  organizationSlug: string;
  mockRouterPush: (path: string) => void;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const imageUrl = project.mediaUrls && Array.isArray(project.mediaUrls) ? project.mediaUrls[0] : (project.mediaUrls && typeof project.mediaUrls === "string" ? project.mediaUrls : 'https://placehold.co/600x400/18181b/a1a1aa?text=Aurum+Asset');

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group flex-shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.25rem)] snap-center bg-white/90 dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-md dark:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900/90 cursor-pointer flex flex-col h-[460px]"
    >
      {/* Banner Image Frame */}
      <div className="relative h-48 overflow-hidden border-b border-zinc-200/60 dark:border-zinc-800/50">
        <img
          src={imageUrl}
          alt={project.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out brightness-90 dark:brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/600x400/27272a/71717a?text=Asset+In+Transit";
          }}
        />
      </div>

      {/* Content Space */}
      <div className="p-6 flex-1 flex flex-col justify-between relative z-10">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2.5 tracking-tight group-hover:text-amber-600 dark:group-hover:text-white transition-colors">
            {project.name}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed line-clamp-4 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
            {project.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN SECTION COMPONENT ---

export default function AurumProjectsSection({ pagedata }: CorporateProjectsProps) {
  const companySubtitle = pagedata?.sectionSubtitle || "Aurum Metals Limited &bull; Enterprise Operations";
  const companyTitle = pagedata?.sectionTitle || "Strategic Trade Deployments";
  const organizationSlug = pagedata?.slug || 'aurum-metals';

  // Parse out the custom projects schema array from DB safely
  const listingsToRender = pagedata?.projects && Array.isArray(pagedata.projects) && pagedata.projects.length > 0
    ? [...pagedata.projects].sort((a, b) => (a.order || 0) - (b.order || 0))
    : mockMetalsProjects;

  const mockRouterPush = (path: string) => {
    console.log(`Navigating to: ${path}`);
  };

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340; 
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="projects" className="py-24 md:py-36 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* Ambient Radial Mesh Grid */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-25 pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)', 
            backgroundSize: '32px 32px' 
          }} 
        />
        <div className="dark:hidden absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="hidden dark:block absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[700px] h-[300px] bg-amber-500/10 dark:bg-amber-500/5 blur-[130px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header Block with Slider Interface controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 md:mb-24 gap-6">
          <div className="max-w-xl">
            <p 
              className="text-xs uppercase tracking-[0.25em] text-amber-600 dark:text-amber-500 font-bold mb-4"
              dangerouslySetInnerHTML={{ __html: companySubtitle }}
            />
            <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight transition-colors">
              {companyTitle}
            </h2>
          </div>
          
          {/* Scroll Slider Action Interfaces */}
          <div className="flex space-x-3 self-end sm:self-auto">
            <button 
              onClick={() => scroll('left')} 
              className="p-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition duration-200 shadow-sm dark:shadow-md text-zinc-600 dark:text-zinc-400"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="p-3 rounded-full border border-amber-600 bg-amber-500 hover:bg-amber-400 transition duration-200 shadow-md text-zinc-950 font-bold"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Project Flex Box */}
        <div 
          ref={scrollRef}
          className="flex flex-row gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
          style={{ 
            msOverflowStyle: 'none',  
            scrollbarWidth: 'none',  
          }}
        >
          {/* Global Webkit Hide Engine */}
          <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {listingsToRender.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              organizationSlug={organizationSlug}
              mockRouterPush={mockRouterPush}
              index={i}
            />
          ))}
          
          {/* Custom Strategic Secondary Action Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: listingsToRender.length * 0.1 }}
            className="flex-shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.25rem)] snap-center bg-amber-50/50 dark:bg-zinc-950 rounded-3xl p-8 border-2 border-dashed border-amber-500/40 dark:border-amber-500/30 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-2xl"
          >
            <PlusCircleIcon className="w-12 h-12 mb-4 text-amber-600 dark:text-amber-500/80" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 transition-colors">
              Joint-Venture Options?
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light mb-8 max-w-xs leading-relaxed transition-colors">
              Inquire regarding active physical supply pipeline co-allocations, infrastructure funding, and trade capital integrations.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}