'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  XMarkIcon, 
  ArrowRightIcon,
  FireIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

// Define a type for your products based on your schema
interface ProductResult {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
}

export default function LiveSearchSideBar({ 
  isOpen, 
  onClose, 
  primaryColor = '#FF5722' 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  primaryColor?: string 
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Live Search Logic with Debounce
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Adjust this endpoint to your actual search API route
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.slice(0, 5)); // Limit to 5 results for the sidebar
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-zinc-950 z-[110] shadow-2xl p-10 flex flex-col border-l border-zinc-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Search Menu</span>
              </div>
              <button onClick={onClose} className="p-2 hover:rotate-90 transition-transform">
                <XMarkIcon className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            {/* Input Form */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Craving something?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 py-6 text-4xl font-serif italic text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-800 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
              />
              {loading && (
                <div className="absolute right-0 bottom-4">
                  <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-800 animate-spin rounded-full" />
                </div>
              )}
            </div>

            {/* Dynamic Results Area */}
            <div className="mt-12 flex-1 overflow-y-auto no-scrollbar">
              {results.length > 0 ? (
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Top Matches</h4>
                  {results.map((product) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={product.id}
                      onClick={() => handleNavigate(`/product/${product.id}`)}
                      className="flex items-center gap-4 group cursor-pointer"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <Image 
                          src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url || '/placeholder.png'} 
                          alt={product.name}
                          loader={({src})=>src}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors">{product.name}</h3>
                        <p className="text-sm text-zinc-500">Ksh {product.price}</p>
                      </div>
                      <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </motion.div>
                  ))}
                </div>
              ) : query.length >= 2 && !loading ? (
                <div className="text-center py-10">
                   <p className="text-zinc-400 italic font-serif">No dishes found for "{query}"</p>
                </div>
              ) : (
                /* Default view when not searching: Recommendations */
                <div className="space-y-10">
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">
                      <FireIcon className="w-4 h-4 text-orange-500" />
                      Chef's Picks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['Truffle', 'Platter', 'Vegan', 'Cocktails'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold hover:bg-zinc-900 hover:text-white transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Visual Card */}
            <div className="mt-auto pt-10">
               <div className="relative h-32 rounded-2xl overflow-hidden group">
                  <Image 
                    src="https://images.unsplash.com/photo-1550966841-3ee323330939" 
                    loader={({src})=>src}
                    fill 
                    alt="Promo" 
                    className="object-cover brightness-50 group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <p className="text-white text-xs font-black uppercase tracking-widest">Happy Hour</p>
                    <p className="text-white/70 text-[10px]">50% off all cocktails from 5 PM</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}