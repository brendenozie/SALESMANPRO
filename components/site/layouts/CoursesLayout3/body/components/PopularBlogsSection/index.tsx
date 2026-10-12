"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  ArrowRightIcon, 
  ChevronRightIcon, 
  MapPinIcon 
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { EditableElement } from '@/components/site/EditableElement';

const formatDate = (input: string | Date) => {
  try {
    const date = typeof input === 'string' ? new Date(input) : input;
    if (isNaN(date.getTime())) return "Date N/A";
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch (error) {
    return "Date N/A";
  }
};

const getDayAndMonth = (input: string | Date) => {
  try {
    const date = typeof input === 'string' ? new Date(input) : input;
    if (isNaN(date.getTime())) return { day: '00', month: 'MAR' };
    return {
      day: date.toLocaleDateString('en-US', { day: '2-digit' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    };
  } catch (error) {
    return { day: '00', month: 'MAR' };
  }
};

export default function LatestEventsSection({ storeFormData: propStoreFormData }: { storeFormData?: any }) {
  const contextStore = useStoreContext();
  const storeFormData = propStoreFormData || contextStore?.storeFormData;

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  const eventsToRender = storeFormData?.events?.length > 0 
    ? storeFormData.events 
    : [
        { id: '1', title: "The Future of AI in Education Summit", eventDate: "2026-04-15", description: "A comprehensive summit exploring the transformative impact of artificial intelligence on modern education.", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670" },
        { id: '2', title: "Global Climate Conference", eventDate: "2026-05-01", imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670" },
        { id: '3', title: "Blockchain for Beginners", eventDate: "2026-05-12", imageUrl: "https://images.unsplash.com/photo-1618044737194-09439600989f?q=80&w=2670" },
      ];

  const mainEvent = eventsToRender[0];
  const sideEvents = eventsToRender.slice(1, 4);

  return (
    <section className="bg-white dark:bg-gray-950 py-24 px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <EditableElement targetId="courses3.home.blogs.title" fieldType="text" label="Events Title">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                Upcoming <span style={{ color: primaryColor }}>Events</span>
              </h2>
            </EditableElement>
            <EditableElement targetId="courses3.home.blogs.description" fieldType="textarea" label="Events Description">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Connect, learn, and grow with our community of experts and peers.
              </p>
            </EditableElement>
          </motion.div>
          
          <EditableElement targetId="courses3.home.blogs.calendarLink" fieldType="text" label="Calendar Link Text">
            <motion.a
              href="/events"
              className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: primaryColor }}
            >
              Full Calendar
              <ChevronRightIcon className="w-5 h-5" />
            </motion.a>
          </EditableElement>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* 1. Main Featured Event (The "Hero" Card) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 group relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-900 aspect-[16/10] md:aspect-auto md:h-[600px]"
          >
            <EditableElement targetId="courses3.home.blogs.event0.imageUrl" fieldType="image" label="Main Event Image">
              <Image decoding="async"
                src={mainEvent.imageUrl}
                alt={mainEvent.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
            </EditableElement>
            
            {/* High-Contrast Date Badge */}
            <div className="absolute top-8 left-8 z-20 pointer-events-none">
              <div className="bg-white rounded-2xl p-4 shadow-2xl text-center min-w-[80px]">
                <p className="text-3xl font-black text-gray-900 leading-none">{getDayAndMonth(mainEvent.eventDate).day}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{getDayAndMonth(mainEvent.eventDate).month}</p>
              </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
              <motion.div 
                className="max-w-xl"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-wrap gap-4 mb-4">
                  <span className="flex items-center gap-1.5 text-white/80 text-sm font-medium backdrop-blur-md bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    <ClockIcon className="w-4 h-4" style={{ color: accentColor }} /> 10:00 AM
                  </span>
                  <span className="flex items-center gap-1.5 text-white/80 text-sm font-medium backdrop-blur-md bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    <MapPinIcon className="w-4 h-4" style={{ color: accentColor }} /> Main Campus
                  </span>
                </div>
                
                <EditableElement targetId="courses3.home.blogs.event0.title" fieldType="text" label="Main Event Title">
                  <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight group-hover:text-primary-400 transition-colors">
                    {mainEvent.title}
                  </h3>
                </EditableElement>
                
                <EditableElement targetId="courses3.home.blogs.event0.description" fieldType="textarea" label="Main Event Description">
                  <p className="text-gray-300 text-lg mb-8 line-clamp-2">
                    {mainEvent.description}
                  </p>
                </EditableElement>
                
                <EditableElement targetId="courses3.home.blogs.event0.ctaButton" fieldType="text" label="Main Event Button">
                  <motion.a 
                    href={`/events/${mainEvent.id}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold transition-all shadow-xl"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Secure Your Spot
                    <ArrowRightIcon className="w-5 h-5" />
                  </motion.a>
                </EditableElement>
              </motion.div>
            </div>
          </motion.div>

          {/* 2. Side Events List */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {sideEvents.map((event: any, idx: number) => (
              <motion.a
                key={event.id || idx}
                href={`/events/${event.id}`}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex gap-5 p-5 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <EditableElement targetId={`courses3.home.blogs.event${idx + 1}.imageUrl`} fieldType="image" label={`Side Event ${idx + 1} Image`}>
                    <Image decoding="async"
                      src={event.imageUrl || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2670"}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </EditableElement>
                </div>
                
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: primaryColor }}>
                    {formatDate(event.eventDate)}
                  </p>
                  <EditableElement targetId={`courses3.home.blogs.event${idx + 1}.title`} fieldType="text" label={`Side Event ${idx + 1} Title`}>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2">
                      {event.title}
                    </h4>
                  </EditableElement>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span>View Schedule</span>
                  </div>
                </div>
              </motion.a>
            ))}
            
            {/* Promotional Mini-Card */}
            <div 
              className="mt-auto p-8 rounded-[2rem] text-white flex flex-col items-start gap-4"
              style={{ backgroundColor: `${primaryColor}10`, border: `1px dashed ${primaryColor}` }}
            >
              <EditableElement targetId="courses3.home.blogs.promoTitle" fieldType="text" label="Promo Box Title">
                <h5 className="text-xl font-black" style={{ color: primaryColor }}>Host your own event?</h5>
              </EditableElement>
              <EditableElement targetId="courses3.home.blogs.promoDescription" fieldType="textarea" label="Promo Box Description">
                <p className="text-sm text-gray-500 dark:text-gray-400">Our campus facilities are available for educational workshops and community gatherings.</p>
              </EditableElement>
              <EditableElement targetId="courses3.home.blogs.promoButton" fieldType="text" label="Promo Button">
                <button type="button" className="text-sm font-bold underline" style={{ color: primaryColor }}>Inquire Now</button>
              </EditableElement>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}