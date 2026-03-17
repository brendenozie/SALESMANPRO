"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  ArrowRightIcon,
  SparklesIcon,
  ArrowLeftOnRectangleIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';

// --- Redesigned Welcome Page ---

const WelcomePage = () => {
  const { data: session, status } = useSession();
  const [greeting, setGreeting] = useState('');
  const userName = session?.user?.name?.split(' ')[0] || 'Partner';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const features = [
    { title: "Smart Inventory", desc: "Stock management made simple", icon: <SparklesIcon className="w-5 h-5" /> },
    { title: "Global Reach", desc: "Sell anywhere, anytime", icon: <RocketLaunchIcon className="w-5 h-5" /> },
    { title: "Secure Payments", desc: "Enterprise-grade safety", icon: <ShieldCheckIcon className="w-5 h-5" /> },
  ];

  if (status === "loading") return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" 
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-hidden relative font-sans selection:bg-indigo-100">
      
      {/* Abstract Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] -z-10" />

      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
            <BuildingStorefrontIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">StoreCentral</span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => signOut({ callbackUrl: '/' })}
          className="group flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
        >
          <span>Sign Out</span>
          <ArrowLeftOnRectangleIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
            <LightBulbIcon className="w-4 h-4" />
            <span>Ready to launch</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
            {greeting}, <span className="text-indigo-600">{userName}.</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
            Welcome to your new commerce command center. We've built a powerful space for you to manage your stores, track growth, and connect with customers effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/stores'}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold shadow-2xl shadow-slate-200 flex items-center group"
            >
              Enter My Stores
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <button className="px-8 py-4 text-slate-600 font-semibold hover:bg-slate-100 rounded-2xl transition-colors">
              Watch Walkthrough
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex flex-col space-y-2"
              >
                <div className="text-indigo-600">{f.icon}</div>
                <h3 className="font-bold text-slate-800">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Visual Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          {/* Main "Glass" Card */}
          <div className="relative z-10 bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="h-6 w-32 bg-slate-200/50 rounded-full animate-pulse" />
             </div>
             
             <div className="space-y-6">
                <div className="h-32 w-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 flex flex-col justify-end">
                    <div className="h-4 w-24 bg-white/30 rounded mb-2" />
                    <div className="h-8 w-40 bg-white/50 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white/60 rounded-2xl border border-slate-100" />
                    <div className="h-24 bg-white/60 rounded-2xl border border-slate-100" />
                </div>
                <div className="h-40 bg-white/60 rounded-2xl border border-slate-100 flex items-center justify-center">
                    <BuildingStorefrontIcon className="w-12 h-12 text-slate-200" />
                </div>
             </div>
          </div>

          {/* Floating Accents */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-[-20px] right-[-20px] bg-white p-4 rounded-2xl shadow-xl z-20 border border-slate-50"
          >
            <SparklesIcon className="w-8 h-8 text-yellow-500" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[20px] left-[-40px] bg-white px-6 py-4 rounded-2xl shadow-xl z-20 border border-slate-50 flex items-center space-x-3"
          >
            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
            <span className="font-bold text-slate-700">System Live</span>
          </motion.div>
        </motion.div>

      </main>
    </div>
  );
};

export default WelcomePage;