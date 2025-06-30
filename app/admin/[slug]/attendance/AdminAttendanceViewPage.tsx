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
  EyeIcon, // For view details
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
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]); // Default to 7 days ago
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Enhance attendance records with student and class info
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

  const filteredRecords = enhancedAttendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include end day fully

    const matchesDateRange = recordDate >= start && recordDate <= end;

    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGradeLevel = filterGradeLevel === 'All' || record.gradeLevel === filterGradeLevel;
    const matchesClass = filterClass === 'All' || record.className === filterClass;
    const matchesStatus = filterStatus === 'All' || record.status === filterStatus;

    return matchesDateRange && matchesSearch && matchesGradeLevel && matchesClass && matchesStatus;
  }).sort((a, b) => {
    // Sort by date (descending), then student name (ascending)
    const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    return a.studentName.localeCompare(b.studentName);
  });

  // Calculate overview stats from filtered records
  const totalRecordsDisplayed = filteredRecords.length;
  const presentCount = filteredRecords.filter(r => r.status === 'Present').length;
  const absentCount = filteredRecords.filter(r => r.status === 'Absent').length;
  const tardyCount = filteredRecords.filter(r => r.status === 'Tardy').length;
  const excusedCount = filteredRecords.filter(r => r.status === 'Excused').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Tardy': return 'bg-yellow-100 text-yellow-800';
      case 'Excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewStudentAttendanceHistory = (studentId: string, studentName: string) => {
    alert(`Navigating to detailed attendance history for ${studentName} (ID: ${studentId})`);
    // In a real app, this would route to a student-specific attendance report page.
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Attendance Overview
            <span className="ml-2 text-teal-600 text-base sm:text-xl">📋</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Monitor daily attendance across the entire school.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <UsersIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Records Displayed</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalRecordsDisplayed}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CheckCircleIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <h2 className="text-3xl font-bold text-gray-800">{presentCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-red-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <XCircleIcon className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <h2 className="text-3xl font-bold text-gray-800">{absentCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClockIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tardy</p>
              <h2 className="text-3xl font-bold text-gray-800">{tardyCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
          <UsersIcon className="h-5 w-5 text-indigo-500" /> All Attendance Records
        </h3>

        {/* Date Range Selector and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
          <div className="flex flex-col">
            <label htmlFor="startDate" className="block text-xs font-medium text-gray-700">From Date:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate" className="block text-xs font-medium text-gray-700">To Date:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <select
            value={filterGradeLevel}
            onChange={(e) => setFilterGradeLevel(e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="All">All Grade Levels</option>
            {uniqueGradeLevels.map(level => (
              <option key={level} value={level}>Grade {level}</option>
            ))}
          </select>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="All">All Classes</option>
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="All">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Attendance Records Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name (ID)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class (Teacher)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.recordId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.studentName} <span className="text-gray-500 text-xs">({record.studentId})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Grade {record.gradeLevel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.className} <br />
                      <span className="text-xs text-gray-400">({record.teacherName})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewStudentAttendanceHistory(record.studentId, record.studentName)}
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                        title="View Student History"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" /> History
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No attendance records found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
