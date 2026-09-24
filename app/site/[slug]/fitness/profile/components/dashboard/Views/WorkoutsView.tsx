'use client';

import React from 'react';
import Link from 'next/link';
import { BoltIcon, FireIcon, PlayIcon, PlusIcon } from '@heroicons/react/24/solid';
import { ClockIcon, ChartBarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

interface WorkoutsViewProps {
  trainingPlans?: any[];
  slug?: string;
}

export default function WorkoutsView({ trainingPlans = [], slug = 'fitness' }: WorkoutsViewProps) {
  return (
    <div className="pb-10">
      <div className="pt-10 px-8 mb-8 max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Training Plans</h1>
          <p className="text-gray-500 mt-2 font-medium">Personalized workout regimens, sets, reps, and trainer routines.</p>
        </div>
        <Link href={`/site/${slug}/fitness/trainers`}>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md">
            <PlusIcon className="w-4 h-4" /> Book Trainer Session
          </button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-8 space-y-8">
        {trainingPlans.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <BoltIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Training Plans Assigned Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Your personal trainer or coach will assign customized workout plans, daily splits, and exercise regimens to your profile.
            </p>
            <Link href={`/site/${slug}/fitness/trainers`}>
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                Find a Personal Trainer
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingPlans.map((plan) => (
              <div 
                key={plan.id} 
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-emerald-50 text-emerald-600">
                    <BoltIcon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {plan.status || 'ACTIVE'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {plan.weeksCount ? `${plan.weeksCount} Weeks` : 'Personal Plan'}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h4>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                    {plan.description || 'Customized training splits, sets, and progressions.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4 text-emerald-600" />
                    {plan.daysPerWeek ? `${plan.daysPerWeek} Days/Week` : 'Structured Routine'}
                  </span>
                  <span className="text-emerald-600 font-bold hover:underline cursor-pointer">
                    View Plan →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}