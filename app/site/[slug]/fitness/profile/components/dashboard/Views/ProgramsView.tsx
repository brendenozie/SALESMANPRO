'use client';

import React from 'react';
import { BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

export default function ProgramsView() {
  return (
    <div className="pb-10">
      <div className="pt-10 px-8 mb-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Programs</h1>
        <p className="text-gray-500 mt-2 font-medium">Track your long-term fitness journeys.</p>
      </div>

      <div className="max-w-7xl mx-auto px-8 space-y-6">
        <ProgramCard 
          title="28-Day Marathon Prep"
          description="Build endurance and stamina for your upcoming marathon with structured progressive overload."
          progress={45}
          totalWeeks={4}
          currentWeek={2}
          image="https://images.unsplash.com/photo-1552674605-db6afe44f039?q=80&w=2070&auto=format&fit=crop"
        />
        <ProgramCard 
          title="Hypertropy Foundations"
          description="A 12-week muscle building program focusing on compound lifts and perfect form."
          progress={12}
          totalWeeks={12}
          currentWeek={2}
          image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
        />
      </div>
    </div>
  );
}

function ProgramCard({ title, description, progress, totalWeeks, currentWeek, image }: any) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 md:h-auto md:w-1/3 relative">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50 md:to-transparent md:bg-gradient-to-t"></div>
      </div>
      <div className="p-8 md:w-2/3 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-black text-gray-900">{title}</h3>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-lg">Week {currentWeek} of {totalWeeks}</span>
        </div>
        <p className="text-gray-500 font-medium mb-6 leading-relaxed">{description}</p>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> {progress}% Completed
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}