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
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 glow-emerald-500/10",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 glow-rose-500/10",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 glow-indigo-500/10",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 glow-blue-500/10",
  };

  return (
    <div className="relative group overflow-hidden p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all duration-500">
      {/* Background Glow */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity bg-${color === 'blue' ? 'blue' : color}-500`} />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Real-time</span>
      </div>

      <div className="relative z-10">
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;