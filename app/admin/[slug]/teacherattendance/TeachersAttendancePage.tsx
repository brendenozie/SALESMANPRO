'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  UsersIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownCircleIcon, // For excused
  PaperAirplaneIcon, // For submit
} from '@heroicons/react/24/outline';

// Sample Data
const sampleClassesForAttendance = [
  { id: 'CL101', name: 'Grade 7 Mathematics', totalStudents: 35 },
  { id: 'CL102', name: 'Grade 8 English Language', totalStudents: 30 },
  { id: 'CL103', name: 'Grade 9 Algebra', totalStudents: 28 },
  { id: 'CL104', name: 'Grade 10 Geometry', totalStudents: 22 },
];

const sampleStudentsInClass: { [classId: string]: { id: string; name: string }[] } = {
  'CL101': [
    { id: 'S001', name: 'Alice Smith' },
    { id: 'S005', name: 'Fatuma Hassan' },
    { id: 'S011', name: 'George Kinyanjui' },
    { id: 'S012', name: 'Hannah Wambui' },
    { id: 'S013', name: 'Isaac Kipchoge' },
    { id: 'S014', name: 'Naomi Chebet' },
    { id: 'S015', name: 'Paul Omondi' },
    // ... more students for CL101
  ],
  'CL102': [
    { id: 'S002', name: 'Kevin Otieno' },
    { id: 'S004', name: 'Michael Njoroge' },
    { id: 'S010', name: 'John Doe' },
    { id: 'S016', name: 'Sarah Miller' },
    // ... more students for CL102
  ],
  // ... other classes
};

// Simulate backend data for saved attendance
const initialAttendanceData: { [key: string]: { [studentId: string]: string } } = {
  'CL101-2025-06-26': { // Class ID - Date (YYYY-MM-DD)
    'S001': 'Present',
    'S005': 'Present',
    'S011': 'Absent',
    'S012': 'Tardy',
    'S013': 'Excused',
    'S014': 'Present',
    'S015': 'Present',
  },
  'CL102-2025-06-26': {
    'S002': 'Present',
    'S004': 'Absent',
    'S010': 'Present',
    'S016': 'Tardy',
  }
};

