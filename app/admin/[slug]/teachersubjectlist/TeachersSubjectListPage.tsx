'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  IdentificationIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  PresentationChartLineIcon,
  MapPinIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

// --- Logic remains the same, UI is overhauled ---
const transformToClassroomHubs = (courses: any[]) => {
  const hubs: any[] = [];
  courses.forEach(course => {
    course.schedules.forEach((schedule: any) => {
      hubs.push({
        hubId: `${course.id}-${schedule.classroom?.id}`,
        courseId: course.id,
        courseTitle: course.title,
        classroomId: schedule.classroom?.id,
        classroomName: schedule.classroom?.name || "No Room Assigned",
        academicLevel: course.academicLevel.name,
        studentsCount: course.studentsEnrolled,
        schedule: schedule,
        fullCourse: course
      });
    });
  });
  return hubs;
};

export default function ClassroomDependentDashboard({
  teacherClasses,
  teacherUserId,
}: any) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  const classroomHubs = useMemo(() => transformToClassroomHubs(teacherClasses), [teacherClasses]);
  
  const filteredHubs = classroomHubs.filter(hub => 
    hub.classroomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hub.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-wider text-sm uppercase">
              <SparklesIcon className="h-5 w-5" />
              Teacher Workspace
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Classroom <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Hub</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-md">
              Welcome back. You have {classroomHubs.length} active sessions today.
            </p>
          </div>

          <div className="relative group w-full md:w-80">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search classes..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredHubs.map((hub) => (
              <ClassroomCard 
                key={hub.hubId} 
                hub={hub} 
                onAction={(path: string) => router.push(`/admin/${teacherUserId}/teachersubjectlist/${hub.courseId}/${path}?classroomId=${hub.classroomId}&scheduleId=${hub.schedule.id}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ClassroomCard({ hub, onAction }: any) {
  // Logic to determine if class is "Live" (Simplified for example)
  const isLive = false; // You could calculate this based on hub.schedule.startTime/endTime

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] transition-all duration-500 overflow-hidden flex flex-col h-full"
    >
      {/* Card Header: Context & Badges */}
      <div className="p-8 pb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-200 text-white">
              <UserGroupIcon className="h-7 w-7" />
            </div>
            {isLive && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100">
              {hub.academicLevel}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
            {hub.classroomName}
          </h2>
          <p className="text-slate-500 font-semibold text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            {hub.courseTitle}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-600">
            <ClockIcon className="h-4 w-4 text-indigo-500" />
            {hub.schedule.startTime} - {hub.schedule.endTime}
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold text-slate-600">
            <MapPinIcon className="h-4 w-4 text-indigo-500" />
            {hub.classroomName}
          </div>
        </div>
      </div>

      {/* Action Tabs - The Core Overhaul */}
      <div className="px-8 flex-grow">
         <div className="grid grid-cols-2 gap-3">
            <QuickAction 
              icon={IdentificationIcon} 
              label="Attendance" 
              onClick={() => onAction('take-course-attendance')}
              className="bg-blue-50/50 text-blue-700 hover:bg-blue-600 hover:text-white"
            />
            <QuickAction 
              icon={PresentationChartLineIcon} 
              label="Grades" 
              onClick={() => onAction('course-grades')}
              className="bg-emerald-50/50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
            />
            <QuickAction 
              icon={ClipboardDocumentCheckIcon} 
              label="Assignments" 
              onClick={() => onAction('manage-course-assignments')}
              className="bg-purple-50/50 text-purple-700 hover:bg-purple-600 hover:text-white"
            />
            <QuickAction 
              icon={ChatBubbleLeftRightIcon} 
              label="Chat" 
              onClick={() => onAction('send-message')}
              className="bg-pink-50/50 text-pink-700 hover:bg-pink-600 hover:text-white"
            />
         </div>

         {/* Secondary Actions Row */}
         <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
            <button onClick={() => onAction('student-course-roster')} className="text-[11px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1">
              <UserGroupIcon className="h-4 w-4" /> Roster
            </button>
            <button onClick={() => onAction('course-reports')} className="text-[11px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1">
              <DocumentChartBarIcon className="h-4 w-4" /> Reports
            </button>
            <button onClick={() => onAction('course-schedule')} className="text-[11px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" /> Schedule
            </button>
         </div>
      </div>

      {/* Footer Area */}
      <div className="mt-8 p-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
               <div className="w-full h-full bg-indigo-100" />
            </div>
          ))}
          <div className="h-8 w-8 rounded-full border-2 border-white bg-white flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm">
            +{hub.studentsCount - 3}
          </div>
        </div>

        {hub.schedule.meetingLink ? (
          <a 
            href={hub.schedule.meetingLink}
            target="_blank"
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <VideoCameraIcon className="h-4 w-4" />
            Launch
          </a>
        ) : (
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
            {hub.studentsCount} Students
          </span>
        )}
      </div>
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, onClick, className }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[1.5rem] transition-all duration-300 group/btn ${className}`}
    >
      <Icon className="h-6 w-6 transition-transform duration-300 group-hover/btn:scale-110" />
      <span className="text-[11px] font-black uppercase tracking-wide">{label}</span>
    </button>
  );
}