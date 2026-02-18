import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserIcon,
  ChevronLeftIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export default function ScheduleClient({ adminSlug, studentName, enrolledClasses }: { 
  adminSlug: string;
  studentName: string; 
  enrolledClasses: any[]; 
}) {

  // 1. Group schedules by Day
  const weeklyTimetable: Record<string, any[]> = {};
  DAYS.forEach(day => weeklyTimetable[day] = []);

  enrolledClasses.forEach((course: any) => {
    course.classSchedules?.forEach((slot: any) => {
      weeklyTimetable[slot.dayOfWeek.toUpperCase()].push({
        ...slot,
        courseName: course.name,
        room: course.room,
        attendance: course.attendance // Assuming attendance data is here
      });
    });
  });

  // 2. Sort by Time
  DAYS.forEach(day => {
    weeklyTimetable[day].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10 bg-[#fdfeff] min-h-screen">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col gap-4">
        <Link 
          href={`/admin/${adminSlug}/parentchildren`}
          className="flex items-center text-sm font-medium text-slate-400 hover:text-indigo-600 transition w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" /> Back to Children
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Academic Hub: <span className="text-indigo-600">{studentName}</span>
            </h1>
            <p className="text-slate-500 mt-1">Real-time attendance and weekly schedules.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-emerald-50 px-4 py-2 rounded-2xl text-emerald-700 text-sm font-bold flex items-center gap-2 border border-emerald-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Attendance Tracking
             </div>
          </div>
        </div>
      </div>

      {/* 2. ATTENDANCE SUMMARY DASHBOARD (The "Captivating" Part) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {enrolledClasses.map((course, idx) => {
          // Mocking percentage calculation - replace with your actual logic
          const attendancePercent = Math.floor(Math.random() * 20) + 80; 
          
          return (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ChartBarIcon className="h-20 w-20 text-indigo-600" />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">{course.name}</h3>
                  <p className="text-xs text-slate-400">Current Term Performance</p>
                </div>
                <div className="relative flex items-center justify-center">
                  {/* SVG Progress Circle */}
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                      strokeDasharray={125.6} 
                      strokeDashoffset={125.6 - (125.6 * attendancePercent) / 100} 
                      className="text-indigo-600" 
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold">{attendancePercent}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Attended</p>
                  <p className="text-lg font-black text-slate-800">18 <span className="text-xs font-normal text-slate-400">/ 20</span></p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                  <p className={`text-sm font-bold ${attendancePercent > 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {attendancePercent > 85 ? 'Excellent' : 'Good'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. WEEKLY TIMETABLE GRID */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ClockIcon className="h-6 w-6 text-indigo-500" />
          Weekly Schedule
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {DAYS.slice(0, 5).map((day) => (
            <div key={day} className="flex flex-col gap-4">
              <div className="bg-slate-50 border border-slate-200/50 py-2 rounded-xl text-center">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-tighter">{day}</h3>
              </div>

              <div className="space-y-3">
                {weeklyTimetable[day].length > 0 ? (
                  weeklyTimetable[day].map((session, idx) => {
                    const startTime = new Date(session.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    
                    return (
                      <div key={idx} className="bg-white border-l-4 border-l-indigo-500 border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-indigo-600">{startTime}</span>
                            {/* Visual Status Indicator */}
                            <div className="h-2 w-2 rounded-full bg-emerald-500" title="Attendance Marked" />
                          </div>
                          
                          <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                            {session.courseName}
                          </h4>
                          
                          <div className="pt-2 border-t border-slate-50 space-y-1.5">
                            <div className="flex items-center text-[11px] text-slate-500 font-medium">
                              <MapPinIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                              {session.room}
                            </div>
                            <div className="flex items-center text-[11px] text-slate-500 font-medium">
                              <UserIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                              {session.educator?.user?.name || "TBA"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-24 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Rest Day</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-indigo-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-800 p-3 rounded-2xl">
            <InformationCircleIcon className="h-6 w-6 text-indigo-200" />
          </div>
          <div>
            <p className="font-bold">Missing something?</p>
            <p className="text-sm text-indigo-200">Weekend activities and special seminars are managed by the Department Head.</p>
          </div>
        </div>
        <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
          Download PDF Schedule
        </button>
      </div>
    </div>
  );
}