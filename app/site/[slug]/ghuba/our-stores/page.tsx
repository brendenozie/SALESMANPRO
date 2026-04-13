"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon, 
  MagnifyingGlassIcon,
  ChevronRightIcon,
  MapIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";

const locations = [
  {
    id: 1,
    name: "Ghuba Flagship - Westlands",
    address: "Sarit Centre, 2nd Floor, Nairobi",
    phone: "+254 700 000 000",
    hours: "09:00 AM - 08:00 PM",
    status: "Open Now",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Ghuba Hub - Karen",
    address: "The Hub Mall, Ground Floor, Dagoretti Rd",
    phone: "+254 711 111 111",
    hours: "10:00 AM - 07:00 PM",
    status: "Closing Soon",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Ghuba Express - Kilimani",
    address: "Yaya Centre, Argwings Kodhek Rd",
    phone: "+254 722 222 222",
    hours: "08:00 AM - 09:00 PM",
    status: "Open Now",
    image: "https://images.unsplash.com/photo-1534452203294-49c8ad1bc0df?auto=format&fit=crop&w=800&q=80",
  },
];

export default function GhubaStoresPage() {
  const [activeStore, setActiveStore] = useState(locations[0]);

  return (
    <main className="bg-[#fafafa] dark:bg-[#080808] min-h-screen pt-32 pb-20 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <section className="max-w-7xl mx-auto px-6">
        
        {/* --- HEADER & SEARCH --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
            >
              Visit <span className="text-indigo-500">Us.</span>
            </motion.h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-light">
              Experience the Ghuba quality in person. Touch the fabrics, test the tech, and meet our curators.
            </p>
          </div>

          <div className="relative group w-full md:w-96">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Find a store near you..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* --- INTERACTIVE STORE SELECTOR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* STORE LIST */}
          <div className="lg:col-span-5 space-y-4">
            {locations.map((store) => (
              <motion.div
                key={store.id}
                onClick={() => setActiveStore(store)}
                className={`p-6 rounded-[2rem] cursor-pointer transition-all duration-300 border ${
                  activeStore.id === store.id 
                    ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.02]" 
                    : "bg-transparent border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${store.status === 'Open Now' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{store.status}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{store.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{store.address}</p>
                    
                    <div className="flex items-center gap-4 text-xs font-medium opacity-60">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {store.hours}
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon className={`w-5 h-5 transition-transform ${activeStore.id === store.id ? "rotate-90 text-indigo-500" : "text-slate-300"}`} />
                </div>
              </motion.div>
            ))}

            <button className="w-full py-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
              <MapIcon className="w-5 h-5" />
              View All Locations on Map
            </button>
          </div>

          {/* STORE PREVIEW DISPLAY */}
          <div className="lg:col-span-7 sticky top-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStore.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <Image 
                  src={activeStore.image} 
                  alt={activeStore.name} 
                  fill 
                  className="object-cover"
                  loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}  
                />
                
                {/* Info Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-white text-4xl font-bold mb-4">{activeStore.name}</h2>
                    <div className="flex flex-wrap gap-6 text-white/80">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                        <MapPinIcon className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium">Get Directions</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                        <PhoneIcon className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium">{activeStore.phone}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>
    </main>
  );
}