'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  MapPinIcon, 
  VideoCameraIcon, 
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

interface ScheduleInfo {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: { id: string; name: string } | null;
  meetingLink?: string | null;
  topic?: string | null;
}

export default function WeeklyTimetable({ 
  schedules, 
  teacherName = "Professor", 
  primaryColor = "#4f46e5" 
}: { 
  schedules: ScheduleInfo[], 
  teacherName?: string,
  primaryColor?: string 
}) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const grouped = schedules.reduce<Record<string, ScheduleInfo[]>>((acc, s) => {
    if (!acc[s.day]) acc[s.day] = [];
    acc[s.day].push(s);
    acc[s.day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header: Hidden items are tagged with print:hidden */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm print:shadow-none print:border-none print:px-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-indigo-600 print:text-black" />
            Weekly Academic Planner
          </h2>
          <p className="text-slate-500 text-sm mt-1 print:block hidden">
            Schedule for {teacherName} • Generated on {new Date().toLocaleDateString()}
          </p>
          <p className="text-slate-500 text-sm mt-1 print:hidden">
            Review your teaching assignments across the week
          </p>
        </div>
        
        <div className="flex items-center gap-3 print:hidden">
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400">
                    <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="px-3 text-xs font-bold text-slate-700">Current Week</span>
                <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400">
                    <ChevronRightIcon className="h-4 w-4" />
                </button>
            </div>
            
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
                <PrinterIcon className="h-4 w-4" />
                Print
            </button>
        </div>
      </div>

      {/* 2. Grid Layout: print:grid-cols-7 ensures it stays horizontal on paper */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 print:grid-cols-7 print:gap-2">
        {days.map((day) => {
          const isToday = day === currentDay;
          const daySchedules = grouped[day] || [];

          return (
            <div 
                key={day} 
                className={`flex flex-col rounded-3xl transition-all duration-300 print:rounded-none print:border print:border-slate-200 ${
                    isToday 
                    ? 'bg-indigo-50/50 border-2 border-indigo-100 ring-4 ring-indigo-50/20 print:bg-white print:ring-0 print:border-slate-200' 
                    : 'bg-white border border-slate-100'
                }`}
            >
              <div className={`p-4 text-center border-b ${isToday ? 'border-indigo-100' : 'border-slate-50'} print:p-2`}>
                <span className={`text-xs font-black uppercase tracking-widest ${isToday ? 'text-indigo-600' : 'text-slate-400'} print:text-black print:text-[10px]`}>
                    {day}
                </span>
              </div>

              <div className="p-3 space-y-3 flex-1 min-h-[120px] print:p-1 print:space-y-1">
                {daySchedules.length > 0 ? (
                  daySchedules.map((s) => (
                    <div
                      key={s.id}
                      className="group bg-white p-3 rounded-2xl border border-slate-100 shadow-sm print:shadow-none print:border-slate-200 print:rounded-md print:p-2 relative overflow-hidden"
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1 print:hidden" 
                        style={{ backgroundColor: primaryColor }}
                      />
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 print:text-black">
                            <ClockIcon className="h-3 w-3 text-indigo-500 print:hidden" />
                            {s.startTime} - {s.endTime}
                        </div>
                        
                        <div className="text-sm font-bold text-slate-900 leading-tight print:text-[11px]">
                            {s.topic || 'Regular Session'}
                        </div>

                        {s.classroom && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium print:text-black">
                                <MapPinIcon className="h-3 w-3 print:hidden" />
                                {s.classroom.name}
                            </div>
                        )}

                        {/* Hidden on print */}
                        {s.meetingLink && (
                            <div className="print:hidden mt-2 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg">
                                <VideoCameraIcon className="h-3 w-3" />
                                Online
                            </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center py-8 print:hidden">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">No Classes</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Legend: print:hidden */}
      <div className="flex items-center gap-6 px-4 text-slate-400 print:hidden">
        <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span>Assigned Session</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
            <PrinterIcon className="h-3 w-3" />
            <span>Optimized for A4 Printing</span>
        </div>
      </div>
    </div>
  );
}
// 'use client';

// import React from 'react';
// import { motion } from 'framer-motion';
// import { 
//   ClockIcon, 
//   MapPinIcon, 
//   VideoCameraIcon, 
//   CalendarIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon
// } from '@heroicons/react/24/outline';

// interface ScheduleInfo {
//   id: string;
//   day: string;
//   startTime: string;
//   endTime: string;
//   classroom: { id: string; name: string } | null;
//   meetingLink?: string | null;
//   topic?: string | null;
// }

// export default function WeeklyTimetable({ schedules, primaryColor = "#4f46e5" }: { schedules: ScheduleInfo[], primaryColor?: string }) {
//   const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
//   const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });

//   const grouped = schedules.reduce<Record<string, ScheduleInfo[]>>((acc, s) => {
//     if (!acc[s.day]) acc[s.day] = [];
//     acc[s.day].push(s);
//     // Sort by start time
//     acc[s.day].sort((a, b) => a.startTime.localeCompare(b.startTime));
//     return acc;
//   }, {});

//   return (
//     <div className="space-y-6">
//       {/* Timetable Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
//         <div>
//           <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
//             <CalendarIcon className="h-6 w-6 text-indigo-600" />
//             Weekly Academic Planner
//           </h2>
//           <p className="text-slate-500 text-sm mt-1">Review your teaching assignments across the week</p>
//         </div>
        
//         <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
//             <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-900">
//                 <ChevronLeftIcon className="h-5 w-5" />
//             </button>
//             <span className="px-4 text-sm font-bold text-slate-700">Current Week</span>
//             <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-900">
//                 <ChevronRightIcon className="h-5 w-5" />
//             </button>
//         </div>
//       </div>

//       {/* Grid Layout */}
//       <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
//         {days.map((day) => {
//           const isToday = day === currentDay;
//           const daySchedules = grouped[day] || [];

//           return (
//             <div 
//                 key={day} 
//                 className={`flex flex-col rounded-3xl transition-all duration-300 ${
//                     isToday 
//                     ? 'bg-indigo-50/50 border-2 border-indigo-100 ring-4 ring-indigo-50/20' 
//                     : 'bg-white border border-slate-100'
//                 }`}
//             >
//               {/* Day Header */}
//               <div className={`p-4 text-center border-b ${isToday ? 'border-indigo-100' : 'border-slate-50'}`}>
//                 <span className={`text-xs font-black uppercase tracking-widest ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
//                     {day.substring(0, 3)}
//                 </span>
//                 {isToday && (
//                     <div className="mt-1 h-1.5 w-1.5 bg-indigo-500 rounded-full mx-auto" />
//                 )}
//               </div>

//               {/* Sessions List */}
//               <div className="p-3 space-y-3 flex-1 min-h-[150px]">
//                 {daySchedules.length > 0 ? (
//                   daySchedules.map((s) => (
//                     <motion.div
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       key={s.id}
//                       className="group bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all relative overflow-hidden"
//                     >
//                       {/* Left color bar */}
//                       <div 
//                         className="absolute left-0 top-0 bottom-0 w-1" 
//                         style={{ backgroundColor: primaryColor }}
//                       />
                      
//                       <div className="flex flex-col gap-1.5">
//                         <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
//                             <ClockIcon className="h-3.5 w-3.5 text-indigo-500" />
//                             {s.startTime}
//                         </div>
                        
//                         <div className="text-sm font-bold text-slate-900 leading-tight">
//                             {s.topic || 'Regular Session'}
//                         </div>

//                         {s.classroom && (
//                             <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
//                                 <MapPinIcon className="h-3 w-3" />
//                                 {s.classroom.name}
//                             </div>
//                         )}

//                         {s.meetingLink && (
//                             <a
//                                 href={s.meetingLink}
//                                 target="_blank"
//                                 className="mt-2 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
//                             >
//                                 <VideoCameraIcon className="h-3 w-3" />
//                                 Join Class
//                             </a>
//                         )}
//                       </div>
//                     </motion.div>
//                   ))
//                 ) : (
//                   <div className="h-full flex flex-col items-center justify-center opacity-30 py-8">
//                     <div className="text-2xl">🌙</div>
//                     <span className="text-[10px] font-bold uppercase tracking-tighter mt-2">Free</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Footer Info */}
//       <div className="flex items-center gap-6 px-4 text-slate-400">
//         <div className="flex items-center gap-2 text-xs">
//             <div className="h-3 w-3 rounded-full" style={{ backgroundColor: primaryColor }} />
//             <span>Assigned Course Session</span>
//         </div>
//         <div className="flex items-center gap-2 text-xs">
//             <div className="h-3 w-3 rounded-full bg-slate-200" />
//             <span>Classroom/Location</span>
//         </div>
//       </div>
//     </div>
//   );
// }