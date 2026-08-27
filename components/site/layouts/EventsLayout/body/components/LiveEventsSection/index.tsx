"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { IEvent, StoreForm } from "@/types/typings";
import { useStoreContext } from "@/contexts/StoreContext";
import EventCard from "../EventCard";

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
    imageUrl: "https://images.unsplash.com/photo-1508971344143-1c0b9a1d8c9e?auto=format&fit=crop&w=800&q=80",
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
    updatedAt: null,
    productCategoryId: null,
    category: null,
    subCategory: null,
    subCategoryName: null
  },
  {
    id: "sample2",
    title: "Sample Art Expo",
    description: "Explore contemporary art from local and international artists.",
    startDateTime: new Date("2025-09-10T10:00:00Z"),
    endDateTime: null,
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
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
    updatedAt: null,
    productCategoryId: null,
    category: null,
    subCategory: null,
    subCategoryName: null
  },
];

interface LiveEventsSectionProps {
  events?: IEvent[];
}

export default function LiveEventsSection({ events }: LiveEventsSectionProps) {
  
  // Derive upcoming events (with image & subtitle fields added if missing)
  const rawEvents = (events || []).map((e) => ({
    ...e,
    title: e.title || "Upcoming Event",
    subtitle: e.description || "",
    image: (e as any).bannerUrl || "https://images.unsplash.com/photo-1508971344143-1c0b9a1d8c9e?auto=format&fit=crop&w=800&q=80",
    location: (e as any).location || "",
  })) as typeof fallbackEvents;

  const eventsToShow = rawEvents.length > 0 ? rawEvents : fallbackEvents;

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
              <EventCard key={event.id} event={{ ...event, dateStr }} index={index} />
            );
          })}
        </div>
      </div>
    </section>
  );
}
