
// app/admin/[slug]/teacher-classes/TeachersSubjectListPage.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon, // For classes/education
  CalendarDaysIcon, // For date
  BookOpenIcon, // For classes list
  UsersIcon, // For students enrolled
  ClockIcon, // For schedule
  MapPinIcon, // For room
  ArrowRightIcon, // For view details
  EllipsisVerticalIcon, // For class action dropdown
  TrashIcon, // For Delete Class (request)
  ClipboardDocumentListIcon, // For Manage Assignments
  ChatBubbleBottomCenterTextIcon, // For Send Message
  MagnifyingGlassIcon, // For search
  ClipboardDocumentCheckIcon, // For Take Attendance
  ChartBarIcon, // For Consolidated Grades/Reports
  CloudArrowUpIcon, // For Upload Resources
  PlusIcon,
  VideoCameraIcon, // For Add Class Event
} from '@heroicons/react/24/outline';

import { useRouter } from "next/navigation";
import Link from 'next/link'; // Import Link for navigation
import { TodaysClasses } from './TodaysClasses';

// Re-import types from the parent page (or a shared types file)
interface TeacherInfo {
  id: string;
  name: string;
  email: string;
  role: string; // e.g., "Educator"
}

interface AcademicLevelInfo {
  id: string;
  name: string;
  description: string | null;
}

interface StudentInCourse {
  studentId: string;
  name: string;
  email: string;
  parentEmail: string | null;
}

interface AssignmentSummary {
  id: string;
  title: string;
  dueDate: string; // ISO string
  status: string; // e.g., 'pending', 'completed'
}

interface ResourceSummary {
  id: string;
  name: string;
  type: string; // e.g., 'PDF', 'Video'
}

interface EventSummary {
  id: string;
  name: string;
  date: string; // ISO string
  time: string; // e.g., '3:00 PM'
}

interface TeacherAssignedCourse {
  id: string;
  title: string;
  description: string | null;
  schedule: string;
  room: string;
  studentsEnrolled: number;
  academicLevel: AcademicLevelInfo;
  students: StudentInCourse[];
  assignments: AssignmentSummary[];
  resources: ResourceSummary[];
  events: EventSummary[];
}


interface ScheduleInfo {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: {
    id: string;
    name: string;
  } | null;
  academicLevel?: {
    id: string;
    name: string;
  } | null;
  topic?: string | null;
  meetingLink?: string | null;
}

interface TeacherAssignedCourse {
  id: string;
  title: string;
  description: string | null;
  studentsEnrolled: number;
  academicLevel: AcademicLevelInfo;
  schedules: ScheduleInfo[];
  students: StudentInCourse[];
  assignments: AssignmentSummary[];
  resources: ResourceSummary[];
  events: EventSummary[];
}

const groupByDay = (schedules: ScheduleInfo[]) => {
  return schedules.reduce<Record<string, ScheduleInfo[]>>((acc, s) => {
    if (!acc[s.day]) acc[s.day] = [];
    acc[s.day].push(s);
    return acc;
  }, {});
};


// interface TeacherAssignedCourse {
//   id: string; // Course ID
//   title: string;
//   description: string | null;
//   schedule: string; // Combined string, e.g., "Mon, Wed, Fri | 9:00 AM - 9:45 AM"
//   room: string;
//   studentsEnrolled: number;
//   academicLevel: AcademicLevelInfo; // The primary academic level this course is associated with
//   students: StudentInCourse[]; // Simplified for summary, might not need full list here
//   assignments: AssignmentSummary[];
//   resources: ResourceSummary[];
//   events: EventSummary[];
// }


// Define props for the client component
interface TeachersClassListPageProps {
  teacherInfo: TeacherInfo;
  themeSettings: {
    primaryColor: string;
    accentColor: string;
  };
  teacherClasses: TeacherAssignedCourse[];
  teacherUserId: string; // Passed from server component for dynamic links
}

