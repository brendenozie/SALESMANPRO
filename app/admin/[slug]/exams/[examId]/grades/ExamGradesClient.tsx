'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  SparklesIcon, 
  ChevronDownIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentGradeRow {
  id: string;
  name: string;
  admissionNumber: string;
  currentScore: number | string;
  gradeId?: string; // If a grade already exists
  status: 'idle' | 'saving' | 'saved' | 'error';
}



export default function ExamGradesClient({ examId, courseId, classroomId, companyId, examTitle,initialStudents, academicYearId, termId }: { examId: string, courseId: string, classroomId?: string, companyId?: string, examTitle?: string, initialStudents: StudentGradeRow[], academicYearId?: string, termId?: string }) {
  const [students, setStudents] = useState<StudentGradeRow[]>(initialStudents);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Auto-calculate stats for the "Engaging" header
  const scores = students.map(s => Number(s.currentScore)).filter(s => !isNaN(s) && s > 0);
  const average = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;

  // 2. Handle Individual Input Change
  const handleScoreChange = (index: number, value: string) => {
    const newStudents = [...students];
    newStudents[index].currentScore = value;
    newStudents[index].status = 'idle';
    setStudents(newStudents);
  };

  // 3. Save All Grades (Bulk)
  const saveAllGrades = async () => {
  setIsBulkSaving(true);

  const updatedStudents = [...students];

  try {
    const gradesToSave = students.map((s, index) => {
      updatedStudents[index].status = "saving";

      return {
        studentId: s.id,
        examId,
        courseId,
        companyId,
        academicYearId,
        termId,
        score: Number(s.currentScore) || 0,
      };
    });

    setStudents(updatedStudents);

    const res = await fetch(`/api/admin/grades/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grades: gradesToSave }),
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    // Trigger the success state
      setStudents(students.map(s => ({ ...s, status: "saved" })));
      setShowToast(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    // const successStudents = students.map((s) => ({
    //   ...s,
    //   status: "saved",
    // }));

    // setStudents(successStudents);

  } catch (error) {
    // console.error(error);

    // const failedStudents = students.map((s) => ({
    //   ...s,
    //   status: "error",
    // }));

    // setStudents(failedStudents);

  } finally {
    setIsBulkSaving(false);
  }
};
  
const filteredStudents = students.filter(s => 
  s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
  s.admissionNumber.includes(searchQuery)
);

const bulkAutoFill = (value: number) => {
  const updatedStudents = students.map((student) => {
    // Only fill if the current score is empty, null, or string "0"
    if (!student.currentScore || student.currentScore === "" || student.currentScore === "0") {
      return { ...student, currentScore: value.toString(), status: 'idle' as const };
    }
    return student;
  });
  setStudents(updatedStudents);
  
  // Optional: Show a quick toast to confirm how many were updated
  const count = updatedStudents.filter((s, i) => s.currentScore !== students[i].currentScore).length;
  if (count > 0) {
    // You could trigger your showToast state here with a custom message
  }
};

const downloadPDF = () => {
  const doc = new jsPDF();
  
  // 1. Add Header & Branding
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text(examTitle || 'Exam Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Academic Year: ${academicYearId || '2025/2026'} | Date: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // 2. Add Summary Stats
  const scores = students.map(s => Number(s.currentScore)).filter(s => !isNaN(s));
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : '0';
  
  doc.setDrawColor(240);
  doc.line(14, 35, 196, 35);
  doc.text(`Total Students: ${students.length}    |    Class Average: ${avg}%`, 14, 42);

  // 3. Generate Table
  autoTable(doc, {
    startY: 50,
    head: [['Student Name', 'Admission No.', 'Score (%)', 'Grade']],
    body: students.map(s => [
      s.name, 
      s.admissionNumber, 
      s.currentScore || '0', 
      calculateGrade(Number(s.currentScore)) // Reusing your existing logic
    ]),
    headStyles: { fillColor: [243, 244, 246], textColor: [31, 41, 55], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { top: 50 },
  });

  // 4. Save the File
  doc.save(`${examTitle?.replace(/\s+/g, '_')}_Grades.pdf`);
};

const calculateGrade = (score: number): string => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F'; // Default grade for scores below 40
};

return (
    <div className="p-8 mx-auto bg-gray-50 min-h-screen">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button onClick={() => window.history.back()} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{examTitle || 'Grade Entry'}</h1>
          <p className="text-gray-500">Managing {students.length} students</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-white px-4 py-2 rounded-xl border shadow-sm">
            <span className="text-sm text-gray-500 mr-2">Class Avg:</span>
            <span className="font-bold text-indigo-600 text-lg">{average}%</span>
          </div>

          <div className="relative group">
            <button className="flex items-center px-4 py-2 bg-white border border-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all shadow-sm font-semibold">
              <SparklesIcon className="h-5 w-5 mr-2" />
              Auto-fill
              <ChevronDownIcon className="h-4 w-4 ml-2 opacity-50" />
            </button>

            {/* Dropdown Menu - Appears on Hover/Click */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                Set Empty Rows To:
              </div>
              <button 
                onClick={() => bulkAutoFill(100)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-green-50 text-green-700 font-medium flex justify-between items-center"
              >
                Perfect Score <span>100</span>
              </button>
              <button 
                onClick={() => bulkAutoFill(50)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 text-indigo-700 font-medium flex justify-between items-center"
              >
                Pass Mark <span>50</span>
              </button>
              <button 
                onClick={() => bulkAutoFill(0)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-700 font-medium flex justify-between items-center"
              >
                Zero / Absent <span>0</span>
              </button>
            </div>
          </div>
          <button 
            onClick={downloadPDF}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-semibold active:scale-95"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-indigo-500" />
            Download PDF
          </button>
          <button className="flex items-center px-4 py-2 bg-white border rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium">
            <CloudArrowUpIcon className="h-5 w-5 mr-2 text-gray-400" /> Import
          </button>
          <button 
            onClick={saveAllGrades}
            disabled={isBulkSaving}
            className="flex items-center bg-indigo-600 text-white px-8 py-2 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 transition-all shadow-md active:scale-95"
          >
            {isBulkSaving ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircleIcon className="h-5 w-5 mr-2" />}
            {isBulkSaving ? 'Syncing...' : 'Publish Grades'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search name or admission number..." 
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {searchQuery && (
          <div className="text-sm text-gray-500 whitespace-nowrap px-2">
            Found <span className="font-bold text-gray-900">{filteredStudents.length}</span> results
          </div>
        )}
      </div>

      {/* Modern Card-Style Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Student Profile</th>
              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Adm No.</th>
              <th className="px-8 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-48">Score (0-100)</th>
              <th className="px-8 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Sync Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStudents && filteredStudents.length > 0 ? filteredStudents.map((student, idx) => {
              const scoreNum = Number(student.currentScore);
              const scoreColor = scoreNum >= 50 ? 'text-green-600' : scoreNum > 0 ? 'text-red-500' : 'text-gray-400';
              
              return (
                <tr key={student.id}
                    className={`group transition-all duration-700 ${
                      student.status === 'saved' ? 'bg-green-50/50' : 'hover:bg-indigo-50/30'
                    }`}>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 group-hover:scale-110 transition-transform">
                        <UserCircleIcon className="h-6 w-6" />
                      </div>
                      <span className="font-semibold text-gray-700">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-gray-500 font-mono text-sm">{student.admissionNumber}</td>
                  <td className="px-8 py-4">
                    <div className="relative max-w-[120px] mx-auto">
                      <input
                        type="number"
                        value={student.currentScore}
                        onChange={(e) => handleScoreChange(idx, e.target.value)}
                        className={`w-full text-center text-lg font-bold bg-gray-50 border-2 rounded-xl px-2 py-2 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none ${scoreColor} border-transparent focus:border-indigo-400`}
                        placeholder="--"
                      />
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <StatusBadge status={student.status} />
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={4} className="py-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No students found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-1">
                      We couldn't find any students matching <span className="font-medium text-indigo-600">"{searchQuery}"</span>. 
                      Check the spelling or try a different admission number.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 px-4 py-2 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-all"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Clear Search
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* The Success Toast */}
      <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${
        showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700">
          <div className="bg-green-500 rounded-full p-1">
            <CheckCircleIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Grades Published!</p>
            <p className="text-xs text-gray-400">All student records have been synced.</p>
          </div>
          <button 
            onClick={() => setShowToast(false)}
            className="ml-4 text-gray-500 hover:text-white transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}

// Extracted Sub-component for cleaner code
function StatusBadge({ status }: { status: string | undefined | null }) {
  const configs: any = {
    saving: { color: 'bg-yellow-100 text-yellow-700', icon: <ArrowPathIcon className="h-3 w-3 animate-spin" />, label: 'Saving' },
    saved: { color: 'bg-green-100 text-green-700', icon: <CheckCircleIcon className="h-3 w-3" />, label: 'Synced' },
    error: { color: 'bg-red-100 text-red-700', icon: <ExclamationCircleIcon className="h-3 w-3" />, label: 'Error' },
    idle: { color: 'bg-gray-100 text-gray-400', icon: null, label: 'Pending' },
  };

  // Fallback to 'idle' if the status is missing or doesn't exist in our config
  const currentConfig = configs[status as string] || configs.idle;

  const { color, icon, label } = currentConfig;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${color}`}>
      {icon} {label}
    </span>
  );
}