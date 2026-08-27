"use client";

import React, { useState, useMemo } from "react";
import { 
  RocketLaunchIcon, 
  TagIcon, 
  SparklesIcon, 
  BoltIcon,
  PlusIcon,
  StopCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { format, parseISO } from "date-fns";

export type Promotion = {
  id: string;
  title: string;
  type: "Flash Sale" | "BOGO" | "Seasonal" | "Discount";
  discountValue: string; // e.g., "20%" or "Buy 1 Get 1"
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "expired";
  targetProductCount: number;
};

interface Props {
  initialPromotions: Promotion[];
}

export default function PromotionsClient({ initialPromotions }: Props) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredPromos = useMemo(() => {
    if (activeTab === "all") return initialPromotions;
    return initialPromotions.filter(p => p.status === activeTab);
  }, [initialPromotions, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#03050a] p-4 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              <span className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <RocketLaunchIcon className="h-8 w-8 text-rose-600 dark:text-rose-400" />
              </span>
              Campaign <span className="text-rose-600 dark:text-rose-400">Manager</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium italic">Drive website traffic with high-converting product offers.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-[1.5rem] font-black shadow-lg shadow-rose-500/20 transition-all active:scale-95 uppercase text-xs tracking-widest">
            <PlusIcon className="h-5 w-5" />
            <span>Create Campaign</span>
          </button>
        </header>

        {/* Status Filter Tabs */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {["all", "active", "scheduled", "expired"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                activeTab === tab 
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xl" 
                : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 hover:border-rose-500/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredPromos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
          
          {/* New Campaign Placeholder */}
          <div className="border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-12 group cursor-pointer hover:border-rose-500/50 transition-colors">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <SparklesIcon className="h-8 w-8 text-slate-400 group-hover:text-rose-500" />
            </div>
            <p className="font-black text-slate-400 uppercase text-xs tracking-widest group-hover:text-rose-500">Add New Promo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

const PromoCard = ({ promo }: { promo: Promotion }) => {
  const isExpired = promo.status === "expired";
  
  const typeIcons: any = {
    "Flash Sale": <BoltIcon className="h-5 w-5" />,
    "BOGO": <TagIcon className="h-5 w-5" />,
    "Seasonal": <SparklesIcon className="h-5 w-5" />,
    "Discount": <TagIcon className="h-5 w-5" />
  };

  return (
    <div className={`relative group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl transition-all hover:-translate-y-2 ${isExpired ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      {/* Dynamic Status Badge */}
      <div className="absolute top-6 right-8">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          promo.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
          promo.status === 'scheduled' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
          'bg-slate-500/10 text-slate-500 border-slate-500/20'
        }`}>
          {promo.status}
        </span>
      </div>

      {/* Promotion Type Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
          {typeIcons[promo.type]}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{promo.type}</p>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{promo.title}</h2>
        </div>
      </div>

      {/* Hero Discount Display */}
      <div className="bg-slate-50 dark:bg-black/40 rounded-[2rem] p-6 mb-8 text-center border border-slate-100 dark:border-slate-800">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Benefit</p>
        <p className="text-4xl font-black text-rose-500 tracking-tighter italic">{promo.discountValue}</p>
      </div>

      {/* Info Rows */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-widest">Duration</span>
          <span className="font-black text-slate-700 dark:text-slate-200">
            {format(parseISO(promo.startDate), "MMM dd")} - {format(parseISO(promo.endDate), "MMM dd")}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-widest">Products Applied</span>
          <span className="font-black text-indigo-500">{promo.targetProductCount} Items</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="grid grid-cols-4 gap-2">
        <button title="View Performance" className="col-span-1 p-3 flex justify-center bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-indigo-500 hover:text-white transition-colors">
          <EyeIcon className="h-5 w-5" />
        </button>
        <button title="Edit Campaign" className="col-span-1 p-3 flex justify-center bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-amber-500 hover:text-white transition-colors">
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button title="Stop Campaign" className="col-span-1 p-3 flex justify-center bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-rose-500 hover:text-white transition-colors">
          <StopCircleIcon className="h-5 w-5" />
        </button>
        <button title="Delete" className="col-span-1 p-3 flex justify-center bg-slate-100 dark:bg-slate-800/50 rounded-xl hover:bg-red-600 hover:text-white transition-colors">
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};