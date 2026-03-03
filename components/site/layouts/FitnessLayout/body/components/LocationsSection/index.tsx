"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { MapPinIcon, StarIcon } from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { ICompanyLocation } from "@/types/typings";
import Image from "next/image";

// Horizontal Scroll Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
  },
};

const LocationItem = ({ id, name, image, programs, rating, description, index }: any) => (
  <motion.a
    href={`/locations/${id}`}
    variants={cardVariants}
    className="group relative flex-shrink-0 w-[85vw] md:w-[450px] h-[600px] rounded-[3rem] overflow-hidden bg-[#111] snap-center"
  >
    {/* Background Image */}
    <Image
      src={image}
      alt={name}
      loader={({ src }) => src}
      fill
      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
    />
    
    {/* Dark Glass Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />

    {/* Top Info */}
    <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
      <div className="flex flex-col">
        <span className="text-orange-500 font-black text-4xl italic tracking-tighter leading-none">
          0{index + 1}
        </span>
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-1">
          Location ID: {id.slice(-4)}
        </span>
      </div>
      <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10 group-hover:bg-orange-500 group-hover:text-black transition-all duration-300">
        <ArrowUpRightIcon className="w-5 h-5 text-white group-hover:text-black" />
      </div>
    </div>

    {/* Bottom Content */}
    <div className="absolute bottom-10 left-8 right-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
           <div className="flex items-center px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
              <StarIcon className="w-3 h-3 text-orange-500 mr-1 fill-orange-500" />
              <span className="text-[10px] font-black text-white">{rating.toFixed(1)}</span>
           </div>
           <div className="px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
             {programs} Programs
           </div>
        </div>

        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">
          {name.split(" ").map((word: string, i: number) => (
            <span key={i} className="block">{word}</span>
          ))}
        </h3>
        
        <p className="text-gray-400 text-sm font-medium line-clamp-2 max-w-[80%]">
          {description}
        </p>

        <div className="flex items-center space-x-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <MapPinIcon className="w-4 h-4 text-orange-500" />
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">View Studio Details</span>
        </div>
      </div>
    </div>
  </motion.a>
);

const dummyLocations = [
  {
    id: "loc1",
    name: "Urban Core Fitness",
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2670&auto=format&fit=crop",
    programs: 45,
    rating: 4.8,
    description: "Cutting-edge equipment and dynamic group classes in the city center.",
  },
  {
    id: "loc2",
    name: "Zenith Yoga Wellness",
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=2670&auto=format&fit=crop",
    programs: 30,
    rating: 4.9,
    description: "A serene sanctuary for mind, body, and soul. Perfect for mindfulness.",
  },
  {
    id: "loc3",
    name: "The Boxing Den",
    image: "https://images.unsplash.com/photo-1591117207239-7ad59a0a79b9?q=80&w=2670&auto=format&fit=crop",
    programs: 20,
    rating: 4.7,
    description: "Unleash your inner fighter with high-energy boxing and HIIT sessions.",
  },
];

export default function LocationsSection() {
  const { storeFormData } = useStoreContext();
  const { CompanyLocation = [] } = storeFormData || {};

  const normalizedLocations = CompanyLocation?.length > 0
      ? CompanyLocation.map((cl: ICompanyLocation, i: number) => ({
          id: cl.id,
          name: cl.displayName || cl.location?.name || "Unnamed Location",
          image: cl.location?.imageUrl || dummyLocations[i % 3].image,
          programs: Math.floor(Math.random() * 50) + 10,
          rating: 4.5 + Math.random() * 0.5,
          description: cl.addressLine1Override || cl.location?.description || dummyLocations[i % 3].description,
        }))
      : dummyLocations;

  return (
    <section className="py-32 bg-[#050505] overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-orange-500 font-black tracking-[0.4em] uppercase text-xs"
            >
              Elite Footprint
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8]"
            >
              Our Global <br /> <span className="text-white/10">Studios</span>
            </motion.h2>
          </div>
          
          <div className="hidden md:block h-[1px] flex-1 bg-white/10 mx-12 mb-4" />

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-[300px] text-gray-500 font-medium text-sm leading-relaxed uppercase tracking-tight"
          >
            Access our premium facilities across the globe with a single membership. 
          </motion.p>
        </div>
      </div>

      {/* Horizontal Scroll Gallery */}
      <motion.div
        className="flex space-x-8 px-6 md:px-[calc((100vw-1280px)/2)] overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {normalizedLocations.map((loc, index) => (
          <LocationItem key={loc.id} {...loc} index={index} />
        ))}
        {/* Spacer for horizontal scroll padding */}
        <div className="flex-shrink-0 w-10 h-10" />
      </motion.div>

      {/* Control Hint */}
      <div className="mt-12 flex justify-center space-x-4 items-center">
        <div className="h-[2px] w-20 bg-orange-500" />
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Scroll To Explore</span>
        <div className="h-[2px] w-20 bg-white/10" />
      </div>
    </section>
  );
}