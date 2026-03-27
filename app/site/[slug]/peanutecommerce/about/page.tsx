"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  FireIcon, 
  HandRaisedIcon, 
  SparklesIcon, 
  GiftIcon,
  ShoppingBagIcon,
  ChevronRightIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

export default function PeanutsCraftsmanshipPage() {
  const [selectedNuts, setSelectedNuts] = useState<string[]>([]);
  const nutOptions = [
    { id: "1", name: "Dry Roasted", price: "KSh 450", img: "https://images.unsplash.com/photo-1567333160914-1b0aee708baf?auto=format&fit=crop&w=300&q=80" },
    { id: "2", name: "Chili Spiced", price: "KSh 500", img: "https://images.unsplash.com/photo-1599590984717-320e895744f4?auto=format&fit=crop&w=300&q=80" },
    { id: "3", name: "Honey Glazed", price: "KSh 550", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80" },
    { id: "4", name: "Salted Caramel", price: "KSh 600", img: "https://images.unsplash.com/photo-1536620453970-1bcc52226848?auto=format&fit=crop&w=300&q=80" },
  ];

  const toggleNut = (name: string) => {
    if (selectedNuts.includes(name)) {
      setSelectedNuts(selectedNuts.filter(n => n !== name));
    } else if (selectedNuts.length < 3) {
      setSelectedNuts([...selectedNuts, name]);
    }
  };

  return (
    <main className="bg-[#fcfaf7] min-h-screen pt-32 pb-24 text-stone-900 overflow-hidden">
      
      {/* 1. THE ROASTING PROCESS SECTION */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 mb-8 border border-amber-200">
              <FireIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Small Batch Mastery</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              The Art of <br />
              <span className="text-amber-800 italic font-serif font-light">The Toasted Crunch.</span>
            </h1>
            
            <p className="text-xl text-stone-500 font-medium leading-relaxed max-w-lg mb-12">
              We don't use industrial flash-roasters. We believe in the "Slow-Turn"—a traditional method that ensures the heat penetrates the heart of every kernel without burning the skin.
            </p>

            <div className="space-y-12">
               <ProcessStep icon={<HandRaisedIcon/>} title="The Hand Sort" desc="Every nut is inspected for size and quality. Only the largest, blemish-free Baringo peanuts make the cut." />
               <ProcessStep icon={<FireIcon/>} title="The Toasted Heart" desc="Roasted at exactly 165°C in small 5kg batches for a uniform, golden-brown finish." />
               <ProcessStep icon={<SparklesIcon/>} title="The Fresh Seal" desc="Packed within 1 hour of roasting to lock in the aromatic oils that define our signature taste." />
            </div>
          </motion.div>

          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl border-[20px] border-white"
            >
              <Image 
                src="https://images.unsplash.com/photo-1534119414819-38379628971c?auto=format&fit=crop&w=1200&q=80" 
                alt="Peanuts Roasting" fill className="object-cover" loader={imageLoader}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. THE GIFT BOX BUILDER (Interactive Section) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-stone-900 rounded-[4rem] p-8 md:p-20 text-white relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-16 relative z-10">
            
            {/* Selection Area */}
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">The Custom <br /> <span className="text-amber-500 font-serif italic font-light">Assortment Box</span></h2>
              <p className="text-stone-400 mb-10 font-medium">Select up to 3 flavors to create your perfect personalized gift set.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {nutOptions.map((nut) => (
                  <button 
                    key={nut.id}
                    onClick={() => toggleNut(nut.name)}
                    className={`p-6 rounded-3xl text-left transition-all border-2 ${selectedNuts.includes(nut.name) ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden mb-4">
                       <Image src={nut.img} alt={nut.name} fill className="object-cover" loader={imageLoader} />
                    </div>
                    <p className="font-black text-sm">{nut.name}</p>
                    <p className="text-[10px] text-stone-500 font-bold uppercase">{nut.price}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Box Preview */}
            <div className="w-full lg:w-[400px] flex flex-col items-center">
               <div className="w-full aspect-square bg-white rounded-[3rem] p-10 flex flex-col justify-center gap-4 shadow-2xl shadow-black relative group">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Peanuts Duka</div>
                  
                  {selectedNuts.length === 0 ? (
                    <div className="text-center text-stone-300 italic py-20 border-2 border-dashed border-stone-100 rounded-2xl">
                       <GiftIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                       <p className="text-xs">Add flavors to fill your box</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {selectedNuts.map((nut, i) => (
                          <motion.div 
                            key={nut}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-stone-50 p-4 rounded-2xl flex items-center justify-between"
                          >
                             <span className="text-stone-800 font-bold text-sm">{nut}</span>
                             <XMarkIcon className="w-4 h-4 text-stone-300 cursor-pointer" onClick={() => toggleNut(nut)} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col items-center">
                    <div className="h-px w-full bg-stone-100 mb-6" />
                    <button className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedNuts.length > 0 ? 'bg-stone-900 text-white shadow-xl' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}>
                      {selectedNuts.length === 0 ? 'Select Flavors' : `Add to Cart — KSh ${selectedNuts.length * 500}`}
                    </button>
                  </div>
               </div>
               <p className="mt-8 text-stone-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                 <ShoppingBagIcon className="w-4 h-4 text-amber-500" />
                 Premium Gift Packaging Included
               </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProcessStep({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="w-14 h-14 rounded-2xl bg-white border border-stone-100 shadow-sm flex items-center justify-center text-amber-800 shrink-0 group-hover:bg-amber-800 group-hover:text-white transition-all duration-500">
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
      </div>
      <div>
        <h3 className="text-xl font-black mb-2 tracking-tight uppercase">{title}</h3>
        <p className="text-sm text-stone-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}