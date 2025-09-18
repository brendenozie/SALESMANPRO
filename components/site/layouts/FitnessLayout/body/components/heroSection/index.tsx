"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  MapPinIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

// Placeholder data and types for a hypothetical fitness store
interface FitnessFilters {
  searchTerm?: string;
  program?: string;
  location?: string;
  goal?: string;
}

interface IStoreCategory {
  id: string;
  displayName: string;
}

interface ILocation {
  name: string;
  id: string;
}

interface IGoal {
  name: string;
  id: string;
}

interface HeroSlide {
  url: string;
  headline?: string;
  subline?: string;
  id?: string | number;
}

interface StoreForm {
  heroSlides?: HeroSlide[];
  programTypes?: IStoreCategory[];
  locations?: ILocation[];
  goals?: IGoal[];
}

interface Props {
  storeFormData?: StoreForm;
  onSearch: (filters: FitnessFilters) => void;
}

// Default data for demonstration if no props are provided
const defaultStoreFormData: StoreForm = {
  heroSlides: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b231b?q=80&w=2940&auto=format&fit=crop",
      headline: "Forge Your Strength",
      subline: "Discover personalized training and nutrition programs tailored for your goals.",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1549060156-f033066a3d90?q=80&w=2940&auto=format&fit=crop",
      headline: "Move with Purpose",
      subline: "Find the perfect class to challenge your body and uplift your spirit.",
    },
  ],
  programTypes: [
    { id: "yoga", displayName: "Yoga" },
    { id: "pilates", displayName: "Pilates" },
    { id: "crossfit", displayName: "CrossFit" },
    { id: "weightlifting", displayName: "Weightlifting" },
    { id: "cardio", displayName: "Cardio" },
    { id: "nutrition", displayName: "Nutrition Coaching" },
  ],
  locations: [
    { id: "nyc", name: "New York" },
    { id: "la", name: "Los Angeles" },
    { id: "chicago", name: "Chicago" },
    { id: "online", name: "Online Classes" },
  ],
  goals: [
    { id: "weight-loss", name: "Weight Loss" },
    { id: "muscle-gain", name: "Muscle Gain" },
    { id: "flexibility", name: "Flexibility" },
    { id: "stress-reduction", name: "Stress Reduction" },
    { id: "wellness", name: "Overall Wellness" },
  ],
};

// Framer Motion variants for a more dynamic feel
const bgVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? '100%' : '-100%',
    scale: 1.1,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.5 },
      scale: { duration: 0.5 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.5 },
      scale: { duration: 0.5 },
    },
  }),
};

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export default function HeroSection({ storeFormData = defaultStoreFormData, onSearch }: Props) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [filters, setFilters] = useState<FitnessFilters>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const heroSlides = storeFormData.heroSlides || defaultStoreFormData.heroSlides;
  const programTypes = storeFormData.programTypes || defaultStoreFormData.programTypes;
  const locations = storeFormData.locations || defaultStoreFormData.locations;
  const goals = storeFormData.goals || defaultStoreFormData.goals;

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
    setIsSearchModalOpen(false);
  };

  const handleSelect = (key: keyof FitnessFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Particle effect
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles: { x: number, y: number, vx: number, vy: number, size: number, opacity: number }[] = [];
    const particleCount = 20;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.5,
        });
      }
    };

    const animateParticles = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animateParticles);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    createParticles();
    animateParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Background Slideshow */}
      <AnimatePresence initial={false} custom={direction}>
        {heroSlides.map((slide, i) =>
          i === currentSlide ? (
            <motion.div
              key={slide.id ?? i}
              className="absolute inset-0 z-0"
              custom={direction}
              variants={bgVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <img
                src={"https://images.unsplash.com/photo-1549060156-f033066a3d90?q=80&w=2940&auto=format&fit=crop"}
                alt={slide.headline ?? "hero background"}
                className="object-cover w-full h-full"
              />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/70 z-10" />

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none opacity-50" />

      {/* Main Content */}
      <motion.div
        className="relative z-30 flex flex-col items-center justify-center h-full px-4 text-center text-white max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.h1
          className="mb-6 text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight drop-shadow-lg"
        >
          {heroSlides[currentSlide]?.headline ?? "Your Fitness Journey Starts Here"}
        </motion.h1>
        <motion.p
          className="mb-10 text-lg md:text-2xl max-w-3xl leading-relaxed text-gray-300 drop-shadow-md"
        >
          {heroSlides[currentSlide]?.subline ?? "Find programs, trainers, and gyms to reach your health goals."}
        </motion.p>
        
        <motion.button
          onClick={() => setIsSearchModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative px-12 py-5 text-lg font-semibold rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl transition-all duration-300 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 transition-transform duration-500 transform group-hover:scale-110 -z-1" />
          <MagnifyingGlassIcon className="w-6 h-6 mr-2 inline-block relative z-10" />
          <span className="relative z-10">Find My Program</span>
        </motion.button>
      </motion.div>
      
      {/* Slide Navigation */}
      <div className="absolute bottom-8 right-8 flex items-center gap-4 z-40">
        <button
          onClick={prevSlide}
          className="bg-white/10 text-white p-3 rounded-full shadow-lg hover:bg-white/20 transition-transform transform hover:-translate-x-1 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="bg-white/10 text-white p-3 rounded-full shadow-lg hover:bg-white/20 transition-transform transform hover:translate-x-1 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            onClick={() => setIsSearchModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-4xl bg-gray-900 rounded-3xl shadow-2xl p-8 m-4 relative border border-gray-700"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-800 transition"
                aria-label="Close search"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  What are you looking for?
                </h2>
                <p className="text-gray-400 mb-6">Filter by program type, location, and your personal goals.</p>
                
                {/* General Search Input */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                  <input
                    type="text"
                    aria-label="Search for programs, locations, or goals"
                    placeholder="Search for a program, location, or goal..."
                    value={filters.searchTerm || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-700 bg-gray-800 text-white placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                  />
                </div>
                
                {/* Program Pills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-purple-400" />
                    Program Type
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    {programTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleSelect('program', type.id)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-gray-700 ${
                          filters.program === type.id
                            ? "bg-purple-600 text-white shadow-lg"
                            : "bg-gray-800 text-gray-300 hover:bg-purple-800/20"
                        }`}
                      >
                        {type.displayName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Pills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2 text-indigo-400" />
                    Location
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    {locations.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelect('location', loc.id)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-gray-700 ${
                          filters.location === loc.id
                            ? "bg-indigo-600 text-white shadow-lg"
                            : "bg-gray-800 text-gray-300 hover:bg-indigo-800/20"
                        }`}
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal Pills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center">
                    <TrophyIcon className="w-5 h-5 mr-2 text-pink-400" />
                    Your Goal
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    {goals.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelect('goal', g.id)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-gray-700 ${
                          filters.goal === g.id
                            ? "bg-pink-600 text-white shadow-lg"
                            : "bg-gray-800 text-gray-300 hover:bg-pink-800/20"
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Search & Clear Buttons */}
                <div className="flex items-center justify-between pt-6">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-gray-400 hover:text-white font-medium text-sm transition-colors"
                  >
                    Clear filters
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2 inline-block" />
                    Search Now
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
