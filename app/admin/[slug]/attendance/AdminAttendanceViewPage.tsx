'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDaysIcon, // For date and calendar
  UsersIcon, // Main icon for attendance/students
  MagnifyingGlassIcon, // For search
  CheckCircleIcon, // For Present
  XCircleIcon, // For Absent
  ClockIcon, // For Tardy
  ArrowDownCircleIcon, // For Excused
  AcademicCapIcon, // For Grade Level
  BookOpenIcon, // For Class
  EyeIcon,
  ExclamationCircleIcon, // For view details
} from '@heroicons/react/24/outline';

// Sample Data
const allStudentsForAdmin = [
  { id: 'S001', name: 'Alice Smith', gradeLevel: '7' },
  { id: 'S002', name: 'Kevin Otieno', gradeLevel: '8' },
  { id: 'S003', name: 'Sarah Kimani', gradeLevel: '9' },
  { id: 'S004', name: 'Michael Njoroge', gradeLevel: '8' },
  { id: 'S005', name: 'Fatuma Hassan', gradeLevel: '7' },
  { id: 'S010', name: 'John Doe', gradeLevel: '8' },
  { id: 'S011', name: 'George Kinyanjui', gradeLevel: '7' },
  { id: 'S012', name: 'Hannah Wambui', gradeLevel: '7' },
  { id: 'S013', name: 'Isaac Kipchoge', gradeLevel: '7' },
  { id: 'S014', name: 'Naomi Chebet', gradeLevel: '8' },
  { id: 'S015', name: 'Paul Omondi', gradeLevel: '8' },
  { id: 'S016', name: 'Quentin Onyango', gradeLevel: '9' },
  { id: 'S017', name: 'Rachael Moraa', gradeLevel: '9' },
  { id: 'S018', name: 'Steve Mwangangi', gradeLevel: '7' },
  { id: 'S019', name: 'Tina Nyokabi', gradeLevel: '8' },
];

const allClassesForAdmin = [
  { id: 'CL101', name: 'Grade 7 Mathematics', teacherName: 'Mr. John Doe' },
  { id: 'CL102', name: 'Grade 8 English Language', teacherName: 'Mrs. Jane Smith' },
  { id: 'CL103', name: 'Grade 9 Algebra', teacherName: 'Mr. John Doe' },
  { id: 'CL104', name: 'Grade 10 Geometry', teacherName: 'Mr. John Doe' },
  { id: 'CL105', name: 'Grade 8 Science', teacherName: 'Ms. Emily White' },
];

// Comprehensive Sample Attendance Records (simulating daily records)
const sampleAttendanceRecords = [
  // June 25, 2025
  { recordId: 'REC001', studentId: 'S001', date: '2025-06-25', status: 'Present', classId: 'CL101' },
  { recordId: 'REC002', studentId: 'S002', date: '2025-06-25', status: 'Absent', classId: 'CL102' },
  { recordId: 'REC003', studentId: 'S003', date: '2025-06-25', status: 'Present', classId: 'CL103' },
  { recordId: 'REC004', studentId: 'S004', date: '2025-06-25', status: 'Tardy', classId: 'CL102' },
  { recordId: 'REC005', studentId: 'S005', date: '2025-06-25', status: 'Present', classId: 'CL101' },
  { recordId: 'REC006', studentId: 'S010', date: '2025-06-25', status: 'Present', classId: 'CL102' },
  { recordId: 'REC007', studentId: 'S011', date: '2025-06-25', status: 'Excused', classId: 'CL101' },
  { recordId: 'REC008', studentId: 'S012', date: '2025-06-25', status: 'Present', classId: 'CL101' },
  { recordId: 'REC009', studentId: 'S013', date: '2025-06-25', status: 'Absent', classId: 'CL101' },
  { recordId: 'REC010', studentId: 'S014', date: '2025-06-25', status: 'Present', classId: 'CL102' },
  { recordId: 'REC011', studentId: 'S015', date: '2025-06-25', status: 'Tardy', classId: 'CL102' },
  { recordId: 'REC012', studentId: 'S016', date: '2025-06-25', status: 'Present', classId: 'CL103' },

  // June 24, 2025
  { recordId: 'REC013', studentId: 'S001', date: '2025-06-24', status: 'Present', classId: 'CL101' },
  { recordId: 'REC014', studentId: 'S002', date: '2025-06-24', status: 'Present', classId: 'CL102' },
  { recordId: 'REC015', studentId: 'S003', date: '2025-06-24', status: 'Absent', classId: 'CL103' },
  { recordId: 'REC016', studentId: 'S004', date: '2025-06-24', status: 'Present', classId: 'CL102' },
  { recordId: 'REC017', studentId: 'S005', date: '2025-06-24', status: 'Tardy', classId: 'CL101' },
  { recordId: 'REC018', studentId: 'S011', date: '2025-06-24', status: 'Present', classId: 'CL101' },
  { recordId: 'REC019', studentId: 'S012', date: '2025-06-24', status: 'Absent', classId: 'CL101' },
  { recordId: 'REC020', studentId: 'S013', date: '2025-06-24', status: 'Present', classId: 'CL101' },

  // June 23, 2025
  { recordId: 'REC021', studentId: 'S001', date: '2025-06-23', status: 'Present', classId: 'CL101' },
  { recordId: 'REC022', studentId: 'S002', date: '2025-06-23', status: 'Present', classId: 'CL102' },
  { recordId: 'REC023', studentId: 'S003', date: '2025-06-23', status: 'Present', classId: 'CL103' },
];


