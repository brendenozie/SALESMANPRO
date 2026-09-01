import React from "react";
import AdminAnnouncementsPage, {
  AnnouncementData,
  AcademicLevelOption,
  CourseOption,
  EducatorOption,
  StudentOption,
  DepartmentOption,
  ParentOption,
  AuthorOption
} from "./AdminAnnouncementsPage";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AnnouncementsManagerPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieHeaders = (await cookies()).toString();
  const session = await getAuthSession();

  // Safely resolve identifier used in layout
  const identifier = slug || session?.user?.id || '';

  // Retrieve memoized company details
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="p-8 text-center text-slate-500">
        Company workspace could not be identified or found.
      </div>
    );
  }

  const companyId = company.id;
  const requestConfig: RequestInit = {
    next: { revalidate: 60 },
    headers: { cookie: cookieHeaders },
  };

  // Helper function to safely fetch API data
  const fetchData = async <T,>(endpoint: string, transform?: (data: any[]) => T[]): Promise<T[]> => {
    try {
      const res = await fetch(`${apiBaseUrl}${endpoint}?companyId=${encodeURIComponent(companyId)}`, requestConfig);
      if (!res.ok) {
        console.warn(`[API Fetch Warning] Failed: ${endpoint} Status: ${res.status}`);
        return [];
      }
      const payload = await res.json();
      const rawData = payload?.data?.data || payload?.data || payload;
      const list = Array.isArray(rawData) ? rawData : [];
      return transform ? transform(list) : (list as T[]);
    } catch (err: any) {
      console.error(`[API Fetch Error] Failed on endpoint ${endpoint}:`, err.message);
      return [];
    }
  };

  // Execute fetch calls concurrently to prevent waterfalls
  const [
    initialAnnouncements,
    allAcademicLevels,
    allCourses,
    allEducators,
    allStudents,
    allDepartments,
    allParents,
    allAuthors,
  ] = await Promise.all([
    fetchData<AnnouncementData>('/admin/announcements'),
    fetchData<AcademicLevelOption>('/admin/academic-levels'),
    fetchData<CourseOption>('/admin/courses'),
    fetchData<EducatorOption>('/admin/educators', (raw) =>
      raw.map((e) => ({
        id: e.id,
        name: e.user?.name || 'Unnamed Teacher',
        email: e.user?.email || 'No email attached',
      }))
    ),
    fetchData<StudentOption>('/admin/students', (raw) =>
      raw.map((s) => ({
        id: s.id,
        name: s.user?.name || 'Student Member',
        email: s.user?.email || 'No email profile',
      }))
    ),
    fetchData<DepartmentOption>('/admin/departments'),
    fetchData<ParentOption>('/admin/parents', (raw) =>
      raw.map((p) => ({
        id: p.id,
        name: p.user?.name || 'Family Guardian',
        email: p.user?.email || 'No email recorded',
      }))
    ),
    fetchData<AuthorOption>('/admin/users', (raw) =>
      raw.map((u) => ({
        id: u.id,
        name: u.name || 'Staff User',
        email: u.email || 'System user',
      }))
    ),
  ]);

  return (
    <AdminAnnouncementsPage
      initialAnnouncements={initialAnnouncements}
      allAcademicLevels={allAcademicLevels}
      allCourses={allCourses}
      allEducators={allEducators}
      allStudents={allStudents}
      allDepartments={allDepartments}
      allParents={allParents}
      allAuthors={allAuthors}
      companyId={companyId}
      currentUserId={session?.user?.id}
    />
  );
}