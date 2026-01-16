import { ClockIcon, MapPinIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

function getTodayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}


interface ScheduleInfo {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: {
    id: string;
    name: string;
  } | null;
  academicLevel?: {
    id: string;
    name: string;
  } | null;
  topic?: string | null;
  meetingLink?: string | null;
}

export function TodaysClasses({ teacherClasses }: { teacherClasses: any[] }) {
  const today = getTodayName();

  const todayClasses = teacherClasses.flatMap(c =>
    c.schedules
      .filter((s: ScheduleInfo) => s.day === today)
      .map((s: ScheduleInfo) => ({ ...s, courseTitle: c.title }))
  );

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="text-lg font-bold mb-4">Today’s Classes</h2>

      {todayClasses.length === 0 && (
        <p className="text-sm text-gray-500">No classes today 🎉</p>
      )}

      <div className="space-y-3">
        {todayClasses.map(c => (
          <div key={c.id} className="flex justify-between items-center border p-3 rounded-lg">
          <div>
            <p className="font-medium">{c.courseTitle}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4" />
              {c.startTime} - {c.endTime}
            </div>

            {c.classroom && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4" />
                {c.classroom.name}
              </div>
            )}
          </div>

          {c.meetingLink && (
            <a
              href={c.meetingLink}
              target="_blank"
              className="px-3 py-2 rounded bg-indigo-600 text-white text-sm"
            >
              Join
            </a>
          )}
        </div>
        ))}
      </div>
    </div>
  );
}
