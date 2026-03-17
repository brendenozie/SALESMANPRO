"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  ArrowRightIcon,
  ArrowLeftOnRectangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import fit1 from "@/assets/fit1.png";
import { useSession, signOut } from 'next-auth/react';

const WelcomePage = () => {
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState('');
  const userName = session?.user?.name?.split(' ')[0] || 'Admin';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const launchActions = [
    { title: "My Stores", desc: "Access your active locations", icon: <BuildingStorefrontIcon />, color: "text-blue-600", bg: "bg-blue-50", href: "/stores" },
    //for placeholder purposes only - these features are not yet implemented
    // { title: "Analytics", desc: "Performance overview", icon: <ChartBarIcon />, color: "text-emerald-600", bg: "bg-emerald-50", href: "/#" },
    // { title: "Team", desc: "Manage permissions", icon: <UserGroupIcon />, color: "text-purple-600", bg: "bg-purple-50", href: "/#" },
    // { title: "Settings", desc: "Global configuration", icon: <Cog6ToothIcon />, color: "text-slate-600", bg: "bg-slate-50", href: "/#" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans p-4 md:p-8">
      {/* Top Bar */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          {/* Brand */}
              <div className="flex items-center gap-2 group">
                <div className="relative">
                  <img
                    src={fit1.src}
                    alt="Logo"
                    className="w-8 h-8 md:w-9 md:h-9 object-contain group-hover:rotate-12 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white transition-colors">
                  Salesman<span className="text-orange-600">Pro</span>
                </span>
              </div>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
        </button>
      </nav>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        
        {/* Left: Perspective & Hero */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-sm font-bold text-orange-500 tracking-widest uppercase">Console v3.0</span>
            <h1 className="text-5xl md:text-6xl font-black mt-4 mb-6 tracking-tight leading-none">
              {greeting},<br />
              <span className="text-slate-400">{userName}.</span>
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-sm leading-relaxed">
              Your ecosystem is ready. Select a module below to begin managing your commerce operations.
            </p>
            
            <button 
              onClick={() => window.location.href = '/stores'}
              className="flex items-center gap-3 bg-black text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all group"
            >
              <PlusIcon className="w-5 h-5" />
              Launch New Store
              <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </motion.div>
        </div>

        {/* Right: Bento Grid of Actions */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {launchActions.map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              onClick={() => window.location.href = action.href}
              className="group cursor-pointer bg-white border border-slate-200 p-8 rounded-[2rem] flex flex-col justify-between min-h-[220px] transition-all"
            >
              <div className={`w-14 h-14 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center mb-4`}>
                {React.cloneElement(action.icon as React.ReactElement, { className: "w-8 h-8" })}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-orange-500 transition-colors">{action.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {action.desc}
                </p>
              </div>
            </motion.div>
          ))}
          
          {/* Status Tile */}
          <div className="sm:col-span-2 bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <h4 className="text-xl font-bold tracking-tight">System Status: Optimal</h4>
              <p className="text-indigo-100 text-sm">All subdomains and custom gateways are operational.</p>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-xs font-bold">
                  U{i}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-white text-orange-500 flex items-center justify-center text-xs font-bold">
                +12
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Background Detail */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  );
};

export default WelcomePage;