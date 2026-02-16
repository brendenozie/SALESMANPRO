// app/admin/[adminSlug]/parentchildren/page.tsx
import { notFound } from 'next/navigation';
import {
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { cookies } from 'next/headers';
import ChildrenClientPage from './ChildrenClientPage'; 

// --- Interface for Child Profile ---
export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  grade: string;
  schoolName: string;
  profileImageUrl?: string;
  attendance: number; // Percentage
  avgGrade: string; // e.g., "A-"
  pendingAssignments: number;
  lastActivity: string;
}

const SummaryCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className={`p-6 rounded-2xl shadow-sm border border-white/20 backdrop-blur-md transition-all duration-300 hover:shadow-lg ${colorClass} text-white`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
      </div>
      <Icon className="h-8 w-8 opacity-40" />
    </div>
  </div>
);

export default async function ParentChildrenPage({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;

  // Sample Data (Replace with your actual Fetch logic)
  const initialChildren: ChildProfile[] = [
    {
      id: 'CH001',
      name: 'Zane Malik',
      age: 12,
      grade: 'Grade 7',
      schoolName: 'Nairobi Academy',
      profileImageUrl: 'https://images.unsplash.com/photo-1519238263530-99bbe18d5d67?q=80&w=200',
      attendance: 98,
      avgGrade: 'A',
      pendingAssignments: 3,
      lastActivity: new Date().toISOString(),
    },
    {
      id: 'CH002',
      name: 'Sarah Malik',
      age: 9,
      grade: 'Grade 4',
      schoolName: 'Nairobi Academy',
      profileImageUrl: 'https://images.unsplash.com/photo-1519238263530-99bbe18d5d67?q=80&w=200',
      attendance: 94,
      avgGrade: 'B+',
      pendingAssignments: 1,
      lastActivity: new Date().toISOString(),
    }
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-[#fdfeff] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Children <span className="text-indigo-600">✨</span>
          </h1>
          <p className="text-slate-500 mt-1">Track your children's academic progress and daily activities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total Children" value={initialChildren.length} icon={UsersIcon} colorClass="bg-indigo-600" />
        <SummaryCard title="Avg. Attendance" value="96%" icon={CheckBadgeIcon} colorClass="bg-emerald-500" />
        <SummaryCard title="Pending Tasks" value="4" icon={ClockIcon} colorClass="bg-amber-500" />
        <SummaryCard title="Overall Grade" value="A-" icon={AcademicCapIcon} colorClass="bg-rose-500" />
      </div>

      <ChildrenClientPage adminSlug={adminSlug} initialData={initialChildren} />
    </div>
  );
}