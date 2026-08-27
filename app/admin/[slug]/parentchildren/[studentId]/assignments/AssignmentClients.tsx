import { notFound } from 'next/navigation';
import { 
  ClipboardDocumentListIcon, 
  CalendarIcon, 
  TagIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function StudentAssignmentsPage({ 
  adminSlug, studentName, enrolledClasses  
}: { 
  adminSlug: string;
  studentName: string; 
  enrolledClasses: any[];
}) {
  // const { adminSlug, studentId } = await params;
  // const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // // Fetch the student's specific class data
  // const response = await fetch(`${baseUrl}/api/parent/student-classes?studentId=${studentId}`, {
  //   cache: 'no-store',
  // });

  // const result = await response.json();

  // if (!result.success) return notFound();

  // const { studentName, enrolledClasses } = enrolledClasses; // Assuming enrolledClasses is already the data we need

  // Flatten all assignments from all courses into one list
  const allAssignments = enrolledClasses.flatMap((course: any) => 
    course.assignments?.map((asg: any) => ({
      ...asg,
      courseName: course.name,
      teacher: course.teacher
    })) || []
  );

  // Sort by due date (soonest first)
  const sortedAssignments = allAssignments.sort((a: any, b: any) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

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
        
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Active Assignments: <span className="text-indigo-600">{studentName}</span>
          </h1>
          <p className="text-slate-500 mt-1">Review upcoming homework, projects, and deadlines.</p>
        </div>
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedAssignments.length > 0 ? (
          sortedAssignments.map((asg: any) => {
            const isOverdue = new Date(asg.dueDate) < new Date();
            
            return (
              <div key={asg.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all relative overflow-hidden group">
                {/* Overdue Indicator */}
                {isOverdue && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                    Overdue
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</span>
                    <p className={`text-sm font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-900'} flex items-center justify-end`}>
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(asg.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition">
                    {asg.title || "Untitled Assignment"}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{asg.courseName}</span>
                    <span className="text-slate-400 flex items-center">
                      <TagIcon className="h-3 w-3 mr-1" /> {asg.type || 'Homework'}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-500 line-clamp-2 italic">
                  "{asg.description || 'No additional instructions provided.'}"
                </p>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex items-center text-xs text-slate-400">
                    <CheckCircleIcon className="h-4 w-4 mr-1 text-slate-300" />
                    Status: <span className="ml-1 font-semibold text-slate-600">{asg.status}</span>
                  </div>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider">
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="lg:col-span-2 text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <ExclamationCircleIcon className="h-12 w-12 mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
            <p className="text-slate-500">There are no active assignments for {studentName} at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}