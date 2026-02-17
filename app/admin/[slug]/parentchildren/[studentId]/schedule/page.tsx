import { notFound } from 'next/navigation';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserIcon,
  ChevronLeftIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export default async function StudentSchedulePage({ 
  params 
}: { 
  params: Promise<{ adminSlug: string; studentId: string }> 
}) {
  const { adminSlug, studentId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const response = await fetch(`${baseUrl}/api/parent/student-classes?studentId=${studentId}`, {
    cache: 'no-store',
  });

  const result = await response.json();
  if (!result.success) return notFound();

  const { studentName, enrolledClasses } = result.data;

  // 1. Group schedules by Day of the Week
  const weeklyTimetable: Record<string, any[]> = {};
  DAYS.forEach(day => weeklyTimetable[day] = []);

  enrolledClasses.forEach((course: any) => {
    course.classSchedules?.forEach((slot: any) => {
      weeklyTimetable[slot.dayOfWeek.toUpperCase()].push({
        ...slot,
        courseName: course.name,
        room: course.room
      });
    });
  });

  // 2. Sort each day by Start Time
  DAYS.forEach(day => {
    weeklyTimetable[day].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-[#fdfeff] min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href={`/admin/${adminSlug}/parentchildren`}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" /> Back to Children
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Class Schedule: <span className="text-indigo-600">{studentName}</span>
            </h1>
            <p className="text-slate-500 mt-1">Weekly timetable and classroom locations.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl text-indigo-700 text-sm font-semibold">
            <CalendarDaysIcon className="h-5 w-5" />
            Active Term
          </div>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DAYS.slice(0, 5).map((day) => (
          <div key={day} className="space-y-4">
            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-sm text-center">
              <h3 className="text-xs font-bold uppercase tracking-widest">{day.slice(0, 3)}</h3>
            </div>

            <div className="space-y-3">
              {weeklyTimetable[day].length > 0 ? (
                weeklyTimetable[day].map((session, idx) => {
                  const startTime = new Date(session.startTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', minute: '2-digit', hour12: true 
                  });
                  const endTime = new Date(session.endTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', minute: '2-digit', hour12: true 
                  });

                  return (
                    <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:border-indigo-200 transition-all group">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                          {startTime}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-indigo-600">
                          {session.courseName}
                        </h4>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-[11px] text-slate-500">
                            <MapPinIcon className="h-3 w-3 mr-1 text-slate-400" />
                            {session.room}
                          </div>
                          <div className="flex items-center text-[11px] text-slate-500">
                            <UserIcon className="h-3 w-3 mr-1 text-slate-400" />
                            {session.educator?.user?.name || "TBA"}
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-300 font-medium">Ends {endTime}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">No Classes</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Weekend Note */}
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
        <InformationCircleIcon className="h-5 w-5 text-amber-500 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Weekend classes (Saturday/Sunday) are currently hidden. Contact administration if your child has weekend extracurricular activities.
        </p>
      </div>
    </div>
  );
}