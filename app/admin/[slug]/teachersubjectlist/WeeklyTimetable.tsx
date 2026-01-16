'use client';

import { ClockIcon, MapPinIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface ScheduleInfo {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: { id: string; name: string } | null;
  meetingLink?: string | null;
  topic?: string | null;
}

export default function WeeklyTimetable({ schedules }: { schedules: ScheduleInfo[] }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const grouped = schedules.reduce<Record<string, ScheduleInfo[]>>((acc, s) => {
    if (!acc[s.day]) acc[s.day] = [];
    acc[s.day].push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Weekly Timetable</h1>

      <div className="grid md:grid-cols-5 gap-4">
        {days.map(day => (
          <div key={day} className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-3">{day}</h3>

            <div className="space-y-3">
              {(grouped[day] || []).map(s => (
                <div key={s.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-4 w-4" />
                    {s.startTime} - {s.endTime}
                  </div>

                  {s.classroom && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4" />
                      {s.classroom.name}
                    </div>
                  )}

                  {s.meetingLink && (
                    <a
                      href={s.meetingLink}
                      target="_blank"
                      className="mt-2 inline-flex items-center gap-2 text-indigo-600 text-sm"
                    >
                      <VideoCameraIcon className="h-4 w-4" />
                      Join Meeting
                    </a>
                  )}
                </div>
              ))}

              {(grouped[day] || []).length === 0 && (
                <p className="text-xs text-gray-400">No classes</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
