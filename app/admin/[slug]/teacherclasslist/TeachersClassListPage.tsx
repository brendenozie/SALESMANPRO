'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon, // For academic levels/classes
  CalendarDaysIcon, // For date
  UsersIcon, // For students count
  BookOpenIcon, // For view roster
  MegaphoneIcon, // For announcements
  ChartBarIcon, // For reports
  EllipsisVerticalIcon, // For dropdown actions
  ArrowRightIcon, // For view details
  PlusIcon, // For add event
  ChatBubbleBottomCenterTextIcon, // For send message
  ClipboardDocumentCheckIcon, // For attendance
  ClockIcon,
  MagnifyingGlassIcon, // For events
} from '@heroicons/react/24/outline';

import { useRouter } from "next/navigation";
import Link from 'next/link';
import { AssignedAcademicLevel, ClassTeacherAcademicLevelsPageData, ClassTeacherInfo } from '@/app/api/teacher/academic-levels/route';


// Define props for the client component
interface ClassTeacherAcademicLevelsPageProps {
  classTeacherInfo: ClassTeacherInfo;
  themeSettings: {
    primaryColor: string;
    accentColor: string;
  };
  assignedAcademicLevels: AssignedAcademicLevel[];
  teacherId: string; // Passed from server component for dynamic links
}

export default function ClassTeacherAcademicLevelsPage({
  classTeacherInfo,
  themeSettings,
  assignedAcademicLevels,
  teacherId,
}: ClassTeacherAcademicLevelsPageProps) {
  const router = useRouter();

  const primaryColor = themeSettings.primaryColor;
  const accentColor = themeSettings.accentColor;

  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // State to manage which dropdown is open

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Filter academic levels based on search term
  const filteredAcademicLevels = assignedAcademicLevels.filter(level =>
    level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.roleInLevel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Action Handlers for Academic Levels ---
  
  const handleManageAcademicLevelEvents = (academicLevelId: string) => {
    router.push(`/admin/${teacherId}/teacherclasslist/${academicLevelId}/class-event`);
  };

  const handleSendAcademicLevelAnnouncement = (academicLevelId: string) => {
    router.push(`/admin/${teacherId}/teacherclasslist/${academicLevelId}/class-announcements`);
  };

  const handleViewAcademicLevelReports = (academicLevelId: string) => {
    router.push(`/admin/${teacherId}/teacherclasslist/${academicLevelId}/class-reports`);
  };

  const handleTakeAcademicLevelAttendance = (academicLevelId: string) => {
    router.push(`/admin/${teacherId}/teacherclasslist/${academicLevelId}/class-attendance`);
  };

  const handleManageStudentsInLevel = (academicLevelId: string) => {
    router.push(`/admin/${teacherId}/teacherclasslist/${academicLevelId}/manage-students`);
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            My Assigned Classes <span style={{ color: primaryColor }}>🏫</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Overview of academic levels managed by {classTeacherInfo.name}, {classTeacherInfo.role}.</p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
            <span>{today}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="max-w-xl mx-auto relative">
        <input
          type="text"
          placeholder="Search academic levels by name or description..."
          className={`w-full p-3 pl-10 rounded-full border border-gray-300 shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                      text-gray-900 placeholder-gray-500 bg-white`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </motion.div>

      {/* Assigned Academic Levels List */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {filteredAcademicLevels.length > 0 ? (
          filteredAcademicLevels.map((level) => (
            <motion.div
              key={level.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between
                          hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out relative"
              variants={itemVariants}
            >
              {/* Action Dropdown */}
              <div className="absolute top-4 right-4 z-10">
                <div className="relative">
                  <button
                    className={`p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from closing dropdown
                      setOpenDropdownId(openDropdownId === level.id ? null : level.id); // Toggle dropdown
                    }}
                  >
                    <EllipsisVerticalIcon className="h-6 w-6" />
                  </button>
                  <AnimatePresence>
                    {openDropdownId === level.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200 origin-top-right"
                      >
                        <button
                          onClick={() => { handleTakeAcademicLevelAttendance(level.id); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <ClipboardDocumentCheckIcon className={`h-5 w-5 text-green-500`} /> Take Attendance
                        </button>
                        <button
                          onClick={() => { handleManageAcademicLevelEvents(level.id); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <CalendarDaysIcon className={`h-5 w-5 text-purple-500`} /> Manage Events
                        </button>
                        <button
                          onClick={() => { handleSendAcademicLevelAnnouncement(level.id); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <MegaphoneIcon className={`h-5 w-5 text-orange-500`} /> Send Announcement
                        </button>
                        <button
                          onClick={() => { handleViewAcademicLevelReports(level.id); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <ChartBarIcon className={`h-5 w-5 text-teal-500`} /> View Reports
                        </button>
                        <div className="border-t border-gray-100 my-1"></div> {/* Separator */}
                        <button
                          onClick={() => { handleManageStudentsInLevel(level.id); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <UsersIcon className="h-5 w-5 text-gray-500" /> Manage Students
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <AcademicCapIcon className={`h-6 w-6`} style={{ color: primaryColor }} /> {level.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{level.description || 'No description provided.'}</p>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-gray-500" />
                    <span>{level.studentsCount} Students Enrolled</span>
                  </div>
                  {level.roleInLevel && (
                    <div className="flex items-center gap-2">
                      <AcademicCapIcon className="h-5 w-5 text-gray-500" />
                      <span>Role: {level.roleInLevel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* <div className="mt-6 border-t border-gray-100 pt-4">
                <button
                  onClick={() => handleViewRoster(level.id)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md shadow-sm
                              bg-[${accentColor}] text-gray-900
                              hover:opacity-90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
                  style={{ backgroundColor: accentColor }} // Apply accent color dynamically
                >
                  View Student Roster <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div> */}

              {/* Quick Info: Events & Announcements */}
              <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Quick Info</h4>
                {level.academicLevelEvents.length > 0 && (
                  <div className="mb-2">
                    <h5 className="text-sm font-medium text-gray-700 flex items-center gap-1"><ClockIcon className="h-4 w-4 text-purple-500" /> Upcoming Events:</h5>
                    <ul className="list-disc list-inside text-xs text-gray-600 ml-2">
                      {level.academicLevelEvents.slice(0, 2).map(event => (
                        <li key={event.id}>{event.name} on {new Date(event.date).toLocaleDateString()} at {event.time}</li>
                      ))}
                      {level.academicLevelEvents.length > 2 && <li>...and {level.academicLevelEvents.length - 2} more</li>}
                    </ul>
                  </div>
                )}
                {level.academicLevelAnnouncements.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 flex items-center gap-1"><MegaphoneIcon className="h-4 w-4 text-orange-500" /> Latest Announcements:</h5>
                    <ul className="list-disc list-inside text-xs text-gray-600 ml-2">
                      {level.academicLevelAnnouncements.slice(0, 2).map(announcement => (
                        <li key={announcement.id}>{announcement.text}</li>
                      ))}
                      {level.academicLevelAnnouncements.length > 2 && <li>...and {level.academicLevelAnnouncements.length - 2} more</li>}
                    </ul>
                  </div>
                )}
                {level.academicLevelEvents.length === 0 && level.academicLevelAnnouncements.length === 0 && (
                  <p className="text-xs text-gray-500">No recent events or announcements for this class.</p>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="md:col-span-2 lg:col-span-3 p-8 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200"
            variants={itemVariants}
          >
            <AcademicCapIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No academic levels assigned to you as a class teacher.</p>
            <p className="text-sm mt-2">If you believe this is incorrect, please contact your administrator.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
