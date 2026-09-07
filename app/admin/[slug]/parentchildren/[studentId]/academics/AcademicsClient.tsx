import { notFound } from 'next/navigation';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  UserIcon, 
  ClockIcon,
  ChevronLeftIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// Helper to determine color based on grade
const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50 border-blue-100';
  if (grade.startsWith('C')) return 'text-amber-600 bg-amber-50 border-amber-100';
  if (grade === 'N/A') return 'text-slate-400 bg-slate-50 border-slate-100';
  return 'text-rose-600 bg-rose-50 border-rose-100';
};

export default function AcademicsClient({ 
  adminSlug, studentId, studentName, studentGradeLevel, enrolledClasses 
}:any) {
  // const { adminSlug, studentId } = await params;
  // const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  // 1. Fetch data from our student-classes API
  // const response = await fetch(`${apiBaseUrl}/parent/student-classes?studentId=${studentId}`, {
  //   cache: 'no-store',
  //   credentials: 'include'
  // });

  // let result = await response.json();

  // if (!result.success) {
  //   // return notFound();
  //   //SAMPLE dATA
  //   result={
  //     data:{
  //       studentName:"John Doe",
  //       studentGradeLevel:"5th Grade",
  //       enrolledClasses:[
  //         {
  //           id:"1",
  //           name:"Mathematics",
  //           room:"101",
  //           teacher:"Mr. Smith",
  //           schedule:"Mon/Wed/Fri 9:00-10:00 AM",
  //           currentGrade:"A-",
  //           upcomingAssignmentsCount:2,
  //           nextAssignmentDue:"2024-07-01"
  //         },
  //         {
  //           id:"2",
  //           name:"History",
  //           room:"202",
  //           teacher:"Ms. Johnson",
  //           schedule:"Tue/Thu 11:00-12:30 PM",
  //           currentGrade:"B+",
  //           upcomingAssignmentsCount:1,
  //           nextAssignmentDue:"2024-07-03"
  //         }
  //       ]
  //     }
  //   }
  // }

  // const { } = result.data;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-[#fdfeff] min-h-screen">
      {/* Header & Navigation */}
      <div className="flex flex-col gap-4">
        <Link 
          href={`/admin/${adminSlug}/parentchildren`}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" /> Back to Children
        </Link>
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Academic Overview: <span className="text-indigo-600">{studentName}</span>
            </h1>
            <p className="text-slate-500 mt-1 flex items-center">
              <AcademicCapIcon className="h-4 w-4 mr-2" /> {studentGradeLevel}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Subjects Table/List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/30">
            <h2 className="font-bold text-slate-800 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2 text-indigo-500" /> 
              Enrolled Courses & Performance
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/50">
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Current Grade</th>
                  <th className="px-6 py-4">Upcoming Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {enrolledClasses.map((course: any) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700 group-hover:text-indigo-600 transition">
                        {course.name}
                      </p>
                      <p className="text-xs text-slate-400">Room: {course.room}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <UserIcon className="h-4 w-4 mr-2 text-slate-300" />
                        {course.teacher}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-slate-500 italic">
                        <ClockIcon className="h-3.5 w-3.5 mr-1.5 text-slate-300" />
                        {course.schedule}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(course.currentGrade)}`}>
                        {course.currentGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">
                          {course.upcomingAssignmentsCount} Pending
                        </span>
                        <span className="text-[10px] text-rose-500 font-bold">
                          Next: {course.nextAssignmentDue}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {enrolledClasses.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <BookOpenIcon className="h-12 w-12 mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No courses found</h3>
            <p className="text-slate-500">This student is not currently enrolled in any academic courses.</p>
          </div>
        )}
      </div>
    </div>
  );
}