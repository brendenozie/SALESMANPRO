'use client';

import React, { useState, useMemo } from 'react';
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
  CalendarDaysIcon,
  ArrowUpRightIcon,
  AcademicCapIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

// --- Logic Helpers ---
const getTodayName = () => new Date().toLocaleDateString("en-US", { weekday: "long" });

const isLive = (schedule: any) => {
  const now = new Date();
  const [sh, sm] = schedule.startTime.split(":").map(Number);
  const [eh, em] = schedule.endTime.split(":").map(Number);
  const start = new Date().setHours(sh, sm, 0);
  const end = new Date().setHours(eh, em, 0);
  return now.getTime() >= start && now.getTime() <= end;
};

export default function PremiumTeacherDashboard({ teacherClasses, teacherUserId }: any) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const today = getTodayName();

  const courses = useMemo(() => teacherClasses.map((course: any) => ({
    ...course,
    isCurrentlyLive: course.schedules.some((s: any) => s.day === today && isLive(s))
  })), [teacherClasses, today]);

  const filtered = courses.filter((c: any) => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 selection:bg-indigo-500/30 pb-20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16">
        {/* Top Navigation / Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h4 className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-xs mb-2">Internal Workspace</h4>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 lg:text-6xl">
              Course <span className="text-indigo-600">Commander</span>
            </h1>
            <p className="mt-4 text-slate-500 text-lg font-medium">Managing {courses.length} educational tracks for the current semester.</p>
          </motion.div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full lg:w-96">
              <MagnifyingGlassIcon className="h-6 w-6 ml-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Find a course..."
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-5 text-sm font-medium focus:outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          <AnimatePresence>
            {filtered.map((course: any) => (
              <CourseBentoCard 
                key={course.id} 
                course={course} 
                onAction={(path: string) => {
                  const s = course.schedules[0]; // Logic for default schedule
                  router.push(`/admin/${teacherUserId}/teachersubjectlist/${course.id}/${path}?classroomId=${s?.classroom?.id}&scheduleId=${s?.id}`);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function CourseBentoCard({ course, onAction }: any) {
  const today = getTodayName();
  const liveSession = course.schedules.find((s: any) => s.day === today && isLive(s));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className={`relative flex flex-col h-full bg-white/70 backdrop-blur-xl rounded-[2.5rem] border transition-all duration-500 p-2 ${
        liveSession 
          ? 'border-indigo-400 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)]' 
          : 'border-white shadow-xl shadow-slate-200/50'
      }`}
    >
      {/* Top Section: Visual Branding */}
      <div className={`p-6 rounded-[2rem] mb-2 ${liveSession ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'} relative overflow-hidden group/header`}>
        {/* Animated Background Pattern */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/header:scale-110 transition-transform duration-700">
           <AcademicCapIcon className="h-32 w-32 rotate-12" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest">
              {course.academicLevel?.name || 'Standard'}
            </span>
            {liveSession && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500 rounded-full text-[10px] font-black animate-pulse shadow-lg shadow-red-500/50">
                <span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE
              </div>
            )}
          </div>
          <h2 className="text-2xl font-black leading-tight mb-1">{course.title}</h2>
          <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
             <UserGroupIcon className="h-4 w-4" />
             {course.studentsEnrolled} Students
          </div>
        </div>
      </div>

      {/* Schedule Quick-Look */}
      <div className="px-6 py-4 flex flex-col gap-3">
        {course.schedules.filter((s: any) => s.day === today).map((s: any) => (
          <div key={s.id} className={`flex items-center justify-between p-4 rounded-2xl border ${isLive(s) ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-transparent'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isLive(s) ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                <ClockIcon className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-xs font-black uppercase ${isLive(s) ? 'text-indigo-600' : 'text-slate-400'}`}>Today's Session</p>
                <p className="text-sm font-bold text-slate-700">{s.startTime} — {s.endTime}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">Room</p>
              <p className="text-xs font-bold text-slate-600">{s.classroom?.name || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bento Grid Actions */}
      <div className="p-4 grid grid-cols-2 gap-3 mt-auto">
        <ActionButton 
          icon={IdentificationIcon} 
          label="Attendance" 
          sub="Who's here?" 
          color="blue"
          onClick={() => onAction('take-course-attendance')} 
        />
        <ActionButton 
          icon={PresentationChartLineIcon} 
          label="Grades" 
          sub="Performance"
          color="emerald" 
          onClick={() => onAction('course-grades')} 
        />
        <ActionButton 
          icon={ClipboardDocumentCheckIcon} 
          label="Assignments" 
          sub="3 Pending"
          color="violet" 
          onClick={() => onAction('manage-course-assignments')} 
        />
        <ActionButton 
          icon={ChatBubbleLeftRightIcon} 
          label="Messages" 
          sub="Student Chat"
          color="pink" 
          onClick={() => onAction('send-message')} 
        />
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
         <div className="flex gap-4">
           <button onClick={() => onAction('student-course-roster')} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Roster"><UserGroupIcon className="h-5 w-5" /></button>
           <button onClick={() => onAction('course-reports')} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Reports"><ChartBarIcon className="h-5 w-5" /></button>
           <button onClick={() => onAction('course-schedule')} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Schedule"><CalendarDaysIcon className="h-5 w-5" /></button>
         </div>
         
         {liveSession?.meetingLink ? (
           <a 
            href={liveSession.meetingLink}
            target="_blank"
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200"
           >
             <VideoCameraIcon className="h-4 w-4" /> Start
           </a>
         ) : (
           <button onClick={() => onAction('class-resources')} className="flex items-center gap-1 text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-tighter">
             View Hub <ArrowUpRightIcon className="h-3 w-3" />
           </button>
         )}
      </div>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, label, sub, color, onClick }: any) {
  const colors: any = {
    blue: 'hover:bg-blue-50 text-blue-600 border-blue-50',
    emerald: 'hover:bg-emerald-50 text-emerald-600 border-emerald-50',
    violet: 'hover:bg-violet-50 text-violet-600 border-violet-50',
    pink: 'hover:bg-pink-50 text-pink-600 border-pink-50',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-300 group ${colors[color]}`}
    >
      <Icon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
      <p className="text-xs font-black uppercase tracking-tight leading-none mb-1">{label}</p>
      <p className="text-[10px] font-medium opacity-60 leading-none">{sub}</p>
    </button>
  );
}