'use client';

import React, { useState, useMemo } from 'react';
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  BellAlertIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import SharedFamilyCalendar from './components/SharedFamilyCalendar';
import ChildSwitcher from './components/ChildSwitcher';

interface ParentDashboardProps {
  rawApiData: {
    stats: {
      totalChildren: number;
      familyPendingTasks: number;
      attendanceAlerts: number;
      announcements: any[];
    };
    children: any[]; // The detailed children array from our summary API
  };
  adminSlug: string;
}

export default function ParentDashboardClient({ rawApiData, adminSlug }: ParentDashboardProps) {
  // 1. Context State: Which child are we focusing on?
  const [activeChild, setActiveChild] = useState(rawApiData.children[0]);

  // 2. Computed family stats
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* HEADER: Welcome & Date */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Family Dashboard
          </h1>
          <p className="text-slate-500 font-medium">Monitoring {rawApiData.stats.totalChildren} students</p>
        </div>
        <div className="bg-white text-slate-600 px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 text-sm font-bold flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* SECTION 1: Family Pulse Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<UserGroupIcon className="h-6 w-6" />}
          label="Total Children"
          value={rawApiData.stats.totalChildren}
          color="bg-indigo-600"
        />
        <StatCard 
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
          label="Household Tasks"
          value={rawApiData.stats.familyPendingTasks}
          color="bg-amber-500"
        />
        <StatCard 
          icon={<BellAlertIcon className="h-6 w-6" />}
          label="Alerts"
          value={rawApiData.stats.attendanceAlerts}
          color={rawApiData.stats.attendanceAlerts > 0 ? "bg-rose-500" : "bg-emerald-500"}
          isAlert={rawApiData.stats.attendanceAlerts > 0}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* SECTION 2: Focused Child View (Left Column) */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Child Selector Bar */}
          <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4 pl-2">
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                {activeChild.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-slate-800 leading-none">{activeChild.name}</h3>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{activeChild.gradeLevel}</span>
              </div>
            </div>
            <ChildSwitcher 
              childrenList={rawApiData.children} 
              selectedChild={activeChild} 
              onChildChange={setActiveChild} 
            />
          </div>

          {/* Child Specific Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Status Card */}
            <div className="bg-indigo-900 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Right Now</p>
                <h4 className="text-xl font-bold">{activeChild.currentStatus}</h4>
                <div className="mt-4 flex items-center gap-2 text-sm text-indigo-200">
                  <ClockIcon className="h-4 w-4" />
                  <span>Room: {activeChild.roomName}</span>
                </div>
              </div>
              <BookOpenIcon className="absolute -right-4 -bottom-4 h-32 w-32 text-indigo-800 opacity-50" />
            </div>

            {/* Performance Card */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Academic Standing</p>
                <h4 className="text-2xl font-black text-slate-800">{activeChild.recentGrade || 'N/A'}</h4>
                <p className="text-xs text-slate-500 mt-1">Latest Average Grade</p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                {activeChild.recentGrade ? 'Good' : '--'}
              </div>
            </div>
          </div>

          {/* Priority Tasks Table */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-500" /> Pending Assignments
              </h3>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">View Full List</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Assignment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeChild.totalPendingTasks > 0 ? (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">See all {activeChild.totalPendingTasks} tasks</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg">INCOMPLETE</span></td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">Upcoming</td>
                    </tr>
                  ) : (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic text-sm">No pending tasks for {activeChild.name}!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 3: Global Family Feed (Right Column) */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Unified Calendar View */}
          <SharedFamilyCalendar childrenData={rawApiData.children} />

          {/* Announcements/Bulletins */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <MegaphoneIcon className="h-5 w-5 text-rose-500" /> School Bulletins
            </h3>
            <div className="space-y-3">
              {rawApiData.stats.announcements?.map((msg, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{msg.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for Stats
function StatCard({ icon, label, value, color, isAlert }: any) {
  return (
    <div className={`p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02] ${isAlert ? 'ring-2 ring-rose-100' : ''}`}>
      <div className={`${color} p-3.5 rounded-2xl text-white shadow-lg`}>
        {icon}
      </div>
      <div>
        <h4 className="text-2xl font-black text-slate-900 leading-none">{value}</h4>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}