export default function AdminAttendanceViewPage() {
  const [attendanceRecords, setAttendanceRecords] = useState(sampleAttendanceRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGradeLevel, setFilterGradeLevel] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const enhancedAttendanceRecords = useMemo(() => {
    return attendanceRecords.map(record => {
      const studentInfo = allStudentsForAdmin.find(s => s.id === record.studentId);
      const classInfo = allClassesForAdmin.find(c => c.id === record.classId);
      return {
        ...record,
        studentName: studentInfo ? studentInfo.name : 'Unknown Student',
        gradeLevel: studentInfo ? studentInfo.gradeLevel : 'N/A',
        className: classInfo ? classInfo.name : 'Unknown Class',
        teacherName: classInfo ? classInfo.teacherName : 'Unknown Teacher',
      };
    });
  }, [attendanceRecords]);

  const uniqueGradeLevels = useMemo(() => Array.from(new Set(allStudentsForAdmin.map(s => s.gradeLevel))).sort(), []);
  const uniqueClasses = useMemo(() => Array.from(new Set(allClassesForAdmin.map(c => c.name))).sort(), []);
  const uniqueStatuses = useMemo(() => Array.from(new Set(enhancedAttendanceRecords.map(r => r.status))).sort(), [enhancedAttendanceRecords]);

  const filteredRecords = useMemo(() => {
    return enhancedAttendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const matchesDateRange = recordDate >= start && recordDate <= end;
      const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGradeLevel = filterGradeLevel === 'All' || record.gradeLevel === filterGradeLevel;
      const matchesClass = filterClass === 'All' || record.className === filterClass;
      const matchesStatus = filterStatus === 'All' || record.status === filterStatus;

      return matchesDateRange && matchesSearch && matchesGradeLevel && matchesClass && matchesStatus;
    }).sort((a, b) => {
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.studentName.localeCompare(b.studentName);
    });
  }, [enhancedAttendanceRecords, startDate, endDate, searchTerm, filterGradeLevel, filterClass, filterStatus]);

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter(r => r.status === 'Present').length;
    const absent = filteredRecords.filter(r => r.status === 'Absent').length;
    const tardy = filteredRecords.filter(r => r.status === 'Tardy').length;
    return { total, present, absent, tardy };
  }, [filteredRecords]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Present': 
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20';
      case 'Absent': 
        return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20';
      case 'Tardy': 
        return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20';
      case 'Excused': 
        return 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200/60 dark:border-sky-500/20';
      default: 
        return 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200/60 dark:border-slate-500/20';
    }
  };

  const handleViewStudentAttendanceHistory = (studentId: string, studentName: string) => {
    alert(`Navigating to detailed attendance history for ${studentName} (ID: ${studentId})`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-200 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              Attendance Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor school-wide daily presence metrics and logs.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-sm font-medium transition-colors">
            <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
            <span>{today}</span>
          </div>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1 */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center space-x-4 transition-colors">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Handled</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.total}</h2>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center space-x-4 transition-colors">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Present</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.present}</h2>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center space-x-4 transition-colors">
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
              <XCircleIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Absent</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.absent}</h2>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center space-x-4 transition-colors">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tardy</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.tardy}</h2>
            </div>
          </div>
        </div>

        {/* Operational Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          
          {/* Section Controls */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                All Attendance Logs
              </h3>
            </div>

            {/* Comprehensive Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              
              {/* Form Input Mixins */}
              <div className="flex flex-col space-y-1">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
              </div>

              <div className="flex flex-col space-y-1 md:col-span-1 lg:col-span-1">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Search</span>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Grade</span>
                <select
                  value={filterGradeLevel}
                  onChange={(e) => setFilterGradeLevel(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                >
                  <option value="All">All Grades</option>
                  {uniqueGradeLevels.map(level => (
                    <option key={level} value={level}>Grade {level}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Classroom</span>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                >
                  <option value="All">All Classes</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Status</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                >
                  <option value="All">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Table Element View */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60 align-middle">
              <thead className="bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left">Student Info</th>
                  <th scope="col" className="px-6 py-3.5 text-left">Grade</th>
                  <th scope="col" className="px-6 py-3.5 text-left">Class & Faculty</th>
                  <th scope="col" className="px-6 py-3.5 text-left">Log Date</th>
                  <th scope="col" className="px-6 py-3.5 text-left">Status</th>
                  <th scope="col" className="relative px-6 py-3.5 w-10">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 bg-white dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-300">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.recordId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{record.studentName}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{record.studentId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-medium">
                        Grade {record.gradeLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{record.className}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{record.teacherName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full border ${getStatusStyle(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewStudentAttendanceHistory(record.studentId, record.studentName)}
                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all flex items-center justify-center border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20"
                          title="View History Pipeline"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ExclamationCircleIcon className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No system records match this filter combo</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">Try adjusting your date thresholds or clearing your string text matching metrics.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}