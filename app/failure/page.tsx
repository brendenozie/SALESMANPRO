"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  ArrowLeftIcon, 
  ChatBubbleLeftRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import fit1 from "@/assets/fit1.png";
import { signOut } from 'next-auth/react';

const FailurePage = ({ 
  title = "Access Denied", 
  message = "It seems you don't have the necessary permissions to view this module. Please contact your system administrator.",
  errorCode = "403"
}) => {

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans p-4 md:p-8 flex flex-col relative overflow-hidden">
      {/* Top Bar - Consistency with Main App */}
      <nav className="max-w-7xl mx-auto w-full flex justify-between items-center mb-12 relative z-10">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="relative">
            <img
              src={fit1.src}
              alt="Logo"
              className="w-8 h-8 md:w-9 md:h-9 object-contain"
            />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">
            Salesman<span className="text-orange-600">Pro</span>
          </span>
        </div>
        
        <button 
          onClick={()=> {
            const returnTo = window.location.origin;

            signOut({
              redirect: true,
              callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
            });
          }}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          Sign out
        </button>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          {/* Stunning Background Glow */}
          <div className="absolute inset-0 bg-orange-500/10 blur-[100px] rounded-full" />
          
          <div className="bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden inline-block">
             <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto">
                <ExclamationTriangleIcon className="w-10 h-10" />
             </div>
             <div className="absolute top-2 right-4 text-slate-200 font-black text-4xl select-none">
                {errorCode}
             </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Hold on a <span className="text-orange-600 font-serif italic italic-none">moment.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed mb-10">
            {message}
          </p>
        </motion.div>

        {/* Action Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4"
        >
          <button 
            onClick={handleGoBack}
            className="flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </button>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            <HomeIcon className="w-5 h-5" />
            Return Dashboard
          </button>
        </motion.div>

        {/* Help Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-slate-200 w-full flex flex-col items-center"
        >
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span>Need help? Reach out to support@salesmanpro.site</span>
          </div>
        </motion.div>
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <motion.div 
          animate={{ 
            x: [0, 20, 0], 
            y: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] opacity-60" 
        />
        <motion.div 
           animate={{ 
            x: [0, -30, 0], 
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] -left-[5%] w-[500px] h-[500px] bg-orange-50 rounded-full blur-[120px] opacity-40" 
        />
      </div>
    </div>
  );
};

export default FailurePage;