'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  ChevronDownIcon, 
  StarIcon, 
} from '@heroicons/react/24/solid';

const testimonials = [
  {
    name: "Samuel K.",
    role: "Maize Farmer, Narok",
    text: "The hybrid seeds from this store changed my season. I saw a 40% increase in harvest weight compared to last year. Truly a partner in my growth.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=sam",
  },
  {
    name: "Dr. Jane M.",
    role: "Veterinary Specialist",
    text: "As a vet, I only recommend certified inputs. Their vaccine storage and supply chain are the most reliable in the region. Highly professional.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=jane",
  },
  {
    name: "Peter O.",
    role: "Dairy Farm Manager",
    text: "The nutritional supplements are top-tier. Our milk production stabilized within two weeks of switching. The bulk delivery saved us a fortune.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=peter",
  },
];

const faqs = [
  {
    question: "Do you offer doorstep delivery for bulk fertilizers?",
    answer: "Yes, we provide climate-controlled logistics for bulk orders over 500kg directly to your farm gate within 48 hours."
  },
  {
    question: "Are your seeds KEPHIS certified?",
    answer: "Every seed variety in our catalog is 100% KEPHIS certified and tracked for quality assurance and high germination rates."
  },
  {
    question: "Can I get a consultation for my livestock?",
    answer: "Absolutely. We have on-call veterinary specialists available for digital consultations and on-site farm visits."
  }
];

export default function VoicesOfGrowth() {
  return (
    <section className="bg-white py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* --- TESTIMONIALS HEADER --- */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Voices of Growth</span>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
            The Result of <br /> 
            <span className="italic font-serif font-light text-emerald-600">Proper Inputs.</span>
          </h2>
        </div>

        {/* --- TESTIMONIAL GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-40">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-10 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-emerald-200 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] transition-all duration-500"
            >
              <div className="flex gap-1 text-emerald-500 mb-6">
                {[...Array(t.rating)].map((_, star) => (
                  <StarIcon key={star} className="w-4 h-4" />
                ))}
              </div>

              <p className="text-xl font-medium text-slate-700 leading-relaxed mb-10 italic">
                "{t.text}"
              </p>

              <div className="flex items-center gap-4 border-t border-slate-200 pt-8">
                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full grayscale group-hover:grayscale-0 transition-all" />
                <div className="text-left">
                  <p className="font-black text-slate-900 uppercase tracking-tighter">{t.name}</p>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- FAQS SECTION --- */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Technical Support & FAQs</h3>
            <div className="h-1 w-12 bg-emerald-500 mx-auto mt-4 rounded-full" />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden transition-all hover:border-emerald-200"
              >
                <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                  <span className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {faq.question}
                  </span>
                  <div className="p-2 rounded-full bg-slate-50 text-slate-400 group-open:rotate-180 transition-transform">
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>
                </summary>
                <div className="px-8 pb-8">
                  <p className="text-slate-500 leading-relaxed font-medium border-t border-slate-50 pt-6">
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