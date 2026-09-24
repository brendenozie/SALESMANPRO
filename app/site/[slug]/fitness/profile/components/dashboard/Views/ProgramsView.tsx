'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpenIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface ProgramsViewProps {
  programs?: any[];
  slug?: string;
}

export default function ProgramsView({ programs = [], slug = 'fitness' }: ProgramsViewProps) {
  return (
    <div className="pb-10">
      <div className="pt-10 px-8 mb-8 max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Programs & Courses</h1>
          <p className="text-gray-500 mt-2 font-medium">Authoritative view of all active digital training programs and courses.</p>
        </div>
        <Link href={`/site/${slug}/fitness/listings`}>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md">
            <SparklesIcon className="w-4 h-4" /> Explore Catalogue
          </button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-8 space-y-6">
        {programs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <BookOpenIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Programs Enrolled Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              You do not have any active course enrollments or program subscriptions yet. Browse our library of training courses to start your journey.
            </p>
            <Link href={`/site/${slug}/fitness/listings`}>
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                Browse Training Programs
              </button>
            </Link>
          </div>
        ) : (
          programs.map((prog: any) => {
            const course = prog.course || prog;
            const progressVal = prog.progress ?? (prog.status === 'ENROLLED' ? 10 : 0);
            return (
              <div 
                key={prog.id || course.id} 
                className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 md:h-auto md:w-1/3 relative bg-gray-100">
                  <img 
                    src={course.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'} 
                    alt={course.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 md:to-transparent md:bg-gradient-to-t"></div>
                </div>
                <div className="p-8 md:w-2/3 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-black text-gray-900">{course.title}</h3>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg">
                      {prog.status || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-gray-500 font-medium mb-6 leading-relaxed line-clamp-2">
                    {course.description || 'Full curriculum access with workout modules and video guides.'}
                  </p>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> {progressVal}% Completed
                      </span>
                      <Link href={`/site/${slug}/fitness/listings/${course.id}`}>
                        <span className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Continue Training →</span>
                      </Link>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressVal}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}