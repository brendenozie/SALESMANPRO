'use client';

import React from 'react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: SummaryCardProps) {
  return (
    <div
      className={`${color} rounded-3xl p-6 text-white shadow-xl relative overflow-hidden font-sans`}
    >
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <Icon className="h-28 w-28" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-black opacity-70">
            {title}
          </p>
          <h3 className="text-4xl font-black mt-2">{value}</h3>
        </div>

        <div className="p-3 rounded-2xl bg-white/15">
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
}