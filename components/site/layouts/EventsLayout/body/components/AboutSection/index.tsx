"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckBadgeIcon, SparklesIcon, TicketIcon, UsersIcon } from '@heroicons/react/24/solid';

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode; }) => (
    <motion.div
        variants={itemVariants}
        className="flex items-start space-x-4"
    >
        <div className="flex-shrink-0 p-3 bg-gray-800/60 rounded-full border border-gray-700">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-gray-400">{children}</p>
        </div>
    </motion.div>
);


export default function AboutSection({ description }: { description?: string }) {
  return (
    <section className="relative bg-gray-900 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Column: Image Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.5 }}
          className="grid grid-cols-2 grid-rows-2 gap-4"
        >
            <motion.div
                whileHover={{ scale: 1.05, rotate: -3 }}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-xl"
            >
                <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTAwNXwwfDF8c2VhcmNofDN8fGNvbmNlcnR8ZW58MHx8fHwxNzIwOTY3MzYyfDA&ixlib=rb-4.0.3&q=80&w=400" alt="Concert" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </motion.div>
            <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-xl row-span-1 mt-8"
            >
                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTAwNXwwfDF8c2VhcmNofDEyfHxhcnQlMjBleGhpYml0aW9ufGVufDB8fHx8MTcyMDk2NzM5NHww&ixlib=rb-4.0.3&q=80&w=400" alt="Art Exhibit" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </motion.div>
            <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-xl col-span-1 -mt-8"
            >
                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTAwNXwwfDF8c2VhcmNofDR8fHRlY2glMjBjb25mZXJlbmNlfGVufDB8fHx8MTcyMDk2NzQyMXww&ixlib=rb-4.0.3&q=80&w=400" alt="Tech Conference" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </motion.div>
             <motion.div
                whileHover={{ scale: 1.05, rotate: -3 }}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-xl"
            >
                <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOTAwNXwwfDF8c2VhcmNofDJ8fHdlbGxuZXNzJTIwcmV0cmVhdHxlbnwwfHx8fDE3MjA5Njc0NDV8MA&ixlib=rb-4.0.3&q=80&w=400" alt="Wellness Retreat" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </motion.div>
        </motion.div>

        {/* Right Column: Text Content */}
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-black tracking-tighter mb-6 text-white">
            Connecting You to <br/> Unforgettable <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Experiences</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-gray-300 mb-10 leading-relaxed">
            {description ||
              "We're a passionate team dedicated to bridging the gap between event organizers and attendees. Our platform is more than just a marketplace; it's a community built around the magic of live events. Discover, connect, and create memories that last a lifetime."}
          </motion.p>
          
          <div className="space-y-6">
            <FeatureCard icon={<SparklesIcon className="h-6 w-6 text-purple-400" />} title="Curated Collections">
                Explore hand-picked events in every category, from sold-out concerts to niche workshops.
            </FeatureCard>
             <FeatureCard icon={<TicketIcon className="h-6 w-6 text-pink-400" />} title="Seamless & Secure">
                Enjoy a hassle-free booking experience with trusted ticketing and secure payment processing.
            </FeatureCard>
             <FeatureCard icon={<UsersIcon className="h-6 w-6 text-indigo-400" />} title="Community Focused">
                Join a vibrant community of event-goers and creators, with 24/7 support for everyone.
            </FeatureCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
