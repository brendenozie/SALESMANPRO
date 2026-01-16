'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon, // Classroom focused
  IdentificationIcon, // Attendance
  ChatBubbleLeftRightIcon, // Messaging
  ClipboardDocumentCheckIcon, // Assignments
  PresentationChartLineIcon, // Grades
  MapPinIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

// --- Logic: Transforming Data to be Classroom-Dependent ---
// We "flatten" the courses so each schedule/classroom pair is its own entity.
const transformToClassroomHubs = (courses: any[]) => {
  const hubs: any[] = [];
  courses.forEach(course => {
    course.schedules.forEach((schedule: any) => {
      // Create a unique entry for every Subject + Classroom combination
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
  teacherInfo,
  themeSettings,
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
    <div className="min-h-screen bg-[#F1F5F9] p-4 lg:p-8 font-sans">
      {/* Header Area */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Classroom <span className="text-indigo-600">Command</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage your active student groups and classroom sessions.</p>
        </div>

        <div className="relative w-full md:w-96">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by classroom or subject..."
            className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
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
  );
}

function ClassroomCard({ hub, onAction }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all overflow-hidden group"
    >
      {/* Top Section: Classroom Context */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200">
            <UserGroupIcon className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
            {hub.academicLevel}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {hub.classroomName}
        </h2>
        <p className="text-indigo-500 font-bold text-sm uppercase tracking-tight mb-4">
          Subject: {hub.courseTitle}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <ClockIcon className="h-4 w-4 text-slate-400" />
            {hub.schedule.day} • {hub.schedule.startTime} - {hub.schedule.endTime}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <MapPinIcon className="h-4 w-4 text-slate-400" />
            {hub.classroomName} {hub.schedule.meetingLink && "(Hybrid Available)"}
          </div>
        </div>
      </div>

      {/* Stats Divider */}
      <div className="px-6 py-3 bg-slate-50 flex items-center justify-between border-y border-slate-100">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-300" />
          ))}
          <div className="h-6 w-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600">
            +{hub.studentsCount - 3}
          </div>
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
          {hub.studentsCount} Students Enrolled
        </span>
      </div>

      {/* Transactional Actions: Classroom Dependent */}
      <div className="p-4 grid grid-cols-2 gap-2">
        <ActionButton 
          icon={IdentificationIcon} 
          label="Attendance" 
          onClick={() => onAction('attendance')}
          color="hover:bg-blue-50 hover:text-blue-600"
        />
        <ActionButton 
          icon={PresentationChartLineIcon} 
          label="Gradebook" 
          onClick={() => onAction('grades')}
          color="hover:bg-emerald-50 hover:text-emerald-600"
        />
        <ActionButton 
          icon={ClipboardDocumentCheckIcon} 
          label="Tasks" 
          onClick={() => onAction('manage-course-assignments')}
          color="hover:bg-purple-50 hover:text-purple-600"
        />
        <ActionButton 
          icon={ChatBubbleLeftRightIcon} 
          label="Message" 
          onClick={() => onAction('send-message')}
          color="hover:bg-pink-50 hover:text-pink-600"
        />
      </div>

      {/* Bottom Bar */}
      {hub.schedule.meetingLink && (
        <a 
          href={hub.schedule.meetingLink}
          target="_blank"
          className="w-full py-3 bg-indigo-50 text-indigo-600 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
        >
          <VideoCameraIcon className="h-4 w-4" />
          Enter Virtual Classroom
        </a>
      )}
    </motion.div>
  );
}

function ActionButton({ icon: Icon, label, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 text-slate-600 text-sm font-bold transition-all ${color}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}