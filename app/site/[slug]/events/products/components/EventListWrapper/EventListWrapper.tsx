'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterSidebar from '../FilterSidebar/FilterSidebar';
import { AdjustmentsHorizontalIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import EventCard from '@/components/site/layouts/EventsLayout/body/components/EventCard';

export interface EventFilterState {
  search: string;
  category: string | null;
  sort: string; // e.g., 'date-asc', 'date-desc', 'popular'
  minPrice: number; // For paid vs free ticket filtering
  maxPrice: number;
  status: 'all' | 'upcoming' | 'live' | 'past';
  dateRange: string | null; // e.g., 'this-week', 'this-month'
}

export default function EventListWrapper({ events = [], categories = [] }: any) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filter state from URL parameters tailored for events
  const getInitialFilters = (): EventFilterState => {
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '500');
    return {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || null,
      sort: searchParams.get('sort') || 'date-asc', // Default to showing soonest events first
      minPrice: isNaN(minPrice) ? 0 : minPrice,
      maxPrice: isNaN(maxPrice) ? 500 : maxPrice,
      status: (searchParams.get('status') as any) || 'upcoming', // Default to upcoming events
      dateRange: searchParams.get('dateRange') || null,
    };
  };

  const [filters, setFilters] = useState<EventFilterState>(getInitialFilters);

  // Sync state back to the URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.sort !== 'date-asc') params.set('sort', filters.sort);
    if (filters.minPrice !== 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== 500) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.status !== 'upcoming') params.set('status', filters.status);
    if (filters.dateRange) params.set('dateRange', filters.dateRange);

    router.push(`?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Desktop Sidebar: Floating Glass Card for Event Filtering */}
        <aside className="hidden lg:block w-[320px] sticky top-28 h-fit">
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <CalendarIcon className="w-5 h-5 text-zinc-500" />
              <h2 className="font-bold text-zinc-900 dark:text-white">Filter Schedule</h2>
            </div>
            <FilterSidebar filters={filters} setFilters={setFilters} categories={categories} />
          </div>
        </aside>

        <main className="flex-1 space-y-8">
          {/* Header Action Bar */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-emerald-500 uppercase">
                Live & Upcoming Experiences
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white uppercase mt-1">
                The Event Directory
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">
                Discover masterclasses, summits, and meetups. {events.length} events matching your view.
              </p>
            </div>

            {/* Mobile Filter Toggle Button */}
            <div className="flex items-center gap-3 lg:hidden">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-widest transition-transform active:scale-95"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Filter Schedule
              </button>
            </div>
          </header>

          {/* Events Grid layout (optimized for wider Event cards vs squarish product cards) */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {events.map((event: any, index: number) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.2 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Empty State when zero results are found */}
            {events.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <p className="text-zinc-400 font-medium">No events found matching your filter combinations.</p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Mobile Filter Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 bg-white dark:bg-zinc-950 z-[110] rounded-t-[32px] p-8 max-h-[85vh] overflow-y-auto lg:hidden"
            >
              <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6" />
              <FilterSidebar filters={filters} setFilters={setFilters} categories={categories} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}