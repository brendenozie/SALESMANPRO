"use client";
import React from "react";

import { motion } from "framer-motion";
import { 
  CalendarIcon, 
  UserIcon, 
  ArrowRightIcon, 
  BookOpenIcon, 
  PaperAirplaneIcon 
} from "@heroicons/react/24/solid";
import Image from "next/image";
import { EditableElement } from "@/contexts/EditableContentContext";

const POSTS = [
  {
    id: 1,
    title: "Optimizing Route Freight for Cold Chain Logistics",
    excerpt: "How new temperature-controlled rail systems are changing the game for pharmaceutical transport across Europe.",
    date: "Feb 12, 2026",
    author: "Admin",
    category: "Solutions",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    id: 2,
    title: "The Rise of Autonomous Logistics Operations",
    date: "Feb 10, 2026",
    author: "Strategy Team",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&q=80&w=400",
    featured: false
  },
  {
    id: 3,
    title: "Navigating Global Trade Shifts in 2026",
    date: "Feb 08, 2026",
    author: "Market Analyst",
    category: "Market",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400",
    featured: false
  }
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export function BlogSection() {
  const featuredPost = POSTS.find(p => p.featured);
  const regularPosts = POSTS.filter(p => !p.featured);

  return (
    <section id="news" className="py-24 lg:py-40 bg-white relative overflow-hidden font-sans">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-orange-600"
            >
              <BookOpenIcon className="w-5 h-5" />
              <EditableElement
                targetId="delivery.home.blog.badge"
                componentKey="BlogSection"
                elementKey="badge"
                label="Badge Text"
                defaultValue="Knowledge Base"
                type="text"
              >
                {(val) => (
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                    {val || "Knowledge Base"}
                  </span>
                )}
              </EditableElement>
            </motion.div>
            <EditableElement
              targetId="delivery.home.blog.title"
              componentKey="BlogSection"
              elementKey="title"
              label="Section Title"
              defaultValue="Industry Intelligence"
              type="text"
            >
              {(val) => (
                <h2 className="text-5xl md:text-7xl font-black text-slate-950 leading-none uppercase italic tracking-tighter">
                  {val || (
                    <>
                      Industry <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #0f172a' }}>Intelligence</span>
                    </>
                  )}
                </h2>
              )}
            </EditableElement>
          </div>
          
          <EditableElement
            targetId="delivery.home.blog.ctaText"
            componentKey="BlogSection"
            elementKey="ctaText"
            label="Explore CTA Text"
            defaultValue="Explore Journal"
            type="text"
          >
            {(val) => (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="group flex items-center gap-4 px-10 py-5 bg-slate-950 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl"
              >
                {val || "Explore Journal"} <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            )}
          </EditableElement>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* --- FEATURED COLUMN --- */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-100 mb-10 shadow-2xl">
              <EditableElement
                targetId="delivery.home.blog.featured.image"
                componentKey="BlogSection"
                elementKey="featured.image"
                label="Featured Post Image"
                defaultValue={featuredPost?.image || ""}
                type="image"
              >
                {(val) => (
                  <Image decoding="async" 
                    src={val || featuredPost?.image || ""} 
                    alt={featuredPost?.title || ""}
                    width={1200}
                    height={800}
                    className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                )}
              </EditableElement>
              <div className="absolute top-8 left-8">
                <EditableElement
                  targetId="delivery.home.blog.featured.category"
                  componentKey="BlogSection"
                  elementKey="featured.category"
                  label="Featured Post Category"
                  defaultValue={featuredPost?.category || "Solutions"}
                  type="text"
                >
                  {(val) => (
                    <span className="px-6 py-3 bg-white/90 backdrop-blur-md text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl">
                      {val || featuredPost?.category}
                    </span>
                  )}
                </EditableElement>
              </div>
            </div>
            
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-orange-500" />
                  <EditableElement
                    targetId="delivery.home.blog.featured.date"
                    componentKey="BlogSection"
                    elementKey="featured.date"
                    label="Featured Post Date"
                    defaultValue={featuredPost?.date || "Feb 12, 2026"}
                    type="text"
                  >
                    {(val) => <span>{val || featuredPost?.date}</span>}
                  </EditableElement>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-orange-500" />
                  <EditableElement
                    targetId="delivery.home.blog.featured.author"
                    componentKey="BlogSection"
                    elementKey="featured.author"
                    label="Featured Post Author"
                    defaultValue={featuredPost?.author || "Admin"}
                    type="text"
                  >
                    {(val) => <span>{val || featuredPost?.author}</span>}
                  </EditableElement>
                </div>
              </div>
              <EditableElement
                targetId="delivery.home.blog.featured.title"
                componentKey="BlogSection"
                elementKey="featured.title"
                label="Featured Post Title"
                defaultValue={featuredPost?.title || ""}
                type="text"
              >
                {(val) => (
                  <h3 className="text-4xl md:text-5xl font-black text-slate-950 leading-[1.1] tracking-tight group-hover:text-orange-600 transition-colors">
                    {val || featuredPost?.title}
                  </h3>
                )}
              </EditableElement>
              <EditableElement
                targetId="delivery.home.blog.featured.excerpt"
                componentKey="BlogSection"
                elementKey="featured.excerpt"
                label="Featured Post Excerpt"
                defaultValue={featuredPost?.excerpt || ""}
                type="textarea"
              >
                {(val) => (
                  <p className="text-slate-500 text-lg font-medium leading-relaxed">
                    {val || featuredPost?.excerpt}
                  </p>
                )}
              </EditableElement>
              <EditableElement
                targetId="delivery.home.blog.featured.linkText"
                componentKey="BlogSection"
                elementKey="featured.linkText"
                label="Featured Post Link Text"
                defaultValue="Full Story"
                type="text"
              >
                {(val) => (
                  <button className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.3em] text-slate-950 border-b-2 border-orange-500 pb-2 hover:gap-6 transition-all">
                    {val || "Full Story"} <ArrowRightIcon className="w-4 h-4" />
                  </button>
                )}
              </EditableElement>
            </div>
          </motion.div>

          {/* --- SIDEBAR LIST --- */}
          <div className="lg:col-span-5 space-y-12 lg:pt-4">
            {regularPosts.map((post, i) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="group flex gap-8 items-center cursor-pointer"
              >
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] overflow-hidden shrink-0 shadow-lg group-hover:shadow-orange-500/20 transition-all duration-500">
                  <EditableElement
                    targetId={`delivery.home.blog.posts.${i}.image`}
                    componentKey="BlogSection"
                    elementKey={`posts.${i}.image`}
                    label={`Post ${i + 1} Image`}
                    defaultValue={post.image}
                    type="image"
                  >
                    {(val) => (
                      <Image decoding="async" 
                        src={val || post.image} 
                        alt={post.title} 
                        width={200}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    )}
                  </EditableElement>
                </div>
                <div className="space-y-3">
                  <EditableElement
                    targetId={`delivery.home.blog.posts.${i}.category`}
                    componentKey="BlogSection"
                    elementKey={`posts.${i}.category`}
                    label={`Post ${i + 1} Category`}
                    defaultValue={post.category}
                    type="text"
                  >
                    {(val) => (
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                        {val || post.category}
                      </span>
                    )}
                  </EditableElement>
                  <EditableElement
                    targetId={`delivery.home.blog.posts.${i}.title`}
                    componentKey="BlogSection"
                    elementKey={`posts.${i}.title`}
                    label={`Post ${i + 1} Title`}
                    defaultValue={post.title}
                    type="text"
                  >
                    {(val) => (
                      <h4 className="text-xl font-black text-slate-950 leading-tight group-hover:text-orange-600 transition-colors tracking-tight">
                        {val || post.title}
                      </h4>
                    )}
                  </EditableElement>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <EditableElement
                      targetId={`delivery.home.blog.posts.${i}.date`}
                      componentKey="BlogSection"
                      elementKey={`posts.${i}.date`}
                      label={`Post ${i + 1} Date`}
                      defaultValue={post.date}
                      type="text"
                    >
                      {(val) => <span>{val || post.date}</span>}
                    </EditableElement>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Newsletter Pod - "The Logistics Digest" */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative p-10 rounded-[3rem] bg-slate-950 text-white overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)]"
            >
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center rotate-12 shadow-lg shadow-orange-600/20">
                    <PaperAirplaneIcon className="w-6 h-6 text-white" />
                  </div>
                  <EditableElement
                    targetId="delivery.home.blog.newsletter.title"
                    componentKey="BlogSection"
                    elementKey="newsletter.title"
                    label="Newsletter Title"
                    defaultValue="The Logistics Digest"
                    type="text"
                  >
                    {(val) => (
                      <h4 className="text-2xl font-black italic uppercase leading-none tracking-tighter">
                        {val || (
                          <>
                            The Logistics <br /><span className="text-orange-500">Digest</span>
                          </>
                        )}
                      </h4>
                    )}
                  </EditableElement>
                </div>
                <EditableElement
                  targetId="delivery.home.blog.newsletter.desc"
                  componentKey="BlogSection"
                  elementKey="newsletter.desc"
                  label="Newsletter Description"
                  defaultValue="Join 15,000+ logistics pros receiving our weekly trade analysis."
                  type="textarea"
                >
                  {(val) => (
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      {val || "Join 15,000+ logistics pros receiving our weekly trade analysis."}
                    </p>
                  )}
                </EditableElement>
                <div className="relative flex items-center">
                  <input 
                    type="email" 
                    placeholder="E-mail address" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-600"
                  />
                  <button className="absolute right-2 p-4 bg-orange-600 rounded-xl hover:bg-white hover:text-orange-600 transition-all group">
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              {/* Decorative radial blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-500/10 blur-2xl" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}