"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { 
  StarIcon, 
  CubeIcon, 
  ChatBubbleBottomCenterTextIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon 
} from "@heroicons/react/24/solid";
import { Testimonial } from "@/types/typings";
import { EditableElement, useEditableContent } from "@/contexts/EditableContentContext";

interface Props {
  testimonials: Testimonial[];
}

const customLoader = ({ src, width, quality }: any) => {
  if (src.startsWith('/')) return src; 
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for the slide transition
const itemVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

export default function Testimonials({ testimonials }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const { isEditorMode, isPreviewMode } = useEditableContent();
  const isLiveEditor = isEditorMode && !isPreviewMode;

  // Fallback data if none provided
  const data = testimonials?.length > 0 ? testimonials : [
    {
      id: "1",
      quote: "The precision in their logistics is unmatched. They don't just deliver packages; they deliver peace of mind.",
      authorName: "Kimani Ndegwa",
      authorTitle: "Logistics Coordinator",
      avatarUrl: "/avatar1.jpeg",
      rating: 5
    },
    {
      id: "2",
      quote: "Outstanding service! Their team went above and beyond to ensure our international freight arrived ahead of schedule.",
      authorName: "Timothy Kimathi",
      authorTitle: "Supply Manager",
      avatarUrl: "/avatar2.jpeg",
      rating: 5
    }
  ];

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + data.length) % data.length);
  };

  return (
    <section className="relative bg-slate-50 overflow-hidden py-24 lg:py-32">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white skew-x-12 translate-x-1/2 z-0" />
      <div className="absolute -left-10 top-20 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Editor Slide Switcher Toolbar */}
        {isLiveEditor && (
          <div className="mb-6 flex flex-wrap items-center gap-2 p-3 bg-slate-900/90 text-white rounded-xl border border-slate-700 text-xs z-30">
            <span className="font-bold text-[#f7941d] uppercase tracking-wider text-[10px]">Edit Slide:</span>
            {data.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDirection(idx > current ? 1 : -1);
                  setCurrent(idx);
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                  current === idx
                    ? "bg-[#f7941d] text-white shadow-md scale-105"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                #{idx + 1}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Side: Impact Visual */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative h-[500px] lg:h-[650px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <EditableElement
                targetId="delivery.home.testimonials.visualImage"
                componentKey="TestimonialsCarouselSection"
                elementKey="visualImage"
                label="Impact Visual Image"
                defaultValue="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                type="image"
              >
                {(val) => (
                  <Image decoding="async" 
                    src={val || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                    alt="Our Clients" 
                    className="w-full h-full object-cover"
                    fill
                  />
                )}
              </EditableElement>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Floating Experience Card */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -right-6 md:right-10 bg-[#f7941d] p-8 rounded-2xl text-white shadow-2xl border-4 border-white max-w-[200px] z-20"
            >
              <EditableElement
                targetId="delivery.home.testimonials.statValue"
                componentKey="TestimonialsCarouselSection"
                elementKey="statValue"
                label="Stat Value"
                defaultValue="98%"
                type="text"
              >
                {(val) => (
                  <h3 className="text-4xl font-black mb-1">{val || "98%"}</h3>
                )}
              </EditableElement>
              <EditableElement
                targetId="delivery.home.testimonials.statLabel"
                componentKey="TestimonialsCarouselSection"
                elementKey="statLabel"
                label="Stat Label"
                defaultValue="Customer Satisfaction Rate Globally"
                type="text"
              >
                {(val) => (
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                    {val || "Customer Satisfaction Rate Globally"}
                  </p>
                )}
              </EditableElement>
            </motion.div>
          </div>

          {/* Right Side: Header & Dynamic Testimonial */}
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-[#f7941d]"
              >
                <CubeIcon className="w-4 h-4" />
                <EditableElement
                  targetId="delivery.home.testimonials.badge"
                  componentKey="TestimonialsCarouselSection"
                  elementKey="badge"
                  label="Badge Text"
                  defaultValue="Voice of Clients"
                  type="text"
                >
                  {(val) => (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      {val || "Voice of Clients"}
                    </span>
                  )}
                </EditableElement>
              </motion.div>
              
              <EditableElement
                targetId="delivery.home.testimonials.title"
                componentKey="TestimonialsCarouselSection"
                elementKey="title"
                label="Section Title"
                defaultValue="Trust is Our Global Currency"
                type="text"
              >
                {(val) => (
                  <h2 className="text-4xl md:text-6xl font-black text-slate-950 leading-[1.1] uppercase italic">
                    {val || (
                      <>
                        Trust is Our <br />
                        <span className="text-transparent" style={{ WebkitTextStroke: '1px #0f172a' }}>Global Currency</span>
                      </>
                    )}
                  </h2>
                )}
              </EditableElement>
            </div>

            {/* Carousel Container */}
            <div className="relative min-h-[300px] flex items-center">
              <ChatBubbleBottomCenterTextIcon className="absolute -top-10 -right-4 w-24 h-24 text-slate-200 -z-10 opacity-50" />
              
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={itemVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full"
                >
                  <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`w-5 h-5 ${i < (data[current].rating || 5) ? "text-[#f7941d]" : "text-slate-200"}`} 
                          />
                        ))}
                      </div>

                      <EditableElement
                        targetId={`delivery.home.testimonials.items.${current}.quote`}
                        componentKey="TestimonialsCarouselSection"
                        elementKey={`items.${current}.quote`}
                        label="Client Quote"
                        defaultValue={data[current].quote}
                        type="textarea"
                      >
                        {(val) => (
                          <p className="text-slate-700 text-lg md:text-xl leading-relaxed font-medium italic">
                            &quot;{val || data[current].quote}&quot;
                          </p>
                        )}
                      </EditableElement>

                      <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-orange-50">
                          <EditableElement
                            targetId={`delivery.home.testimonials.items.${current}.avatarUrl`}
                            componentKey="TestimonialsCarouselSection"
                            elementKey={`items.${current}.avatarUrl`}
                            label="Client Avatar"
                            defaultValue={data[current].avatarUrl || "https://unsplash.com/photos/mEZ3PoFGs_k/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fA%3D%3D&force=true&w=640"}
                            type="image"
                          >
                            {(val) => (
                              <Image decoding="async" 
                                src={val || data[current].avatarUrl || "https://unsplash.com/photos/mEZ3PoFGs_k/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fA%3D%3D&force=true&w=640"} 
                                alt={data[current].authorName || "Client Avatar"} 
                                fill
                                className="object-cover" 
                              />
                            )}
                          </EditableElement>
                        </div>
                        <div>
                          <EditableElement
                            targetId={`delivery.home.testimonials.items.${current}.authorName`}
                            componentKey="TestimonialsCarouselSection"
                            elementKey={`items.${current}.authorName`}
                            label="Author Name"
                            defaultValue={data[current].authorName}
                            type="text"
                          >
                            {(val) => (
                              <h5 className="font-black text-slate-950 text-base tracking-tight">{val || data[current].authorName}</h5>
                            )}
                          </EditableElement>
                          <EditableElement
                            targetId={`delivery.home.testimonials.items.${current}.authorTitle`}
                            componentKey="TestimonialsCarouselSection"
                            elementKey={`items.${current}.authorTitle`}
                            label="Author Title"
                            defaultValue={data[current].authorTitle}
                            type="text"
                          >
                            {(val) => (
                              <p className="text-xs font-bold text-[#f7941d] uppercase tracking-widest">{val || data[current].authorTitle}</p>
                            )}
                          </EditableElement>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-8">
              <div className="flex gap-4">
                <button 
                  onClick={() => paginate(-1)}
                  className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all group"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => paginate(1)}
                  className="w-12 h-12 rounded-full bg-slate-950 text-white flex items-center justify-center hover:bg-[#f7941d] transition-all"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex gap-2">
                 {data.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? "w-8 bg-[#f7941d]" : "w-2 bg-slate-200"}`}
                    />
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}