'use client';

import React from 'react';
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  BookOpenIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// --- Type Definitions aligned with our Classroom-based API ---

export type StudentStat = {
  title: string;
  value: string | number;
  description: string;
  color: string;
};

export type DashboardAssignment = {
  id: string;
  title: string;
  courseName: string; // Updated from 'class' to match API logic
  dueDate: string;
  status: string;
};

export type DashboardCourse = {
  id: string;
  name: string;
  teacher: string;
  room: string;
  currentGrade: string;
};

export type DashboardTimetable = {
  time: string;
  event: string;
  location: string;
};

export type DashboardAnnouncement = {
  id: string;
  text: string;
  type: 'info' | 'warning';
};

export interface ParentDashboardProps {
  studentName: string;
  studentGradeLevel: string;
  classroomName: string; // Added to show the derived Classroom
  studentStats: StudentStat[];
  upcomingAssignments: DashboardAssignment[];
  myCourses: DashboardCourse[];
  personalTimetable: DashboardTimetable[];
  studentAnnouncements: DashboardAnnouncement[];
  companyId: string;
  currentUserId: string;
}

export default function ParentDashboard({
  studentName,
  studentGradeLevel,
  classroomName,
  studentStats,
  upcomingAssignments,
  myCourses,
  personalTimetable,
  studentAnnouncements,
}: ParentDashboardProps) {
  
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getStatIcon = (title: string) => {
    if (title.includes('GPA') || title.includes('Grade')) return <AcademicCapIcon className="h-7 w-7 text-blue-600" />;
    if (title.includes('Assignment') || title.includes('Tasks')) return <ClipboardDocumentListIcon className="h-7 w-7 text-purple-600" />;
    if (title.includes('Classes') || title.includes('Attendance')) return <BookOpenIcon className="h-7 w-7 text-yellow-600" />;
    return <ChartBarIcon className="h-7 w-7 text-green-600" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {studentName.split(' ')[0]}! 👋
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-slate-500">{studentGradeLevel}</span>
            <span className="text-slate-300">•</span>
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {classroomName}
            </span>
          </div>
        </div>
        <div className="bg-white text-slate-600 px-4 py-2 rounded-2xl shadow-sm border border-slate-200 text-sm font-semibold flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
          <span>{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Key Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {studentStats?.map((stat, index) => (
              <div key={index} className={`p-5 rounded-3xl shadow-sm border ${stat.color} bg-white transition-transform hover:scale-[1.02]`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl shrink-0">
                    {getStatIcon(stat.title)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                    <h2 className="text-2xl font-black text-slate-800">{stat.value}</h2>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 font-medium opacity-80">{stat.description}</p>
              </div>
            ))}
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-500" /> 
                Priority Assignments
              </h3>
              <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {upcomingAssignments?.length > 0 ? upcomingAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{assignment.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{assignment.courseName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{assignment.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                          {assignment.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-10 text-center text-slate-400 text-sm">No pending assignments! ✨</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Course Progress Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-2">
              <BookOpenIcon className="h-5 w-5 text-emerald-500" /> Active Subjects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCourses?.map((course) => (
                <div key={course.id} className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-all">
                  <div>
                    <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{course.name}</p>
                    <p className="text-xs text-slate-400 font-medium">Teacher: {course.teacher} • {course.room}</p>
                  </div>
                  <div className="text-center bg-slate-50 px-4 py-2 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Grade</p>
                    <span className="text-lg font-black text-indigo-600">{course.currentGrade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Timetable */}
          <div className="bg-slate-900 rounded-[2.5rem] shadow-xl p-8 text-white">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-indigo-400" /> Today's Flow
            </h3>
            <div className="space-y-6 relative border-l-2 border-slate-800 ml-2 pl-6">
              {personalTimetable?.map((slot, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-4 border-slate-900" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{slot.time}</span>
                    <span className="font-bold text-sm text-slate-100">{slot.event}</span>
                    <span className="text-[11px] text-slate-500 font-medium mt-0.5">{slot.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
              <MegaphoneIcon className="h-5 w-5 text-orange-500" /> Bulletins
            </h3>
            <div className="space-y-3">
              {studentAnnouncements?.map((note) => (
                <div key={note.id} className={`p-4 rounded-2xl border ${note.type === 'warning' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-blue-50 border-blue-100 text-blue-700'} text-xs font-semibold leading-relaxed`}>
                  {note.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}