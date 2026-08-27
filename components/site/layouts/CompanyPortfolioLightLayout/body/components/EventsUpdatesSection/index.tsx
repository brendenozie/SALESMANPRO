"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
import { useStoreContext } from '@/contexts/StoreContext';
import { IEvent } from '@/types/typings';

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper function for date formatting
const formatEventDate = (dateInput: string | Date) => {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.toLocaleDateString('en-US', { day: 'numeric' }),
      year: date.toLocaleDateString('en-US', { year: 'numeric' }),
      formattedTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (error) {
    return { month: 'N/A', day: 'N/A', year: 'N/A', formattedTime: 'TBD' };
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
    imageUrl: 'https://images.unsplash.com/photo-1532629391091-c247900b1713?q=80&w=2670&auto=format&fit=crop',
    summary: null,
    onlineMeetingLink: null,
    videoUrl: null,
    projectId: null,
    eventType: 'GENERAL',
    eventStatus: 'SCHEDULED',
    organizerId: '',
    companyId: null,
    audience: 'ALL',
    targetAcademicLevelIds: [],
    targetCourseIds: [],
    targetEducatorIds: [],
    targetStudentIds: [],
    targetDepartmentIds: [],
    targetParentIds: [],
    isRegistrationRequired: false,
    maxCapacity: null,
    isPaid: false,
    price: null,
    contactPerson: null,
    contactEmail: null,
    contactPhone: null,
    createdAt: null,
    updatedAt: null
  },
  {
    id: 'fb-event-2',
    title: 'Volunteer Appreciation Picnic',
    description: 'A day to celebrate and thank our incredible volunteers for their dedication and hard work throughout the year.',
    startDateTime: new Date(),
    endDateTime: new Date(),
    location: 'Community Gardens, CA',
    imageUrl: 'https://images.unsplash.com/photo-1518621736915-f3b160292723?q=80&w=2670&auto=format&fit=crop',
    summary: null,
    onlineMeetingLink: null,
    videoUrl: null,
    projectId: null,
    eventType: 'GENERAL',
    eventStatus: 'SCHEDULED',
    organizerId: '',
    companyId: null,
    audience: 'ALL',
    targetAcademicLevelIds: [],
    targetCourseIds: [],
    targetEducatorIds: [],
    targetStudentIds: [],
    targetDepartmentIds: [],
    targetParentIds: [],
    isRegistrationRequired: false,
    maxCapacity: null,
    isPaid: false,
    price: null,
    contactPerson: null,
    contactEmail: null,
    contactPhone: null,
    createdAt: null,
    updatedAt: null
  },
  {
    id: 'fb-event-3',
    title: 'Winter Coat Drive',
    description: 'Help us collect warm coats for children and families in need this winter season to ensure everyone stays warm.',
    startDateTime: new Date(),
    endDateTime: new Date(),
    location: 'Headquarters Lobby',
    imageUrl: 'https://images.unsplash.com/photo-1549429168-f9d936162391?q=80&w=2670&auto=format&fit=crop',
    summary: null,
    onlineMeetingLink: null,
    videoUrl: null,
    projectId: null,
    eventType: 'GENERAL',
    eventStatus: 'SCHEDULED',
    organizerId: '',
    companyId: null,
    audience: 'ALL',
    targetAcademicLevelIds: [],
    targetCourseIds: [],
    targetEducatorIds: [],
    targetStudentIds: [],
    targetDepartmentIds: [],
    targetParentIds: [],
    isRegistrationRequired: false,
    maxCapacity: null,
    isPaid: false,
    price: null,
    contactPerson: null,
    contactEmail: null,
    contactPhone: null,
    createdAt: null,
    updatedAt: null
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function EventsSection() {
  const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';
  const eventsToRender = storeFormData?.events && Array.isArray(storeFormData?.events) && storeFormData.events.length > 0
    ? storeFormData.events
    : fallbackEvents;
  const organizationSlug = storeFormData?.slug || 'non-profit';

  return (
    <section id="events" className="py-20 md:py-32 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: primaryColor }}>
            Get Involved
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight transition-colors">
            Upcoming Events
          </h2>
          <p className="mt-4 text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-light transition-colors">
            Join our community at an upcoming event and help us make a difference.
          </p>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {eventsToRender.slice(0, 3).map((evt) => {
            const formattedDate = formatEventDate(evt.startDateTime);
            return (
              <motion.div
                key={evt.id}
                variants={itemVariants}
                className="bg-white dark:bg-zinc-900/80 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Event Image Frame */}
                  <div className="relative h-52 w-full overflow-hidden border-b border-zinc-200/60 dark:border-zinc-800/60">
                    <Image
                      src={evt.imageUrl || "https://placehold.co/600x400/27272a/71717a?text=Event+Image"}
                      alt={evt.title || 'Event Image'}
                      loader={loader}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 brightness-95 dark:brightness-90 group-hover:brightness-100"
                    />
                    
                    {/* Floating Date Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800 rounded-xl px-3 py-2 flex flex-col items-center shadow-lg">
                      <span className="text-xs font-bold uppercase tracking-wider">{formattedDate.month}</span>
                      <span className="text-2xl font-black leading-none mt-0.5" style={{ color: primaryColor }}>
                        {formattedDate.day}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 md:p-8">
                    <h3 className="font-bold text-xl md:text-2xl mb-3 text-zinc-900 dark:text-zinc-100 leading-snug transition-colors">
                      {evt.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed line-clamp-3 mb-6 transition-colors">
                      {evt.description}
                    </p>
                    
                    <ul className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 space-y-2.5">
                      <li className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2.5 flex-shrink-0" style={{ color: primaryColor }} />
                        <span>{formattedDate.formattedTime}</span>
                      </li>
                      {evt.location && (
                        <li className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-2.5 flex-shrink-0" style={{ color: primaryColor }} />
                          <span className="truncate">{evt.location}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="p-6 md:p-8 pt-0">
                  <Link 
                    href={evt.id} 
                    onClick={(e) => { e.preventDefault(); mockRouterPush(evt.id); }} 
                    className="block w-full text-center px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all duration-300 transform group-hover:scale-[1.02] hover:opacity-95" 
                    style={{ backgroundColor: primaryColor }}
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Section Footer Action */}
        <div className="mt-16 text-center">
          <Link 
            href={`/${organizationSlug}/events`} 
            className="inline-flex items-center px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition duration-300 transform hover:scale-105 hover:opacity-95" 
            style={{ backgroundColor: primaryColor }}
          >
            View All Events
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>

      </div>
    </section>
  );
}