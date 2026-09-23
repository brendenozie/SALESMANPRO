import { notFound } from 'next/navigation';
import {
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import ChildrenClientPage from './ChildrenClientPage';
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// --- Interface for Child Profile ---
export interface ChildProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  grade: string;
  schoolName: string;
  profileImageUrl?: string;
  attendance: number;
  avgGrade: string;
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

import { serverFetchJson } from "@/lib/api/serverFetch";

export default async function ParentChildrenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const parentId = session?.user?.id;

  let stats = {
    totalChildren: 0,
    avgFamilyAttendance: 0,
    totalFamilyPending: 0,
  };
  let children: any[] = [];

  if (parentId) {
    const res = await serverFetchJson(
      `/api/parent/children?userId=${encodeURIComponent(parentId)}`
    );

    if (res.ok && res.data) {
      stats = res.data.stats || stats;
      children = res.data.children || [];
    }
  }

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

      {/* 2. Using Stats from the API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Children" 
          value={stats.totalChildren} 
          icon={UsersIcon} 
          colorClass="bg-indigo-600" 
        />
        <SummaryCard 
          title="Avg. Attendance" 
          value={`${stats.avgFamilyAttendance}%`} 
          icon={CheckBadgeIcon} 
          colorClass="bg-emerald-500" 
        />
        <SummaryCard 
          title="Pending Tasks" 
          value={stats.totalFamilyPending} 
          icon={ClockIcon} 
          colorClass="bg-amber-500" 
        />
        <SummaryCard 
          title="Overall Status" 
          value="Healthy" 
          icon={AcademicCapIcon} 
          colorClass="bg-rose-500" 
        />
      </div>

      {/* 3. Passing dynamic data to the Client Page */}
      <ChildrenClientPage adminSlug={slug} initialData={children} />
    </div>
  );
}