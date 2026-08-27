// app/admin/[adminSlug]/parentgrades/page.tsx
import { ChartBarIcon, AcademicCapIcon, ArrowTrendingUpIcon, TrophyIcon } from '@heroicons/react/24/outline';
import GradesClientPage from './GradesClientPage';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

export interface SubjectGrade {
  subject: string;
  currentScore: number;
  previousScore: number;
  grade: string;
  teacherFeedback: string;
  history: { date: string; score: number }[]; // For the line chart
}

export default async function ParentGradesPage({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;


    // const { slug } = await params;
  
    // const session = await getAuthSession();
  
    // // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    // const identifier = slug || session?.user?.id || '';
  
    // // 2. Retrieve the memoized company data (no extra DB cost)
    // const company = await findCompanyCached(identifier, "page");
  
    // if (!company) {
    //   return <div>Company not found</div>;
    // }
  
    // // Use the actual database ID for your API calls, ensuring consistency
    // const companyId = company.id;

  // Sample Data for Zane
  const gradeData: SubjectGrade[] = [
    {
      subject: 'Mathematics',
      currentScore: 88,
      previousScore: 82,
      grade: 'A-',
      teacherFeedback: 'Strong improvement in Algebra. Needs focus on Geometry.',
      history: [
        { date: 'Jan', score: 75 }, { date: 'Feb', score: 82 }, { date: 'Mar', score: 88 }
      ]
    },
    {
      subject: 'English',
      currentScore: 92,
      previousScore: 94,
      grade: 'A',
      teacherFeedback: 'Excellent creative writing skills. Consistent performance.',
      history: [
        { date: 'Jan', score: 90 }, { date: 'Feb', score: 94 }, { date: 'Mar', score: 92 }
      ]
    },
    {
      subject: 'Science',
      currentScore: 78,
      previousScore: 70,
      grade: 'B+',
      teacherFeedback: 'Great work on the lab project. Physics concepts are sticking!',
      history: [
        { date: 'Jan', score: 65 }, { date: 'Feb', score: 70 }, { date: 'Mar', score: 78 }
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-[#f8fafc] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Academic Performance</h1>
          <p className="text-slate-500 mt-1">Detailed breakdown of subject mastery and term progress.</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <TrophyIcon className="h-8 w-8 text-amber-500" />
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Current GPA</p>
            <p className="text-xl font-black text-slate-900">3.8 / 4.0</p>
          </div>
        </div>
      </div>

      <GradesClientPage initialData={gradeData} />
    </div>
  );
}