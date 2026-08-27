'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO, isWeekend } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function AttendanceReportClient({ classroomId }: { classroomId: string }) {
  const [data, setData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-500 hover:bg-emerald-600 ring-emerald-200';
      case 'ABSENT': return 'bg-rose-500 hover:bg-rose-600 ring-rose-200';
      case 'TARDY': return 'bg-amber-400 hover:bg-amber-500 ring-amber-100';
      case 'EXCUSED': return 'bg-sky-400 hover:bg-sky-500 ring-sky-100';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Analytics</h1>
          <p className="text-slate-500 text-sm">Tracking student engagement for this classroom</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
            <button className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
              <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
            </button>
            <span className="px-4 py-1.5 text-sm font-semibold text-slate-700">
              {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}
            </span>
            <button className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
              <ChevronRightIcon className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm shadow-indigo-200">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. Main Heatmap Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="sticky left-0 z-20 bg-white p-4 border-b border-r border-slate-100 min-w-[240px] text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Student Information
                </th>
                {data?.daysInMonth.map((day: string) => (
                  <th key={day} className={`p-2 border-b border-slate-100 text-center min-w-[40px] ${isWeekend(parseISO(day)) ? 'bg-slate-100/50' : ''}`}>
                    <span className="block text-[10px] font-medium text-slate-400">{format(parseISO(day), 'EEE')}</span>
                    <span className="text-xs font-bold text-slate-700">{format(parseISO(day), 'dd')}</span>
                  </th>
                ))}
                <th className="p-4 border-b border-l border-slate-100 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.report.map((student: any) => (
                <tr key={student.studentId} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-4 border-r border-slate-100 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{student.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">ID: {student.studentId.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  
                  {data.daysInMonth.map((day: string) => {
                    const status = student.attendance[day];
                    return (
                      <td key={day} className={`p-1 border-slate-100 ${isWeekend(parseISO(day)) ? 'bg-slate-50/30' : ''}`}>
                        <div 
                          title={`${student.name} - ${day}: ${status || 'No Data'}`}
                          className={`w-full h-8 rounded-md transition-all cursor-help flex items-center justify-center ${getStatusStyle(status)} ring-inset hover:ring-2`}
                        >
                          {status && <span className="text-[10px] font-bold text-white/90">{status[0]}</span>}
                        </div>
                      </td>
                    );
                  })}

                  <td className="p-4 border-l border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col items-center">
                      <span className={`text-sm font-bold ${student.attendanceRate < 80 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {student.attendanceRate}%
                      </span>
                      <div className="w-12 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full ${student.attendanceRate < 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${student.attendanceRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Bottom Stats Footer */}
      <div className="flex flex-wrap gap-6 p-6 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium opacity-80">Present</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-sm font-medium opacity-80">Absent</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-sm font-medium opacity-80">Tardy</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs font-mono text-slate-400">
          * Hover over cells for detailed logs
        </div>
      </div>
    </div>
  );
}