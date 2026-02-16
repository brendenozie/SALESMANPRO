'use client';
import React, { useState } from 'react';
import { PencilSquareIcon, TrashIcon, MapPinIcon, AcademicCapIcon, BoltIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function ChildrenClientPage({ initialData, adminSlug }: any) {
  const [children] = useState(initialData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {children.map((child: any) => (
        <div key={child.id} className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
          {/* Top Decorative Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={child.profileImageUrl}
                  alt={child.name}
                  width={80}
                  height={80}
                  className="rounded-2xl object-cover ring-4 ring-slate-50"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-sm" title="Active in School" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900">{child.name}</h3>
                <p className="text-sm text-indigo-600 font-semibold">{child.grade}</p>
                <p className="text-xs text-slate-400 flex items-center mt-1">
                  <MapPinIcon className="h-3 w-3 mr-1" /> {child.schoolName}
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-slate-50 p-3 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Grade</p>
                <p className="text-lg font-bold text-slate-800">{child.avgGrade}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Attend.</p>
                <p className="text-lg font-bold text-slate-800">{child.attendance}%</p>
              </div>
              <div className="bg-rose-50 p-3 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">Tasks</p>
                <p className="text-lg font-bold text-rose-600">{child.pendingAssignments}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
              <button className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition">
                <BoltIcon className="h-4 w-4 mr-1 text-amber-500" />
                Live Status
              </button>
              
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-indigo-600">
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-rose-50 rounded-xl transition text-slate-400 hover:text-rose-600">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}