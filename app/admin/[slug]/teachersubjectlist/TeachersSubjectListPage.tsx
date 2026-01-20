'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  IdentificationIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  PresentationChartLineIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

// --- Logic Helpers ---
const getTodayName = () => new Date().toLocaleDateString("en-US", { weekday: "long" });

const isLive = (schedule: any) => {
  if (!schedule) return false;
  const now = new Date();
  const [sh, sm] = schedule.startTime.split(":").map(Number);
  const [eh, em] = schedule.endTime.split(":").map(Number);
  const start = new Date().setHours(sh, sm, 0);
  const end = new Date().setHours(eh, em, 0);
  return now.getTime() >= start && now.getTime() <= end;
};

export default function PremiumTeacherDashboard({ teacherClasses, teacherUserId }: any) {
  const [search, setSearch] = useState("");
  const today = getTodayName();

  const filtered = useMemo(() => 
    teacherClasses.filter((c: any) => c.title.toLowerCase().includes(search.toLowerCase())),
    [teacherClasses, search]
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 selection:bg-indigo-500/30 pb-20 font-sans">
      {/* Immersive Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-8 bg-indigo-500 rounded-full" />
                <span className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-[10px]">Command Center</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
              Study<span className="text-indigo-500">Flow</span>
            </h1>
          </div>

          <div className="relative group w-full md:w-80">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search courses..."
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-xl transition-all"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode='popLayout'>
            {filtered.map((course: any) => (
              <CourseCommanderCard 
                key={course.id} 
                course={course} 
                teacherUserId={teacherUserId}
                today={today}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function CourseCommanderCard({ course, teacherUserId, today }: any) {
  const router = useRouter();
  
  // Group unique classrooms
  const classrooms = useMemo(() => {
    const seen = new Set();
    return course.schedules.reduce((acc: any[], s: any) => {
      if (!seen.has(s.classroom?.id)) {
        seen.add(s.classroom?.id);
        acc.push(s);
      }
      return acc;
    }, []);
  }, [course.schedules]);

  const [activeSchedule, setActiveSchedule] = useState(
    classrooms.find((s: any) => isLive(s)) || classrooms[0]
  );

  const liveNow = isLive(activeSchedule);

  const handleAction = (path: string) => {
    router.push(`/admin/${teacherUserId}/teachersubjectlist/${course.id}/${path}?classroomId=${activeSchedule.classroom?.id}&scheduleId=${activeSchedule.id}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-slate-800/40 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl hover:border-indigo-500/50 transition-colors duration-500"
    >
      {/* Decorative Gradient Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl transition-colors duration-700 ${liveNow ? 'bg-indigo-500/40' : 'bg-slate-500/20'}`} />

      <div className="p-8">
        {/* Header: Title & Classroom Switcher */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-black text-white group-hover:text-indigo-300 transition-colors">{course.title}</h3>
              <p className="text-slate-400 font-medium text-sm mt-1 flex items-center gap-2">
                <AcademicCapIcon className="h-4 w-4" /> {course.academicLevel?.name}
              </p>
            </div>
            {liveNow && (
               <div className="px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-bounce">
                 LIVE NOW
               </div>
            )}
          </div>

          {/* Intuitive Tab Switcher */}
          <div className="flex p-1.5 bg-black/20 rounded-2xl w-fit min-h-12 gap-2">
            {classrooms.map((s: any) => (
              <button
                key={s.id}
                onClick={() => setActiveSchedule(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeSchedule.classroom?.id === s.classroom?.id 
                  ? 'bg-white text-slate-900 shadow-lg' 
                  : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.classroom?.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Info Section */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Schedule</p>
            <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-bold text-white">{activeSchedule?.startTime} - {activeSchedule?.endTime}</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Roster</p>
            <div className="flex items-center gap-2">
                <UserGroupIcon className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-bold text-white">{course.studentsEnrolled || 0} Enrolled</span>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {activeSchedule ?
            <>
              <div className='min-h-[11rem] col-span-2 sm:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3'>
                <QuickAction 
                  icon={IdentificationIcon} 
                  label="Attendance" 
                  onClick={() => handleAction('take-course-attendance')} 
                  color="indigo"
                />
                <QuickAction 
                  icon={PresentationChartLineIcon} 
                  label="Grades" 
                  onClick={() => handleAction('course-grades')} 
                  color="fuchsia"
                />
                <QuickAction 
                  icon={ClipboardDocumentCheckIcon} 
                  label="Assignments" 
                  onClick={() => handleAction('manage-course-assignments')} 
                  color="amber"
                />
                <QuickAction 
                  icon={IdentificationIcon} 
                  label="Roster" 
                  onClick={() => handleAction('student-course-roster')} 
                  color="emerald"
                />
                <QuickAction 
                  icon={PresentationChartLineIcon} 
                  label="Reports" 
                  onClick={() => handleAction('course-reports')} 
                  color="violet"
                />
                <QuickAction 
                  icon={ClipboardDocumentCheckIcon} 
                  label="Schedule" 
                  onClick={() => handleAction('course-schedule')} 
                  color="lime"
                />
                <QuickAction 
                  icon={PresentationChartLineIcon} 
                  label="Class Events" 
                  onClick={() => handleAction('course-event')} 
                  color="rose"
                />
                <QuickAction 
                  icon={ChatBubbleLeftRightIcon} 
                  label="Chat" 
                  onClick={() => handleAction('send-message')} 
                  color="cyan"
                />
              </div>
            </>
          : <div className="col-span-4 text-center text-slate-400 italic min-h-[11rem]">No classroom schedules available.</div>
    }
        </div>
      </div>

      {/* Footer / Link to Hub */}
      <button 
        onClick={() => handleAction('course-resources')}
        className="w-full py-5 bg-white/5 hover:bg-indigo-500 transition-all duration-500 group/btn flex items-center justify-center gap-2 border-t border-white/5"
      >
        <span className="text-xs font-black uppercase tracking-widest group-hover/btn:text-white transition-colors">Enter Learning Hub</span>
        <ArrowRightIcon className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, onClick, color }: any) {
  const themes: any = {
    indigo: 'group-hover:bg-white/10 group-hover:text-indigo-400 border-indigo-500/0',
    fuchsia: 'group-hover:bg-white/10 group-hover:text-fuchsia-400 border-fuchsia-500/0',
    amber: 'group-hover:bg-white/10 group-hover:text-amber-400 border-amber-500/0',
    emerald: 'group-hover:bg-white/10 group-hover:text-emerald-400 border-emerald-500/0',
    violet: 'group-hover:bg-white/10 group-hover:text-violet-400 border-violet-500/0',
    rose: 'group-hover:bg-white/10 group-hover:text-rose-400 border-white/10',
    sky: 'group-hover:bg-white/10 group-hover:text-sky-400 border-white/10',
    lime: 'group-hover:bg-white/10 group-hover:text-lime-400 border-white/10',
    cyan: 'group-hover:bg-white/10 group-hover:text-cyan-400 border-white/10',
    "": 'group-hover:bg-white/10 group-hover:text-white border-white/10',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[2rem] bg-white/5 border transition-all duration-300 group ${themes[color]}`}
    >
      <Icon className="h-6 w-6 transition-transform group-hover:scale-110" />
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}