export default function TeachersAttendancePage() {
  const [selectedClassId, setSelectedClassId] = useState(sampleClassesForAttendance[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [attendanceRecords, setAttendanceRecords] = useState<{ [studentId: string]: string }>({}); // { studentId: status } for current class/date
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentClass = sampleClassesForAttendance.find(cls => cls.id === selectedClassId);
  const teacherName = "Mr. John Doe"; // Placeholder for logged-in teacher's name

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    // Load attendance for the selected class and date
    if (selectedClassId && selectedDate) {
      const key = `${selectedClassId}-${selectedDate}`;
      const savedAttendance: { [studentId: string]: string } = initialAttendanceData[key] || {};
      const studentsInCurrentClass = sampleStudentsInClass[selectedClassId] || [];

      // Initialize attendance records for all students in the class
      const newRecords: { [studentId: string]: string } = {};
      studentsInCurrentClass.forEach(student => {
        newRecords[student.id] = savedAttendance[student.id] || 'Present'; // Default to Present if not marked
      });
      setAttendanceRecords(newRecords);
    } else {
      setAttendanceRecords({});
    }
  }, [selectedClassId, selectedDate]);

  const handleAttendanceChange = (studentId: string, status: 'Present' | 'Absent' | 'Tardy' | 'Excused') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const getAttendanceStats = () => {
    const total = (sampleStudentsInClass[selectedClassId] || []).length;
    if (total === 0) return { present: 0, absent: 0, tardy: 0, excused: 0, total: 0 };

    const stats = { present: 0, absent: 0, tardy: 0, excused: 0, total: total };
    Object.values(attendanceRecords).forEach(status => {
      if (status === 'Present') stats.present++;
      else if (status === 'Absent') stats.absent++;
      else if (status === 'Tardy') stats.tardy++;
      else if (status === 'Excused') stats.excused++;
    });
    return stats;
  };

  const attendanceStats = getAttendanceStats();

  const handleSaveDraft = () => {
    setIsSaving(true);
    // Simulate API call to save draft attendance
    setTimeout(() => {
      // console.log(`Draft attendance saved for ${currentClass?.name} on ${selectedDate}:`, attendanceRecords);
      alert('Attendance saved as draft!');
      setIsSaving(false);
      // In a real app, update initialAttendanceData or send to backend
    }, 1500);
  };

  const handleSubmitAttendance = () => {
    if (!confirm("Are you sure you want to submit attendance for this date? It will be finalized.")) {
      return; // Use custom modal in real app
    }
    setIsSubmitting(true);
    // Simulate API call to submit and finalize attendance
    setTimeout(() => {
      // console.log(`Attendance submitted for ${currentClass?.name} on ${selectedDate}:`, attendanceRecords);
      alert('Attendance submitted successfully!');
      setIsSubmitting(false);
      // In a real app, send to backend and possibly lock changes for this date/class
    }, 2000);
  };

  if (!currentClass) {
    return (
      <div className="p-8 text-center bg-gray-100 min-h-screen font-sans">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Mark Attendance</h1>
        <p className="text-gray-600">Please select a class to mark attendance.</p>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="mt-6 block mx-auto py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">-- Select a Class --</option>
          {sampleClassesForAttendance.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Mark Attendance
            <span className="ml-2 text-green-600 text-base sm:text-xl">✍️</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Record daily attendance for your classes.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Class & Date Selector */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-grow">
            <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-2">Select Class:</label>
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="block w-full md:w-fit py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {sampleClassesForAttendance.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.totalStudents} students)
                </option>
              ))}
            </select>
          </div>
          <div className="flex-grow">
            <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-2">Select Date:</label>
            <input
              type="date"
              id="date-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full md:w-fit py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              max={new Date().toISOString().split('T')[0]} // Cannot mark attendance for future dates
            />
          </div>
        </div>

        {/* Attendance Summary for Selected Day */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 border-t border-gray-100 pt-6">
            <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600 mb-1" />
                <p className="text-sm font-medium text-gray-600">Total</p>
                <h3 className="text-2xl font-bold text-gray-800">{attendanceStats.total}</h3>
            </div>
            <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mb-1" />
                <p className="text-sm font-medium text-gray-600">Present</p>
                <h3 className="text-2xl font-bold text-gray-800">{attendanceStats.present}</h3>
            </div>
            <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600 mb-1" />
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <h3 className="text-2xl font-bold text-gray-800">{attendanceStats.absent}</h3>
            </div>
            <div className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600 mb-1" />
                <p className="text-sm font-medium text-gray-600">Tardy</p>
                <h3 className="text-2xl font-bold text-gray-800">{attendanceStats.tardy}</h3>
            </div>
        </div>
      </div>

      {/* Student Attendance Marking Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-indigo-500" /> Students in {currentClass.name}
          </h3>
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-sm
                         hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSubmitAttendance}
              disabled={isSaving || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm
                         hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Attendance'} <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mark As</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(sampleStudentsInClass[selectedClassId] || []).length > 0 ? (
                (sampleStudentsInClass[selectedClassId] || []).map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${attendanceRecords[student.id] === 'Present' ? 'bg-green-100 text-green-800' :
                          attendanceRecords[student.id] === 'Absent' ? 'bg-red-100 text-red-800' :
                          attendanceRecords[student.id] === 'Tardy' ? 'bg-yellow-100 text-yellow-800' :
                          attendanceRecords[student.id] === 'Excused' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                      `}>
                        {attendanceRecords[student.id] || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            value="Present"
                            checked={attendanceRecords[student.id] === 'Present'}
                            onChange={() => handleAttendanceChange(student.id, 'Present')}
                            className="form-radio text-green-600 h-4 w-4"
                          />
                          <span className="ml-1 text-gray-700">Present</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            value="Absent"
                            checked={attendanceRecords[student.id] === 'Absent'}
                            onChange={() => handleAttendanceChange(student.id, 'Absent')}
                            className="form-radio text-red-600 h-4 w-4"
                          />
                          <span className="ml-1 text-gray-700">Absent</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            value="Tardy"
                            checked={attendanceRecords[student.id] === 'Tardy'}
                            onChange={() => handleAttendanceChange(student.id, 'Tardy')}
                            className="form-radio text-yellow-600 h-4 w-4"
                          />
                          <span className="ml-1 text-gray-700">Tardy</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            value="Excused"
                            checked={attendanceRecords[student.id] === 'Excused'}
                            onChange={() => handleAttendanceChange(student.id, 'Excused')}
                            className="form-radio text-blue-600 h-4 w-4"
                          />
                          <span className="ml-1 text-gray-700">Excused</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No students found for this class.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
