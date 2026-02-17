'use client';
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

export default function GradesClientPage({ initialData }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {initialData.map((data: any) => {
        const isImproving = data.currentScore >= data.previousScore;

        return (
          <div key={data.subject} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{data.subject}</h3>
                <span className="text-sm font-medium text-slate-400">Current Term</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${isImproving ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {isImproving ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                {Math.abs(data.currentScore - data.previousScore)}%
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Big Score Circle */}
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * data.currentScore) / 100}
                    className={`${isImproving ? 'text-indigo-600' : 'text-rose-500'} transition-all duration-1000`}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-slate-900">{data.grade}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{data.currentScore}%</p>
                </div>
              </div>

              {/* Sparkline Chart */}
              <div className="flex-1 h-32 w-full">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Performance Trend</p>
                {/* <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.history}>
                    <Line type="monotone" dataKey="score" stroke={isImproving ? "#4f46e5" : "#f43f5e"} strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </LineChart>
                </ResponsiveContainer> */}
              </div>
            </div>

            {/* Teacher Feedback */}
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Teacher's Note</p>
              <p className="text-sm text-slate-600 italic">"{data.teacherFeedback}"</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}