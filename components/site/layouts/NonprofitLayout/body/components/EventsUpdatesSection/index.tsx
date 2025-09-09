// components/EventsSection.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CalendarDaysIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
import { useStoreContext } from '@/contexts/StoreContext';
import { IEvent } from '@/types/typings';

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper function for date formatting
const formatEventDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.toLocaleDateString('en-US', { day: 'numeric' }),
      year: date.toLocaleDateString('en-US', { year: 'numeric' }),
    };
  } catch (error) {
    return { month: 'N/A', day: 'N/A', year: 'N/A' };
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
    eventDate: '2025-08-10T08:00:00Z',
    eventTime: '8:00 AM',
    location: 'Central Park, NYC',
    imageUrl: 'https://images.unsplash.com/photo-1532629391091-c247900b1713?q=80&w=2670&auto=format&fit=crop',
    link: '#',
    order: 1,
  },
  {
    id: 'fb-event-2',
    title: 'Volunteer Appreciation Picnic',
    description: 'A day to celebrate and thank our incredible volunteers for their dedication and hard work throughout the year.',
    eventDate: '2025-09-01T12:00:00Z',
    eventTime: '12:00 PM',
    location: 'Community Gardens, CA',
    imageUrl: 'https://images.unsplash.com/photo-1518621736915-f3b160292723?q=80&w=2670&auto=format&fit=crop',
    link: '#',
    order: 2,
  },
  {
    id: 'fb-event-3',
    title: 'Winter Coat Drive',
    description: 'Help us collect warm coats for children and families in need this winter season to ensure everyone stays warm.',
    eventDate: '2025-10-20T09:00:00Z',
    eventTime: '9:00 AM - 4:00 PM',
    location: 'Headquarters Lobby',
    imageUrl: 'https://images.unsplash.com/photo-1549429168-f9d936162391?q=80&w=2670&auto=format&fit=crop',
    link: '#',
    order: 3,
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
  const eventsToRender = Array.isArray(storeFormData?.events) && storeFormData.events.length > 0
    ? storeFormData.events//.sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackEvents;
  const organizationSlug = storeFormData?.slug || 'non-profit';

  return (
    <section id="events" className="py-20 md:py-32 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest font-semibold mb-2" style={{ color: primaryColor }}>Get Involved</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Upcoming Events
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Join our community at an upcoming event and help us make a difference.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {eventsToRender.slice(0, 3).map((evt) => {
            const formattedDate = formatEventDate(evt.eventDate);
            return (
              <motion.div
                key={evt.id}
                variants={itemVariants}
                className="bg-white rounded-3xl shadow-xl overflow-hidden group transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={evt.imageUrl || "https://placehold.co/128x128/D1D5DB/4B5563?text=Event+Image"}
                    alt={evt.title || 'IEvent Image'}
                    loader={loader}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 rounded-lg p-2 flex flex-col items-center shadow-lg">
                    <span className="text-sm font-semibold uppercase">{formattedDate.month}</span>
                    <span className="text-2xl font-extrabold" style={{ color: primaryColor }}>{formattedDate.day}</span>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <h3 className="font-bold text-xl md:text-2xl mb-2 text-gray-900 leading-snug group-hover:text-blue-600 transition-colors" 
                  // style={{ '--tw-hover-text-color': primaryColor }}
                  >
                    {evt.title}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base line-clamp-3 mb-4">{evt.description}</p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center">
                      <ClockIcon className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
                      <span>{evt.eventTime}</span>
                    </li>
                    {evt.location && (
                      <li className="flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
                        <span>{evt.location}</span>
                      </li>
                    )}
                  </ul>
                  <Link href={evt.link} onClick={(e) => { e.preventDefault(); mockRouterPush(evt.link); }} className="mt-6 block w-full text-center px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-transform duration-300 transform group-hover:scale-105" style={{ backgroundColor: primaryColor }}>
                    Learn More
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-16 text-center">
          <Link href={`/${organizationSlug}/events`} className="inline-flex items-center px-8 py-3 rounded-full font-semibold text-white shadow-lg transition duration-300 transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
            View All Events
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}