"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { IEvent, StoreForm } from "@/types/typings";
import { useStoreContext } from "@/contexts/StoreContext";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Two sample events if none are provided
const fallbackEvents: IEvent[] = [
  {
    id: "sample1",
    title: "Sample Music Fest",
    description: "Experience live bands and DJs at our annual music festival.",
    startDateTime: new Date("2025-08-15T18:00:00Z"),
    endDateTime: null,
    imageUrl: "/default-event-1.jpg",
    // subtitle: "Live music under the stars.",
    location: "Nairobi, Kenya",
    summary: null,
    onlineMeetingLink: null,
    videoUrl: null,
    projectId: null,
    eventType: "GENERAL",
    eventStatus: "SCHEDULED",
    organizerId: "",
    companyId: null,
    audience: "ALL",
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
    id: "sample2",
    title: "Sample Art Expo",
    description: "Explore contemporary art from local and international artists.",
    startDateTime: new Date("2025-09-10T10:00:00Z"),
    endDateTime: null,
    imageUrl: "/default-event-2.jpg",
    // subtitle: "Art, culture, and inspiration.",
    location: "Mombasa, Kenya",
    summary: null,
    onlineMeetingLink: null,
    videoUrl: null,
    projectId: null,
    eventType: "GENERAL",
    eventStatus: "SCHEDULED",
    organizerId: "",
    companyId: null,
    audience: "ALL",
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

export default function LiveEventsSection() {

  const { storeFormData } = useStoreContext() as { storeFormData : StoreForm };
  
  const store = storeFormData;
  
  // Derive upcoming events (with image & subtitle fields added if missing)
  const rawEvents = (store.events || []).map((e) => ({
    ...e,
    title: e.title || "Upcoming Event",
    subtitle: e.description || "",
    image: (e as any).bannerUrl || store.bannerUrl || "/images/placeholder-event.jpg",
    location: (e as any).location || "",
  })) as typeof fallbackEvents;

  const eventsToShow = rawEvents.length > 0 ? rawEvents : fallbackEvents;
  const slug = store.slug;

  return (
    <section id="events" className="relative bg-gray-950 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-center mb-16 text-white"
        >
          Featured{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Live Events
          </span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {eventsToShow.map((event, index) => {
            // Format date
            const dateStr = event.startDateTime
              ? new Date(event.startDateTime).toLocaleDateString("en-KE", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "";

            return (
              <motion.div
                key={event.id}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700 hover:border-indigo-500 transition-all duration-300 relative group"
              >
                <img
                  src={event.imageUrl || 'https://www.unsplush.com/'}
                  alt={event.title}
                  className="h-52 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                    {event.title}
                  </h3>
                  {dateStr && (
                    <p className="text-sm text-gray-400 mb-1 flex items-center">
                      <CalendarIcon className="inline w-5 h-5 mr-2 text-indigo-400" />
                      {dateStr}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-sm text-gray-400 mb-4 flex items-center">
                      <MapPinIcon className="inline w-5 h-5 mr-2 text-purple-400" />
                      {event.location}
                    </p>
                  )}
                  <p className="text-gray-300 mb-6 line-clamp-3">
                    {/* {event.subtitle} */}
                    {'Art, culture, and inspiration.'}
                  </p>
                  <a
                    href={`/${slug}/event/${event.id}`}
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    View Event
                    <ArrowRightIcon className="ml-2 w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
