"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  CalendarDaysIcon, 
  MapPinIcon 
} from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
import { useStoreContext } from '@/contexts/StoreContext';
import { IEvent } from '@/types/typings';

// Optimized image loader template 
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper function for crisp numerical date strings
const formatEventDate = (isoString: string | Date) => {
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.toLocaleDateString('en-US', { day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (error) {
    return { month: 'N/A', day: 'N/A', time: 'N/A' };
  }
};

const mockRouterPush = (path: string) => {
  console.log(`Navigating to: ${path}`);
};

const fallbackEvents: IEvent[] = [
  {
    id: 'fb-event-1',
    title: 'Annual Charity Run',
    description: 'Join us for our annual charity run to support children\'s education programs and community development initiatives.',
    startDateTime: new Date(),
    endDateTime: new Date(),
    location: 'Central Park, NYC',
    imageUrl: 'https://images.unsplash.com/photo-1532629391091-c247900b1713?q=80&w=600&auto=format&fit=crop',
    summary: null, onlineMeetingLink: null, videoUrl: null, projectId: null, eventType: 'GENERAL', eventStatus: 'SCHEDULED', organizerId: '', companyId: null, audience: 'ALL', targetAcademicLevelIds: [], targetCourseIds: [], targetEducatorIds: [], targetStudentIds: [], targetDepartmentIds: [], targetParentIds: [], isRegistrationRequired: false, maxCapacity: null, isPaid: false, price: null, contactPerson: null, contactEmail: null, contactPhone: null, createdAt: null, updatedAt: null,
    productCategoryId: null,
    category: null,
    subCategory: null,
    subCategoryName: null
  },
  {
    id: 'fb-event-2',
    title: 'Volunteer Appreciation Picnic',
    description: 'A day to celebrate and thank our incredible volunteers for their dedication and hard work throughout the year.',
    startDateTime: new Date(),
    endDateTime: new Date(),
    location: 'Community Gardens, CA',
    imageUrl: 'https://images.unsplash.com/photo-1518621736915-f3b160292723?q=80&w=600&auto=format&fit=crop',
    summary: null, onlineMeetingLink: null, videoUrl: null, projectId: null, eventType: 'GENERAL', eventStatus: 'SCHEDULED', organizerId: '', companyId: null, audience: 'ALL', targetAcademicLevelIds: [], targetCourseIds: [], targetEducatorIds: [], targetStudentIds: [], targetDepartmentIds: [], targetParentIds: [], isRegistrationRequired: false, maxCapacity: null, isPaid: false, price: null, contactPerson: null, contactEmail: null, contactPhone: null, createdAt: null, updatedAt: null,
    productCategoryId: null,
    category: null,
    subCategory: null,
    subCategoryName: null
  },
  {
    id: 'fb-event-3',
    title: 'Winter Coat Drive',
    description: 'Help us collect warm coats for children and families in need this winter season to ensure everyone stays warm.',
    startDateTime: new Date(),
    endDateTime: new Date(),
    location: 'Headquarters Lobby',
    imageUrl: 'https://images.unsplash.com/photo-1549429168-f9d936162391?q=80&w=600&auto=format&fit=crop',
    summary: null, onlineMeetingLink: null, videoUrl: null, projectId: null, eventType: 'GENERAL', eventStatus: 'SCHEDULED', organizerId: '', companyId: null, audience: 'ALL', targetAcademicLevelIds: [], targetCourseIds: [], targetEducatorIds: [], targetStudentIds: [], targetDepartmentIds: [], targetParentIds: [], isRegistrationRequired: false, maxCapacity: null, isPaid: false, price: null, contactPerson: null, contactEmail: null, contactPhone: null, createdAt: null, updatedAt: null,
    productCategoryId: null,
    category: null,
    subCategory: null,
    subCategoryName: null
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
};

export default function EventsSection({storeFormData}: {storeFormData: any}) {
  // const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const eventsToRender = storeFormData?.events && Array.isArray(storeFormData?.events) && storeFormData.events.length > 0
    ? storeFormData.events
    : fallbackEvents;
    
  const organizationSlug = storeFormData?.slug || 'non-profit';

  return (
    <section id="events" className="py-24 md:py-32 bg-white border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Asynchronous Layout Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end mb-16 md:mb-20">
          <div className="lg:col-span-7 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-black text-slate-500 block mb-3">
              Get Involved
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Upcoming Events.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm text-slate-600 leading-relaxed">
              Join our community coordinates at an upcoming gathering, summit, or localized operational drive to build lasting change directly in the field.
            </p>
          </div>
        </div>

        {/* Unified Display Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {eventsToRender.slice(0, 3).map((evt) => {
            const dateMeta = formatEventDate(evt.startDateTime);
            return (
              <motion.div
                key={evt.id}
                variants={itemVariants}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition-colors group flex flex-col justify-between"
              >
                {/* Visual Cover Wrapper */}
                <div 
                  className="relative aspect-[16/10] bg-slate-50 border-b border-slate-100 cursor-pointer overflow-hidden"
                  onClick={() => mockRouterPush(`/${organizationSlug}/events/${evt.id}`)}
                >
                  <Image
                    src={evt.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600"}
                    alt={evt.title || 'Event Context Poster'}
                    loader={loader}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-102"
                  />
                </div>

                {/* Event Core Structural Meta Box */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Normalized Inline Calendar String */}
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                      <CalendarDaysIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span>{dateMeta.month} {dateMeta.day} • {dateMeta.time}</span>
                    </div>

                    <h3 
                      className="font-bold text-lg text-slate-900 mb-2 tracking-tight line-clamp-1 cursor-pointer"
                      onClick={() => mockRouterPush(`/${organizationSlug}/events/${evt.id}`)}
                    >
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-6">
                      {evt.description}
                    </p>
                  </div>

                  {/* Context Block & Action Anchor Group */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    {evt.location && (
                      <div className="flex items-center text-xs font-semibold text-slate-500">
                        <MapPinIcon className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" strokeWidth={2} />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}

                    <button 
                      onClick={() => mockRouterPush(`/${organizationSlug}/events/${evt.id}`)} 
                      className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-slate-900 group/btn transition-colors hover:text-slate-700 w-fit"
                    >
                      <span>Learn More</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400 transition-transform duration-300 group-hover/btn:translate-x-1" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Central Action Row Footer */}
        <div className="flex justify-center md:justify-start">
          <button
            onClick={() => mockRouterPush(`/${organizationSlug}/events`)}
            className="px-6 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-all active:scale-98"
          >
            Explore Full Calendar
          </button>
        </div>

      </div>
    </section>
  );
}