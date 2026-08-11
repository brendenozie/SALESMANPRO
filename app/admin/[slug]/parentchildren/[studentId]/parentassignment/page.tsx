// app/admin/[adminSlug]/parentassignments/page.tsx
import { notFound } from 'next/navigation';
import { 
  ClipboardDocumentCheckIcon, 
  ExclamationCircleIcon, 
  ClockIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import AssignmentsClientPage from './AssignmentsClientPage';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

export interface Assignment {
  id: string;
  childName: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'overdue' | 'pending' | 'completed';
  points: number;
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default async function ParentAssignmentsPage({ params }: { params: Promise<{ adminSlug: string }> }) {
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

  // Sample Data
  const initialAssignments: Assignment[] = [
    { id: '1', childName: 'Zane Malik', subject: 'Mathematics', title: 'Quadratic Equations Lab', dueDate: '2026-02-18T23:59:59Z', status: 'pending', points: 100 },
    { id: '2', childName: 'Sarah Malik', subject: 'History', title: 'The Great Rift Valley Essay', dueDate: '2026-02-14T23:59:59Z', status: 'overdue', points: 50 },
    { id: '3', childName: 'Zane Malik', subject: 'Physics', title: 'Thermodynamics Quiz', dueDate: '2026-02-20T23:59:59Z', status: 'pending', points: 20 },
    { id: '4', childName: 'Sarah Malik', subject: 'Art', title: 'Color Theory Project', dueDate: '2026-02-12T23:59:59Z', status: 'completed', points: 100 },
  ];

  const overdueCount = initialAssignments.filter(a => a.status === 'overdue').length;
  const pendingCount = initialAssignments.filter(a => a.status === 'pending').length;

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-[#fbfcfd] min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assignment Tracker</h1>
        <p className="text-slate-500 mt-1">Keep track of upcoming deadlines and submission statuses.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={initialAssignments.length} icon={ClipboardDocumentCheckIcon} color="bg-indigo-500" />
        <StatCard title="Overdue" value={overdueCount} icon={ExclamationCircleIcon} color="bg-rose-500" />
        <StatCard title="Upcoming" value={pendingCount} icon={ClockIcon} color="bg-amber-500" />
        <StatCard title="Completed" value="1" icon={CheckCircleIcon} color="bg-emerald-500" />
      </div>

      <AssignmentsClientPage initialAssignments={initialAssignments} />
    </div>
  );
}