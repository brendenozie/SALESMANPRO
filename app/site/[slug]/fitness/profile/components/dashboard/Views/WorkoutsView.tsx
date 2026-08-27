'use client';

import React from 'react';
import { PlayIcon, PlusIcon, BoltIcon, FireIcon } from '@heroicons/react/24/solid';
import { ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function WorkoutsView() {
  return (
    <div className="pb-10">
      <div className="pt-10 px-8 mb-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Workouts</h1>
        <p className="text-gray-500 mt-2 font-medium">Manage your routines and start training.</p>
      </div>

      <div className="max-w-7xl mx-auto px-8 space-y-8">
        {/* Featured / Active Workout */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mt-10 -mr-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-lg mb-4 uppercase tracking-wider">
                Up Next
              </span>
              <h2 className="text-3xl font-black mb-2">Upper Body Power</h2>
              <div className="flex items-center gap-4 text-gray-300 text-sm font-medium">
                <span className="flex items-center gap-1.5"><ClockIcon className="w-5 h-5" /> 45 Mins</span>
                <span className="flex items-center gap-1.5"><FireIcon className="w-5 h-5 text-orange-400" /> High Intensity</span>
              </div>
            </div>
            <button className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-gray-900 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
              <PlayIcon className="w-6 h-6" /> Start Session
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Your Templates</h3>
            <button className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700">
              <PlusIcon className="w-5 h-5" /> Create New
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <WorkoutCard title="Push Day (Chest/Triceps)" duration="60 min" level="Advanced" color="emerald" />
            <WorkoutCard title="Pull Day (Back/Biceps)" duration="55 min" level="Intermediate" color="blue" />
            <WorkoutCard title="Leg Day Core" duration="70 min" level="Advanced" color="red" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkoutCard({ title, duration, level, color }: { title: string, duration: string, level: string, color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
  };
  const badgeClass = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${badgeClass}`}>
        <BoltIcon className="w-6 h-6" />
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">{title}</h4>
      <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
        <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> {duration}</span>
        <span className="flex items-center gap-1.5"><ChartBarIcon className="w-4 h-4" /> {level}</span>
      </div>
    </div>
  );
}