"use client";

import React, { useState } from "react";
import { 
  FolderPlusIcon, 
  TagIcon, 
  BeakerIcon, 
  ComputerDesktopIcon, 
  MusicalNoteIcon,
  HomeModernIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

const InventoryCategoriesClient = () => {
  const categories = [
    { 
      id: 'CAT-01', 
      name: 'IT Infrastructure', 
      sub: ['Laptops', 'Servers', 'Projectors'], 
      items: 412, 
      value: '$120,400',
      icon: ComputerDesktopIcon,
      color: 'text-blue-400' 
    },
    { 
      id: 'CAT-02', 
      name: 'Science Laboratory', 
      sub: ['Chemicals', 'Glassware', 'Models'], 
      items: 850, 
      value: '$45,200',
      icon: BeakerIcon,
      color: 'text-orange-400' 
    },
    { 
      id: 'CAT-03', 
      name: 'Furniture & Decor', 
      sub: ['Desks', 'Chairs', 'Cabinets'], 
      items: 1200, 
      value: '$88,000',
      icon: HomeModernIcon,
      color: 'text-emerald-400' 
    },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-orange-500 rounded-full" />
              <span className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">Asset Architecture</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Inventory <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Categories.</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold text-xs hover:bg-orange-50 transition-all shadow-lg">
            <FolderPlusIcon className="h-4 w-4" /> Create Category
          </button>
        </header>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="group bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 hover:bg-slate-900/60 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 bg-slate-800 rounded-2xl ${cat.color}`}>
                  <cat.icon className="h-8 w-8" />
                </div>
                <button className="text-slate-600 hover:text-white transition-colors">
                  <EllipsisVerticalIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                   <h3 className="text-2xl font-black text-white">{cat.name}</h3>
                   <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">{cat.id}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {cat.sub.map((sub, i) => (
                    <span key={i} className="px-3 py-1 bg-black/40 border border-slate-800 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-800/50">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Unique SKUs</p>
                  <p className="text-xl font-bold text-white italic">{cat.items}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Net Value</p>
                  <p className="text-xl font-bold text-orange-400 italic">{cat.value}</p>
                </div>
              </div>

              <button className="w-full mt-6 py-4 rounded-2xl bg-slate-800/50 text-slate-400 group-hover:bg-orange-600 group-hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                Explore Stock <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* New Category Placeholder */}
          <button className="group border-2 border-dashed border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-orange-500/50 hover:bg-orange-500/[0.02] transition-all">
            <div className="h-14 w-14 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 group-hover:text-orange-500 transition-colors">
              <TagIcon className="h-6 w-6" />
            </div>
            <p className="text-xs font-black uppercase text-slate-600 tracking-widest group-hover:text-slate-300">Add New Classification</p>
          </button>
        </div>
      </div>
    </main>
  );
};

export default InventoryCategoriesClient;