'use client';

import React, { useState } from 'react';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  MapPinIcon, 
  AcademicCapIcon, 
  BoltIcon, 
  ArrowRightIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

const loader = ({ src }: { src: string }) => src;

export default function ChildrenClientPage({ initialData, adminSlug }: any) {
  const [children, setChildren] = useState(initialData);

  // This handles the navigation to the details page we discussed (Grades, Schedules, etc.)
  const getDetailPath = (studentId: string, section: string) => {
    return `/admin/${adminSlug}/parentchildren/${studentId}/${section}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {children.map((child: any) => (
        <div key={child.id} className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
          {/* Top Decorative Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="p-6 flex-grow">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={child.profileImageUrl || `https://via.placeholder.com/150/C0C0C0/FFFFFF?text=${child.name.charAt(0)}`}
                  alt={child.name}
                  loader={loader}
                  width={80}
                  height={80}
                  className="rounded-2xl object-cover ring-4 ring-slate-50 aspect-square"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-sm" title="Active in School" />
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-slate-900">{child.name}</h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-bold uppercase tracking-wider">
                    Age {child.age}
                  </span>
                </div>
                <p className="text-sm text-indigo-600 font-semibold">{child.grade}</p>
                <p className="text-xs text-slate-400 flex items-center mt-1">
                  <MapPinIcon className="h-3 w-3 mr-1" /> {child.schoolName}
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-transparent hover:border-indigo-100 transition-colors">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Grade</p>
                <p className="text-lg font-bold text-slate-800">{child.avgGrade}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-transparent hover:border-indigo-100 transition-colors">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Attend.</p>
                <p className="text-lg font-bold text-slate-800">{child.attendance}%</p>
              </div>
              <div className="bg-rose-50 p-3 rounded-2xl text-center border border-transparent hover:border-rose-100 transition-colors">
                <p className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">Tasks</p>
                <p className="text-lg font-bold text-rose-600">{child.pendingAssignments}</p>
              </div>
            </div>

            {/* Deep Link Navigation */}
            <div className="mt-6 space-y-2">
              <Link 
                href={getDetailPath(child.id, 'academics')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all group/link"
              >
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="h-5 w-5 text-indigo-500 group-hover/link:text-white" />
                  <span className="text-sm font-medium">Grades & Performance</span>
                </div>
                <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </Link>

              <Link 
                href={getDetailPath(child.id, 'schedule')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-600 hover:text-white transition-all group/link"
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-purple-500 group-hover/link:text-white" />
                  <span className="text-sm font-medium">Class Schedule</span>
                </div>
                <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </Link>

              <Link 
                href={getDetailPath(child.id, 'assignments')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-amber-600 hover:text-white transition-all group/link"
              >
                <div className="flex items-center gap-3">
                  <ClipboardDocumentCheckIcon className="h-5 w-5 text-amber-500 group-hover/link:text-white" />
                  <span className="text-sm font-medium">Active Assignments</span>
                </div>
                <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </Link>

              <Link 
                href={getDetailPath(child.id, 'attendance')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-rose-600 hover:text-white transition-all group/link"
              >
                <div className="flex items-center gap-3">
                  <BoltIcon className="h-5 w-5 text-rose-500 group-hover/link:text-white" />
                  <span className="text-sm font-medium">Attendance</span>
                </div>
                <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between">
             {/* <Link 
                href={`/admin/${adminSlug}/parentchildren/${child.id}`}
                className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-widest"
              >
                Full Profile
              </Link> */}
            
            <div className="flex gap-1">
              {/* <button 
                title="Edit Student Info"
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition text-slate-400 hover:text-indigo-600"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button 
                title="Remove from Dashboard"
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition text-slate-400 hover:text-rose-600"
              >
                <TrashIcon className="h-5 w-5" />
              </button> */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}