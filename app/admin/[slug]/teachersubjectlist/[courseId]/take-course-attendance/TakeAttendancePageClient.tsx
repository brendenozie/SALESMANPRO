'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  QuestionMarkCircleIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const STATUS_MAP = {
  PRESENT: { label: 'Present', color: 'text-emerald-600', bg: 'bg-emerald-50', active: 'bg-emerald-600', icon: CheckCircleIcon },
  ABSENT: { label: 'Absent', color: 'text-rose-600', bg: 'bg-rose-50', active: 'bg-rose-600', icon: XCircleIcon },
  TARDY: { label: 'Tardy', color: 'text-amber-600', bg: 'bg-amber-50', active: 'bg-amber-600', icon: ClockIcon },
  EXCUSED: { label: 'Excused', color: 'text-blue-600', bg: 'bg-blue-50', active: 'bg-blue-600', icon: QuestionMarkCircleIcon },
};

export default function TakeAttendancePageClient({
  course,
  students,
  initialAttendance,
  classroomId,  
  educatorId,
  scheduleId,
}: any) {
  
  const [showHistory, setShowHistory] = useState(false);

  const router = useRouter();
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentAttendance, setStudentAttendance] = useState<{ [studentId: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
    // 1. Sync local state when props from server change
    useEffect(() => {
      const state: any = {};
      students.forEach((s: any) => {
        state[s.id] = initialAttendance[s.id] || 'PRESENT';
      });
      setStudentAttendance(state);
    }, [students, initialAttendance]);
  
    // 2. Fetch function when date changes
    const fetchForDate = async (date: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/teacher/courses/${course.id}/attendance-data?educatorId=${educatorId}&date=${date}&scheduleId=${scheduleId}&classroomId=${classroomId}`
        );
        const result = await res.json();
        if (res.ok) {
          const newState: any = {};
          students.forEach((s: any) => {
            newState[s.id] = result.data.existingAttendance[s.id] || 'PRESENT';
          });
          setStudentAttendance(newState);
        }
      } catch (error) {
        console.error("Failed to fetch", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (attendanceDate !== new Date().toISOString().split('T')[0]) {
          fetchForDate(attendanceDate);
      }
    }, [attendanceDate]);
  
    // 3. Updated Save Function
    const handleSaveAttendance = async () => {
      setLoading(true);
      try {
        const payload = {
          courseId: course.id,
          scheduleId,
          classroomId,
          academicLevelId: course.academicLevelId,
          date: attendanceDate,
          educatorId,
          attendance: studentAttendance,
        };
  
        const res = await fetch(`/api/teacher/courses/${course.id}/attendance-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
  
        if (res.ok) {
          alert("Attendance saved successfully!");
        }
      } catch (err) {
        alert("Error saving attendance");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    const state: any = {};
    students.forEach((s: any) => {
      state[s.id] = initialAttendance[s.id] || 'PRESENT';
    });
    setStudentAttendance(state);
  }, [students, initialAttendance]);

  const filteredStudents = students.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans antialiased">
      {/* --- TOP NAVIGATION --- */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800">{course.title}</h1>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                <span className="px-2 py-0.5 bg-slate-100 rounded text-indigo-600">Room </span>
                <ChevronRightIcon className="h-3 w-3" />
                <span>Attendance Management</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ChartBarIcon className="h-5 w-5" />
              History
            </button>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
              <input 
                type="date" 
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        {/* --- STATS OVERVIEW --- */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Students</p>
            <p className="text-3xl font-black mt-1 text-slate-800">{students.length}</p>
          </div>
          <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 shadow-sm">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Present Today</p>
            <p className="text-3xl font-black mt-1 text-emerald-700">
              {Object.values(studentAttendance).filter(v => v === 'PRESENT').length}
            </p>
          </div>
          {/* Add more stats here if needed */}
        </section>

        {/* --- SEARCHBAR --- */}
        <div className="relative mb-8 group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search for a student..."
            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent shadow-xl shadow-slate-200/50 rounded-3xl outline-none focus:border-indigo-500/20 transition-all text-lg font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- STUDENT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student: any) => (
            <div key={student.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  {student.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 leading-tight">{student.name}</h3>
                  <p className="text-sm font-bold text-slate-400">ID: {student.id.split('-')[0]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(STATUS_MAP).map(([key, config]) => {
                  const isSelected = studentAttendance[student.id] === key;
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setStudentAttendance(prev => ({...prev, [student.id]: key}))}
                      className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all duration-200 border-2
                        ${isSelected 
                          ? `${config.active} border-transparent text-white shadow-lg shadow-${config.active}/20 scale-[1.02]` 
                          : `bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-50`
                        }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : config.color}`} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- HISTORY SIDEBAR (Slide-over) --- */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <ArrowPathIcon className="h-6 w-6 text-indigo-600" />
              Attendance History
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-700">Oct {20 - i}, 2025</p>
                    <p className="text-xs text-slate-400 font-bold uppercase">Average: 94%</p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-slate-300" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* --- FLOATING SAVE BAR --- */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6">
        <button
          onClick={handleSaveAttendance}
          disabled={loading}
          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] shadow-2xl shadow-slate-900/40 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <CloudArrowUpIcon className="h-5 w-5" />
              Sync to Records
            </>
          )}
        </button>
      </div>
    </div>
  );
}