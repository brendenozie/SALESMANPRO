'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { formatResponse } from "@/lib/formatResponse";

interface StudentGradeRow {
  studentId: string;
  name: string;
  admissionNumber: string;
  currentScore: number | string;
  gradeId?: string; // If a grade already exists
  status: 'idle' | 'saving' | 'saved' | 'error';
}

export default function AssignmentsGradesClient({ assignmentId, courseId, classroomId, companyId, examTitle,initialStudents  }: { assignmentId: string, courseId: string, classroomId?: string, companyId?: string, examTitle?: string, initialStudents: StudentGradeRow[] }) {
  const [students, setStudents] = useState<StudentGradeRow[]>(initialStudents);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // 1. Fetch eligible students and existing grades
  // useEffect(() => {
  //   const loadData = async () => {
  //     // Query students based on Course or Classroom
  //     const res = await fetch(`/api/exams/${examId}/eligible-students?classroomId=${classroomId}`,{credentials: 'include'}); // Ensure cookies are sent for auth
  //     const data = await res.json();
  //     if (data.success) {
  //       setStudents(data.data.map((s: any) => ({
  //         studentId: s.id,
  //         name: s.name,
  //         admissionNumber: s.admissionNumber,
  //         currentScore: s.existingGrade?.score || '',
  //         gradeId: s.existingGrade?.id,
  //         status: 'idle'
  //       })));
  //     }
  //   };
  //   loadData();
  // }, [examId, classroomId]);

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
    try {
      const gradesToSave = students.map(s => ({
        studentId: s.studentId,
        courseAssignmentId: assignmentId,
        courseId: courseId,
        companyId: companyId,
        term: "Fall", // You might want to make this dynamic
        year: new Date().getFullYear(), // Or get from context
        score: parseFloat(s.currentScore as string) || 0,
      }));

      const res = await fetch(`/api/admin/grades/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ grades: gradesToSave }),
      });

      if (res.ok) alert("Grades updated successfully!");
    } catch (error) {
      console.error("Failed to save grades", error);
    } finally {
      setIsBulkSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => window.history.back()} className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Assignments
        </button>
        <div className="flex gap-4">
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <CloudArrowUpIcon className="h-5 w-5 mr-2" /> Import CSV
          </button>
          <button 
            onClick={saveAllGrades}
            disabled={isBulkSaving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isBulkSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* Grading Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adm No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students && students.length > 0 && students.map((student, idx) => (
              <tr key={student.studentId}>
                <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 text-gray-500">{student.admissionNumber}</td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={student.currentScore}
                    onChange={(e) => handleScoreChange(idx, e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0.0"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {student.gradeId ? <span className="text-green-600">Edit Mode</span> : <span className="text-blue-600">New Entry</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}