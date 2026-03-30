'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function MissionNewsSection() {
  const newsItems = [
    {
      date: "MAY 2, 2019",
      title: "QUEEN SPOTTING: HOW TO FIND YOUR QUEEN BEE",
      excerpt: "Since 2012 I have been playing a game called Queenspotting with my followers on social media. I post an image of a lot of bees and then...",
    },
    {
      date: "MAY 2, 2019",
      title: "WHY FIND THE QUEEN BEE?",
      excerpt: "When I tell new beekeepers that it's not necessary to find the queen bee every time they inspect their hives, their face usually takes on an expression of relief.",
    },
    {
      date: "MAY 2, 2019",
      title: "HOW TO KEEP A NEWLY CAUGHT SWARM FROM LEAVING",
      excerpt: "Swarm catching season is well underway and many of you have been enjoying the thrill of capturing your first swarms.",
    }
  ];

  return (
    <section className="bg-[#fdf8f1] py-20 lg:py-32 relative overflow-hidden">
      {/* Decorative Bee Element */}
      <div className="absolute top-10 left-10 opacity-60">
         <Image 
            src="https://images.unsplash.com/photo-1560114031-6e3e5c9a7f3d?auto=format&fit=crop&w=100&q=80" 
            alt="Bee decoration" 
            width={50} 
            height={50} 
            className="rotate-12"
            loader={loader}
         />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* MISSION CONTENT - Takes up 2/3 space */}
          <div className="lg:col-span-2 space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[16/9] w-full overflow-hidden shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80"
                alt="Beekeeper at work"
                fill
                className="object-cover"
                loader={loader}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl space-y-6"
            >
              <h2 className="text-3xl font-bold tracking-tighter uppercase text-black">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                The bees live as they naturally would and their benefits reach more people. Our goal is to 
                <span className="font-bold border-b-2 border-[#c2a472] mx-1">raise San Diego's bee population</span> 
                throughout the city and at the same time <span className="underline decoration-[#c2a472] decoration-2">spread awareness among the community</span>.
              </p>
              <p className="text-gray-600 leading-relaxed italic">
                Our hope is that these backyard hives will facilitate a dialogue among neighbors, friends, family and the community at large about the importance of bees.
              </p>
              <div className="pt-4">
                <span className="font-cursive text-4xl text-[#c2a472]">Carolina T.</span>
              </div>
            </motion.div>
          </div>

          {/* NEWS FEED - Takes up 1/3 space */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 shadow-sm border border-orange-50/50"
          >
            <h3 className="text-2xl font-bold tracking-widest uppercase mb-10 text-black">News</h3>
            
            <div className="space-y-12">
              {newsItems.map((item, index) => (
                <article key={index} className="group cursor-pointer">
                  <span className="text-[#c2a472] text-xs font-bold tracking-widest">{item.date}</span>
                  <h4 className="text-sm font-black mt-2 mb-3 leading-snug group-hover:text-[#c2a472] transition-colors uppercase">
                    {item.title}
                  </h4>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                </article>
              ))}
            </div>

            <Link href="/honeyecommerce/blogs" className="inline-flex items-center mt-12 text-[10px] font-black uppercase tracking-[0.3em] hover:text-[#c2a472] transition-colors group">
              Show More News 
              <ChevronRightIcon className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}