// app/admin/[adminSlug]/parentschedule/page.tsx
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import ScheduleClientPage from './ScheduleClientPage';

export interface ClassSession {
  id: string;
  subject: string;
  room: string;
  startTime: string; // e.g., "08:00"
  endTime: string;   // e.g., "09:30"
  teacher: string;
  type: 'academic' | 'break' | 'extracurricular';
}

export default async function ParentSchedulePage({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;

  // Sample Data for Today
  const todaySchedule: ClassSession[] = [
    { id: '1', subject: 'Mathematics', room: 'Room 3B', startTime: '08:00', endTime: '09:30', teacher: 'Mr. Kamau', type: 'academic' },
    { id: '2', subject: 'English Literature', room: 'Library', startTime: '09:45', endTime: '11:15', teacher: 'Mrs. Anyango', type: 'academic' },
    { id: '3', subject: 'Morning Break', room: 'Cafeteria', startTime: '11:15', endTime: '11:45', teacher: 'Staff', type: 'break' },
    { id: '4', subject: 'Physics Lab', room: 'Lab 2', startTime: '11:45', endTime: '13:15', teacher: 'Mr. Omondi', type: 'academic' },
    { id: '5', subject: 'Lunch', room: 'Cafeteria', startTime: '13:15', endTime: '14:00', teacher: 'Staff', type: 'break' },
    { id: '6', subject: 'Football Practice', room: 'Main Field', startTime: '14:00', endTime: '16:00', teacher: 'Coach Mike', type: 'extracurricular' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-[#f8fafc] min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daily Schedule</h1>
          <p className="text-slate-500 mt-1">Real-time view of classes and activities.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Today</p>
          <p className="text-lg font-bold text-slate-700">Monday, 16th Feb</p>
        </div>
      </div>

      <ScheduleClientPage initialSchedule={todaySchedule} />
    </div>
  );
}