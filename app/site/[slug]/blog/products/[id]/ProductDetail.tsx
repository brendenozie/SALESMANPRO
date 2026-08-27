/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  HandThumbUpIcon, 
  ShareIcon, 
  BookmarkIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import ProductCard from '@/components/site/layouts/EcommerceLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';

const loader = ({ src }: { src: string }) => src;

export function BlogDetail({ product, related }: { product: MarketListingForm; related: MarketListingForm[] }) {
  const [readingMode, setReadingMode] = useState<'serif' | 'sans'>('sans');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className={`min-h-screen transition-colors duration-700 ${readingMode === 'serif' ? 'font-serif' : 'font-sans'} bg-white dark:bg-[#050505]`}>
      {/* --- READING PROGRESS BAR --- */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-blue-600 z-[100] origin-left" style={{ scaleX }} />

      {/* --- HERO SECTION: FULL IMMERSION --- */}
      <section className="relative w-full h-[70vh] lg:h-[85vh] overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={product.images[0]?.url || product.images[0] || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80'}
            alt={product.name}
            loader={loader}
            fill
            className="object-cover brightness-75 dark:brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#050505] via-transparent to-transparent" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-end px-6 lg:px-20 pb-20 max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Insights</span>
              <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                <CalendarIcon className="w-4 h-4" /> March 29, 2026
              </div>
            </div>
            <h1 className="text-5xl lg:text-8xl font-light tracking-tighter text-zinc-900 dark:text-white leading-[0.95] mb-8 italic">
              {product.name}
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden relative">
                  <Image src="https://ui-avatars.com/api/?name=Brenden+Odhiambo&background=0D8ABC&color=fff" alt="Author" fill loader={loader} />
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">Brenden Odhiambo</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Lead Strategist</p>
                </div>
              </div>
              <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <ClockIcon className="w-4 h-4" /> 8 min read
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 py-20 flex flex-col lg:flex-row gap-20 relative">
        
        {/* LEFT: FLOATING SOCIAL/PROGRESS (Desktop) */}
        <aside className="hidden lg:flex flex-col gap-8 sticky top-32 h-fit">
          <button className="p-4 rounded-full border border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group">
            <HandThumbUpIcon className="w-6 h-6 text-zinc-400 group-hover:text-blue-500" />
          </button>
          <button className="p-4 rounded-full border border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
          </button>
          <button className="p-4 rounded-full border border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group">
            <BookmarkIcon className="w-6 h-6 text-zinc-400 group-hover:text-orange-500" />
          </button>
          <div className="h-20 w-px bg-zinc-100 dark:bg-zinc-900 mx-auto" />
          <button className="p-4 rounded-full border border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group">
            <ShareIcon className="w-6 h-6 text-zinc-400 group-hover:text-emerald-500" />
          </button>
        </aside>

        {/* CENTER: THE ARTICLE BODY */}
        <article className="flex-1">
          <div className={`prose prose-zinc dark:prose-invert max-w-none transition-all duration-300 ${fontSize === 'large' ? 'prose-lg lg:prose-xl' : 'prose-base'}`}>
            <p className="lead text-xl lg:text-2xl text-zinc-500 dark:text-zinc-400 leading-relaxed italic mb-12">
              Explore the intersection of high-end aesthetics and functional design. This editorial dives deep into how {product.name} is redefining digital storytelling in Nairobi's tech scene.
            </p>
            
            <h2 className="text-3xl font-light tracking-tight mt-16 mb-8">The Philosophy of Form</h2>
            <p>
              In the heart of Nairobi's evolving landscape, the demand for "visually stunning" interfaces isn't just a trend; it's a digital commerce reality. 
              We often find ourselves at a crossroads where functionality meets pure artistry. This piece explores how we can bridge that gap.
            </p>

            <div className="my-16 relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
              <Image src={product.images[1]?.url || product.images[1] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'} alt="Context" fill className="object-cover" loader={loader}/>
              <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-[10px] text-white font-bold tracking-widest">
                FIG 01. CONCEPTUAL ARCHITECTURE
              </div>
            </div>

            <h2 className="text-3xl font-light tracking-tight mt-16 mb-8">User-Centric Innovation</h2>
            <p>
              Design is not just what it looks like and feels like. Design is how it works. When building systems like SalesmanPro, the focus shifts to efficiency.
              However, beauty provides a cognitive ease that allows users to navigate complex data without the weight of traditional enterprise software.
            </p>

            <blockquote className="border-l-4 border-blue-600 pl-8 my-16">
              <p className="text-2xl font-light italic text-zinc-800 dark:text-zinc-200">
                "Digital commerce in Africa isn't about replicating the West; it's about optimizing for a reality that is mobile-first, real-time, and deeply personal."
              </p>
            </blockquote>

            <p>
              The conclusion is simple: whether we are crafting school management modules or high-end retail experiences, the "captivating" nature of the UI 
              is what keeps the user engaged long enough to find the value underneath.
            </p>
          </div>

          {/* ARTICLE FOOTER: TAGS & CTA */}
          <div className="mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-900">
            <div className="flex flex-wrap gap-3 mb-12">
              {['UX Design', 'Nairobi Tech', 'Innovation', 'SaaS'].map(tag => (
                <span key={tag} className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-xs font-bold text-zinc-500 flex items-center gap-2">
                  <HashtagIcon className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* RIGHT: READING EXPERIENCE & RELATED (Desktop) */}
        <aside className="w-full lg:w-72 flex flex-col gap-12">
          {/* Customizer */}
          <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4" /> View Options
            </h4>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold mb-3 uppercase">Typography</p>
                <div className="flex gap-2">
                  <button onClick={() => setReadingMode('sans')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${readingMode === 'sans' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200'}`}>SANS</button>
                  <button onClick={() => setReadingMode('serif')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${readingMode === 'serif' ? 'bg-zinc-900 text-white border-zinc-900 font-serif' : 'bg-white border-zinc-200'}`}>SERIF</button>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold mb-3 uppercase">Text Size</p>
                <div className="flex gap-2">
                  <button onClick={() => setFontSize('normal')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${fontSize === 'normal' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200'}`}>NORMAL</button>
                  <button onClick={() => setFontSize('large')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${fontSize === 'large' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200'}`}>LARGE</button>
                </div>
              </div>
            </div>
          </div>

          {/* Small Related Sidebar */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Trending Stories</h4>
            <div className="space-y-8">
              {related.slice(0, 3).map(r => (
                <div key={r.id} className="group cursor-pointer">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-3">
                    <Image src={r.images[0]?.url || r.images[0] || 'https://via.placeholder.com/1200x800'} alt={r.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" loader={loader}/>
                  </div>
                  <h5 className="text-sm font-bold group-hover:text-blue-600 transition-colors leading-snug">{r.name}</h5>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* --- FOOTER: COMPLETE THE VISION --- */}
      <section className="px-6 lg:px-20 py-32 bg-zinc-50 dark:bg-[#080808] border-t border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl lg:text-6xl font-light tracking-tighter dark:text-white italic">Keep Reading</h2>
            <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors">Discover All Stories</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.slice(0, 4).map(r => (
              <ProductCard key={r.id} product={r as any} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}