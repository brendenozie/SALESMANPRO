// app/admin/[slug]/announcements/page.tsx
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

import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AnnouncementsManagerPage({ params }: PageProps) {
  const { slug: companyId } = await params;
  const cookieHeaders = (await cookies()).toString();

  let initialAnnouncements: AnnouncementData[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allStudents: StudentOption[] = [];
  let allDepartments: DepartmentOption[] = [];
  let allParents: ParentOption[] = [];
  let allAuthors: AuthorOption[] = [];
  let fetchError: boolean = false;

  const requestConfig = {
    next: { revalidate: 60 },
    headers: { cookie: cookieHeaders },
  };

  try {
    // 1. Fetch announcements
    const announcementsRes = await fetch(`${apiBaseUrl}/admin/announcements?companyId=${encodeURIComponent(companyId)}`, requestConfig);
    if (announcementsRes.ok) {
      const payload = await announcementsRes.json();
      initialAnnouncements = (payload?.data.data || payload?.data || payload) as AnnouncementData[];
    } else {
      console.warn(`[Announcements Link] Could not retrieve existing announcements. Status code: ${announcementsRes.status}`);
      fetchError = true;
    }

    // 2. Fetch academic grade levels
    const academicLevelsRes = await fetch(`${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`, requestConfig);
    if (academicLevelsRes.ok) {
      const payload = await academicLevelsRes.json();
      allAcademicLevels = (payload?.data || payload) as AcademicLevelOption[];
    } else {
      console.warn(`[Academic Levels Link] Could not load grade structures.`);
      fetchError = true;
    }

    // 3. Fetch school learning courses
    const coursesRes = await fetch(`${apiBaseUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`, requestConfig);
    if (coursesRes.ok) {
      const payload = await coursesRes.json();
      allCourses = (payload?.data || payload) as CourseOption[];
    } else {
      console.warn(`[Courses Link] Could not retrieve directory classes.`);
      fetchError = true;
    }

    // 4. Fetch teachers & educators
    const educatorsRes = await fetch(`${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`, requestConfig);
    if (educatorsRes.ok) {
      const payload = await educatorsRes.json();
      const rawList = (payload?.data || payload) as any[];
      allEducators = rawList.map(e => ({
        id: e.id,
        name: e.user?.name || 'Unnamed Teacher',
        email: e.user?.email || 'No email attached'
      }));
    } else {
      console.warn(`[Educators Link] Could not communicate with staff data registries.`);
      fetchError = true;
    }

    // 5. Fetch student rosters
    const studentsRes = await fetch(`${apiBaseUrl}/admin/students?companyId=${encodeURIComponent(companyId)}`, requestConfig);
    if (studentsRes.ok) {
      const payload = await studentsRes.json();
      const rawList = (payload?.data || payload) as any[];
      allStudents = rawList.map(s => ({
        id: s.id,
        name: s.user?.name || 'Student Member',
        email: s.user?.email || 'No email profile'
      }));
    } else {
      console.warn(`[Students Link] Failed to safely load pupil records.`);
      fetchError = true;
    }

    // 6. Fetch work office departments
    const departmentsRes = await fetch(`${apiBaseUrl}/admin/departments?companyId=${encodeURIComponent(companyId)}`, requestConfig);
    if (departmentsRes.ok) {
      const payload = await departmentsRes.json();
      allDepartments = (payload?.data?.data || payload?.data || payload) as DepartmentOption[];
    } else {
      console.warn(`[Departments Link] Office department layout response was unreachable.`);
      fetchError = true;
    }

    // 7. Fetch family parent contacts
    const parentsRes = await fetch(`${apiBaseUrl}/admin/parents?companyId=${encodeURIComponent(companyId)}`, requestConfig);
    if (parentsRes.ok) {
      const payload = await parentsRes.json();
      const rawList = (payload?.data || payload) as any[];
      allParents = rawList.map(p => ({
        id: p.id,
        name: p.user?.name || 'Family Guardian',
        email: p.user?.email || 'No email recorded'
      }));
    } else {
      console.warn(`[Parents Link] Family directory was unavailable.`);
      fetchError = true;
    }

    // 8. Fetch official verified post authors
    const authorsRes = await fetch(`${apiBaseUrl}/admin/users?companyId=${encodeURIComponent(companyId)}`, requestConfig);
    if (authorsRes.ok) {
      const payload = await authorsRes.json();
      const rawList = (payload?.data || payload) as any[];
      allAuthors = rawList.map(u => ({
        id: u.id,
        name: u.name || 'Staff User',
        email: u.email || 'System user'
      }));
    } else {
      console.warn(`[Authors Link] Author matching index was offline.`);
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[Data Hub Link Failure] Something went wrong parsing backend resources:", err.message);
    fetchError = true;
  }

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
    />
  );
}