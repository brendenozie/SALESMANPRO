// app/admin/[slug]/events/page.tsx
import React from "react";
import AdminEventsPage, {
  EventData,
  AcademicLevelOption,
  CourseOption,
  EducatorOption,
  StudentOption,
  DepartmentOption,
  ParentOption,
  OrganizerOption,
} from "./AdminEventsPage";
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

import { serverFetchJson } from "@/lib/api/serverFetch";

export default async function EventsManagerPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let initialEvents: EventData[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allStudents: StudentOption[] = [];
  let allDepartments: DepartmentOption[] = [];
  let allParents: ParentOption[] = [];
  let allOrganizers: OrganizerOption[] = [];

  try {
    const [eventsRes, academicLevelsRes, coursesRes, educatorsRes, studentsRes, deptsRes, parentsRes, staffRes] = await Promise.all([
      serverFetchJson(`/api/admin/events?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson(`/api/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson(`/api/admin/courses?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson(`/api/admin/educators?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson(`/api/admin/students?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson(`/api/admin/departments?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson(`/api/admin/parents?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson(`/api/admin/staff?companyId=${encodeURIComponent(companyId)}`),
    ]);

    if (eventsRes.ok && eventsRes.data) initialEvents = Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data.data || [];
    if (academicLevelsRes.ok && academicLevelsRes.data) allAcademicLevels = Array.isArray(academicLevelsRes.data) ? academicLevelsRes.data : academicLevelsRes.data.data || [];
    if (coursesRes.ok && coursesRes.data) allCourses = Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data.data || [];
    if (educatorsRes.ok && educatorsRes.data) {
      const educatorsRaw = Array.isArray(educatorsRes.data) ? educatorsRes.data : educatorsRes.data.data || [];
      allEducators = educatorsRaw.map((e: any) => ({
        id: e.id,
        name: e.user?.name || "N/A",
        email: e.user?.email || "N/A",
      }));
    }
    if (studentsRes.ok && studentsRes.data) {
      const studentsRaw = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.data || [];
      allStudents = studentsRaw.map((s: any) => ({
        id: s.id,
        name: s.user?.name || "N/A",
        email: s.user?.email || "N/A",
      }));
    }
    if (deptsRes.ok && deptsRes.data) {
      const deptsRaw = Array.isArray(deptsRes.data) ? deptsRes.data : deptsRes.data.data || [];
      allDepartments = deptsRaw.map((d: any) => ({ id: d.id, name: d.name || "N/A" }));
    }
    if (parentsRes.ok && parentsRes.data) {
      const parentsRaw = Array.isArray(parentsRes.data) ? parentsRes.data : parentsRes.data.data || [];
      allParents = parentsRaw.map((p: any) => ({
        id: p.id,
        name: p.user?.name || "N/A",
        email: p.user?.email || "N/A",
      }));
    }
    if (staffRes.ok && staffRes.data) {
      const organizersRaw = Array.isArray(staffRes.data) ? staffRes.data : staffRes.data.data || [];
      allOrganizers = organizersRaw.map((o: any) => ({
        id: o.id,
        name: o.name || "N/A",
        email: o.email || "N/A",
      }));
    }
  } catch (err) {
    console.error("[EventsManagerPage] Error orchestrating initial data payload:", err);
  }

  return (
    <AdminEventsPage
      initialEvents={initialEvents}
      allAcademicLevels={allAcademicLevels}
      allCourses={allCourses}
      allEducators={allEducators}
      allStudents={allStudents}
      allDepartments={allDepartments}
      allParents={allParents}
      allOrganizers={allOrganizers}
      companyId={companyId}
    />
  );
}