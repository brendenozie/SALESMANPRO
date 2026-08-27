"use client";
import React from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: "emerald" | "rose" | "indigo" | "blue";
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-100 border-emerald-200",
    rose: "text-rose-600 bg-rose-100 border-rose-200",
    indigo: "text-indigo-600 bg-indigo-100 border-indigo-200",
    blue: "text-blue-600 bg-blue-100 border-blue-200",
  };

  return (
    <div className="relative group overflow-hidden p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-500">
      {/* Background Glow */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity bg-${color === 'blue' ? 'blue' : color}-400`} />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-2xl border ${colorMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Real-time</span>
      </div>

      <div className="relative z-10">
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;