export default function TeachersSubjectListPage({
  teacherInfo,
  themeSettings,
  teacherClasses,
  teacherUserId,
}: TeachersClassListPageProps) {
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

  // Filter classes based on search term
  // const filteredClasses = teacherClasses.filter(cls =>
  //   cls.title.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by course title
  //   cls.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   cls.academicLevel.name.toLowerCase().includes(searchTerm.toLowerCase()) // Search by academic level name
  // );

  const filteredClasses = teacherClasses.filter(cls =>
    cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.academicLevel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.schedules.some(s =>
      s.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.classroom?.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    )
  );


  // --- Placeholder Functions for Class Management ---
  // Note: These functions now use `Link` or `router.push` for navigation,
  // and `companyId` is passed down.
  // For actions like "Delete Class Request", a simple alert is used as a placeholder.

  // All these actions are now per Course (subject)
  // const handleViewRoster = (courseId: string) => {
  //   router.push(`/admin/${teacherUserId}/teachersubjectlist/${courseId}/course-event`);
  // };

  const handleTakeAttendance = (courseId: string, schedule: ScheduleInfo) => {
    router.push(
      `/admin/${teacherUserId}/teachersubjectlist/${courseId}/attendance?scheduleId=${schedule.id}&classroomId=${schedule.classroom?.id}`
    );
  };

  const handleSendMessage = (courseId: string, schedule: ScheduleInfo) => {
    router.push(
      `/admin/${teacherUserId}/teachersubjectlist/${courseId}/send-message?scheduleId=${schedule.id}&classroomId=${schedule.classroom?.id}`
    );
  };

  const handleViewCourseGrades = (courseId: string, schedule: ScheduleInfo) => {
    router.push(
      `/admin/${teacherUserId}/teachersubjectlist/${courseId}/grades?scheduleId=${schedule.id}&classroomId=${schedule.classroom?.id}`
    );
  };


  const handleManageAssignments = (courseId: string, schedule: ScheduleInfo) => {
    router.push(`/admin/${teacherUserId}/teachersubjectlist/${courseId}/manage-course-assignments`);
  };

  const handleUploadResources = (courseId: string, schedule: ScheduleInfo) => {
    router.push(`/admin/${teacherUserId}/teachersubjectlist/${courseId}/upload-course-resources`);
  };

  const handleViewClassSchedule = (courseId: string, schedule: ScheduleInfo) => {
    router.push(`/admin/${teacherUserId}/teachersubjectlist/${courseId}/course-schedule`);
  };

  const handleAddClassEvent = (courseId: string, classRoomId: string) => {
    router.push(`/admin/${teacherUserId}/teachersubjectlist/${courseId}/course-event`);
  };

  // UPDATED: Link to the academic-level specific report page
  const handleGenerateReports = (academicLevelId: string, classRoomId: string, courseId: string) => {    
    router.push(`/admin/${teacherUserId}/teachersubjectlist/${courseId}/course-reports`);
    // router.push(`/admin/${teacherUserId}/teacher/${teacherInfo.id}/academic-levels/${academicLevelId}/reports?courseId=${courseId}`);
  };

  const getNextSchedule = (cls: TeacherAssignedCourse) => {
    return cls.schedules[0];
  };

  const handleDeleteClassRequest = (courseId: string, courseTitle: string) => {
    if (window.confirm(`Are you sure you want to request deletion of "${courseTitle}"? This will send a request to the admin.`)) {
      console.log(`Requesting deletion of Course ID: ${courseId} (${courseTitle})`);
      // In a real app, send a deletion request to the admin API
      alert(`Functionality: Deletion Request for "${courseTitle}" sent to Admin (Simulated)`);
    }
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
            My Courses <span style={{ color: primaryColor }}>📚</span> {/* Changed from "My Classes" to "My Courses" */}
          </h1>
          <p className="text-sm text-gray-600 mt-1">Overview of all courses assigned to {teacherInfo.name}, {teacherInfo.role}.</p>
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
          placeholder="Search courses by title, academic level, or description..."
          className={`w-full p-3 pl-10 rounded-full border border-gray-300 shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                      text-gray-900 placeholder-gray-500 bg-white`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </motion.div>

      <div className="sticky top-0 z-20 bg-gray-50">
        <TodaysClasses teacherClasses={teacherClasses} />
      </div>

      {/* Courses List */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => (
            <motion.div
              key={cls.id}
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
                      setOpenDropdownId(openDropdownId === cls.id ? null : cls.id); // Toggle dropdown
                    }}
                  >
                    <EllipsisVerticalIcon className="h-6 w-6" />
                  </button>
                  <AnimatePresence>
                    {openDropdownId === cls.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200 origin-top-right"
                      >
                        <button
                        onClick={() => {
                                  const next = getNextSchedule(cls);
                                  if (next) handleTakeAttendance(cls.id, next);
                                  setOpenDropdownId(null);
                                }}
                          // onClick={() => { handleTakeAttendance(cls.id, ); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <ClipboardDocumentCheckIcon className={`h-5 w-5 text-[${accentColor}]`} /> Take Attendance
                        </button>
                        <button
                          // onClick={() => { handleViewCourseGrades(cls.id, cls.schedules); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <ChartBarIcon className={`h-5 w-5 text-blue-500`} /> View Course Grades
                        </button>
                        <button
                          // onClick={() => { handleManageAssignments(cls.id, cls.classroomId); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <ClipboardDocumentListIcon className={`h-5 w-5 text-green-500`} /> Manage Assignments
                        </button>
                        <button
                          // onClick={() => { handleUploadResources(cls.id, cls.classroomId); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <CloudArrowUpIcon className={`h-5 w-5 text-purple-500`} /> Upload Resources
                        </button>
                        <button
                          // onClick={() => { handleViewClassSchedule(cls.id, cls.classroomId); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <ClockIcon className={`h-5 w-5 text-indigo-500`} /> View Class Schedule
                        </button>
                        <button
                          // onClick={() => { handleAddClassEvent(cls.id); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <PlusIcon className={`h-5 w-5 text-orange-500`} /> Add Class Event
                        </button>
                        <button
                          // onClick={() => { handleSendMessage(cls.id, cls.classroomId); setOpenDropdownId(null); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <ChatBubbleBottomCenterTextIcon className={`h-5 w-5 text-pink-500`} /> Send Message
                        </button>
                        <button
                          // onClick={() => { handleGenerateReports(cls.academicLevel.id, cls.classroomId, cls.id); setOpenDropdownId(null); }} // Pass academicLevel.id, classroomId and course.id
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <ChartBarIcon className={`h-5 w-5 text-teal-500`} /> Generate Academic Level Report
                        </button>
                        <div className="border-t border-gray-100 my-1"></div> {/* Separator */}
                        <button
                          onClick={() => { handleDeleteClassRequest(cls.id, cls.title); setOpenDropdownId(null); }} // Pass course title
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" /> Request Course Deletion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpenIcon className={`h-6 w-6`} style={{ color: primaryColor }} /> {cls.title} {/* Display Course title */}
                  {cls.schedules.length > 0 && (
                    <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {cls.schedules.length} Sessions / Week
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{cls.description}</p>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-gray-500" />
                    <span>{cls.academicLevel.name} | {cls.studentsEnrolled} Students</span> {/* Display Academic Level Name */}
                  </div>
                  <div className="mt-3 space-y-2">
                      {cls.schedules.length === 0 ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <ClockIcon className="h-5 w-5" />
                          <span>No schedule assigned</span>
                        </div>
                      ) : (
                        cls.schedules.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-start justify-between gap-2 text-sm text-gray-700 border rounded-lg p-2"
                          >
                            <div className="flex gap-2">
                              <ClockIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {s.day} · {s.startTime} – {s.endTime}
                                </span>

                                {s.classroom && (
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <MapPinIcon className="h-4 w-4" />
                                    {s.classroom.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-1">
                              <button
                                onClick={() => handleTakeAttendance(cls.id, s)}
                                className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded"
                              >
                                Attendance
                              </button>

                              <button
                                onClick={() => handleSendMessage(cls.id, s)}
                                className="text-xs px-2 py-1 bg-pink-50 text-pink-600 rounded"
                              >
                                Message
                              </button>

                              {s.meetingLink && (
                                <a
                                  href={s.meetingLink}
                                  target="_blank"
                                  className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded flex items-center gap-1"
                                >
                                  <VideoCameraIcon className="h-3 w-3" />
                                  Join
                                </a>
                              )}
                            </div>
                          </div>
                        ))

                        // cls.schedules.map((s) => (
                        //   <div key={s.id} className="flex items-start gap-2 text-sm text-gray-700">
                        //     <ClockIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                        //     <div className="flex flex-col">
                        //       <span className="font-medium">
                        //         {s.day} · {s.startTime} – {s.endTime}
                        //       </span>
                        //       {s.classroom && (
                        //         <span className="flex items-center gap-1 text-gray-500">
                        //           <MapPinIcon className="h-4 w-4" />
                        //           {s.classroom.name}
                        //         </span>
                        //       )}
                        //     </div>
                        //     {s.meetingLink && (
                        //       <a
                        //         href={s.meetingLink}
                        //         target="_blank"
                        //         className="inline-flex items-center gap-1 text-xs text-indigo-600 mt-1"
                        //       >
                        //         <VideoCameraIcon className="h-4 w-4" />
                        //         Join
                        //       </a>
                        //     )}

                        //   </div>
                        // ))
                      )}
                    </div>

                    

                  {/* <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-gray-500" />
                    <span>{cls.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                    <span>{cls.room}</span>
                  </div> */}
                </div>
              </div>
              
            </motion.div>
          ))
        ) : (
          <motion.div
            className="md:col-span-2 lg:col-span-3 p-8 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200"
            variants={itemVariants}
          >
            <AcademicCapIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No courses found matching your search or assigned to you.</p>
            <p className="text-sm mt-2">If you believe this is incorrect, please contact your administrator.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
