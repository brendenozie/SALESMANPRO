'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  ChevronDownIcon, 
  StarIcon,
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/solid';

const testimonials = [
  {
    name: "Chef Marcus S.",
    role: "Head Chef, Nairobi Grill",
    text: "The consistency is what sets them apart. I've never received a cut that wasn't perfectly aged and marbled. They are the backbone of our menu.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=chef",
  },
  {
    name: "Elena R.",
    role: "Family Subscriber",
    text: "Switched to their whole-carcass bulk plan last month. The vacuum sealing is incredible, and the flavor is noticeably superior to supermarket meat.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=elena",
  },
  {
    name: "David T.",
    role: "Event Organizer",
    text: "We ordered 200kg of assorted cuts for a corporate retreat. Cold-chain delivery arrived exactly on time and at the perfect temp. Flawless service.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=david",
  },
];

const faqs = [
  {
    question: "How do you ensure meat freshness during delivery?",
    answer: "We use specialized vacuum-sealed packaging and custom-built refrigerated transport maintained at a constant 2°C, ensuring farm-to-table integrity."
  },
  {
    question: "Do you offer custom aging for specific cuts?",
    answer: "Yes. For bulk or wholesale clients, we offer custom dry-aging services up to 45 days in our climate-controlled aging rooms."
  },
  {
    question: "What is your policy on livestock sourcing?",
    answer: "We partner exclusively with verified grass-fed ranches that adhere to natural growth cycles and ethical treatment standards."
  }
];

export default function VoicesOfGrowth() {
  return (
    <section className="bg-white dark:bg-[#080808] py-40 px-6 overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col items-center text-center mb-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 mb-8"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-red-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-600 dark:text-stone-400">The Butcher's Table</span>
          </motion.div>

          <h2 className="text-6xl md:text-8xl font-black text-stone-950 dark:text-white leading-[0.8] tracking-tighter mb-10">
            Word of <br /> 
            <span className="italic font-serif font-light text-red-600">Mouth.</span>
          </h2>
        </div>

        {/* --- TESTIMONIAL GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-48">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-12 bg-stone-50 dark:bg-stone-900 rounded-[3rem] border border-transparent hover:border-stone-200 dark:hover:border-stone-700 hover:bg-white dark:hover:bg-stone-800 transition-all duration-700"
            >
              <div className="flex gap-1 text-stone-300 dark:text-stone-700 group-hover:text-red-600 transition-colors mb-8">
                {[...Array(t.rating)].map((_, star) => (
                  <StarIcon key={star} className="w-4 h-4" />
                ))}
              </div>

              <p className="text-xl font-bold text-stone-800 dark:text-stone-200 leading-snug mb-12 tracking-tight italic">
                "{t.text}"
              </p>

              <div className="flex items-center gap-5 border-t border-stone-200 dark:border-stone-800 pt-10">
                <img src={t.image} alt={t.name} className="w-14 h-14 rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="text-left">
                  <p className="font-black text-stone-950 dark:text-white uppercase tracking-tighter text-sm">{t.name}</p>
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- FAQS SECTION: BRUTALIST STYLE --- */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
             <QuestionMarkCircleIcon className="w-10 h-10 text-stone-200 dark:text-stone-800 mb-4" />
             <h3 className="text-4xl font-black text-stone-950 dark:text-white tracking-tighter uppercase">Common Queries</h3>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="group bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-2xl dark:hover:shadow-stone-950/50"
              >
                <summary className="flex items-center justify-between p-10 cursor-pointer list-none">
                  <span className="text-xl font-black text-stone-900 dark:text-white tracking-tight group-hover:text-red-600 transition-colors">
                    {faq.question}
                  </span>
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-400 group-open:rotate-180 group-open:bg-red-600 group-open:text-white transition-all">
                    <ChevronDownIcon className="w-6 h-6" />
                  </div>
                </summary>
                <div className="px-10 pb-10">
                  <p className="text-lg text-stone-500 dark:text-stone-400 leading-relaxed font-medium border-t border-stone-50 dark:border-stone-800/50 pt-8">
                    {faq.answer}
                  </p>
                </div>
              </motion.details>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}