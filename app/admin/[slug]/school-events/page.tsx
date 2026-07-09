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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventsManagerPage({ params }: PageProps) {
  const { slug: companyId } = await params;  
  const cookieHeaders = (await cookies()).toString();

  let initialEvents: EventData[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allStudents: StudentOption[] = [];
  let allDepartments: DepartmentOption[] = [];
  let allParents: ParentOption[] = [];
  let allOrganizers: OrganizerOption[] = [];

  const fetchOptions = {
    next: { revalidate: 60 },
    headers: { cookie: cookieHeaders },
  };

  try {
    // Parallelize all endpoint requests to eliminate slow network waterfalls
    const responses = await Promise.allSettled([
      fetch(`${apiBaseUrl}/admin/events?companyId=${encodeURIComponent(companyId)}`, fetchOptions),
      fetch(`${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`, fetchOptions),
      fetch(`${apiBaseUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`, fetchOptions),
      fetch(`${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`, fetchOptions),
      fetch(`${apiBaseUrl}/admin/students?companyId=${encodeURIComponent(companyId)}`, fetchOptions),
      fetch(`${apiBaseUrl}/admin/departments?companyId=${encodeURIComponent(companyId)}`, fetchOptions),
      fetch(`${apiBaseUrl}/admin/parents?companyId=${encodeURIComponent(companyId)}`, fetchOptions),
      fetch(`${apiBaseUrl}/admin/staff?companyId=${encodeURIComponent(companyId)}`, fetchOptions),
    ]);

    // Safely unpack results with custom backend map layouts
    if (responses[0].status === "fulfilled" && responses[0].value.ok) {
      initialEvents = (await responses[0].value.json()).data || [];
    }
    if (responses[1].status === "fulfilled" && responses[1].value.ok) {
      allAcademicLevels = (await responses[1].value.json()).data || [];
    }
    if (responses[2].status === "fulfilled" && responses[2].value.ok) {
      allCourses = (await responses[2].value.json()).data || [];
    }
    if (responses[3].status === "fulfilled" && responses[3].value.ok) {
      const educatorsRaw = (await responses[3].value.json()).data || [];
      allEducators = educatorsRaw.map((e: any) => ({
        id: e.id,
        name: e.user?.name || "N/A",
        email: e.user?.email || "N/A",
      }));
    }
    if (responses[4].status === "fulfilled" && responses[4].value.ok) {
      const studentsRaw = (await responses[4].value.json()).data || [];
      allStudents = studentsRaw.map((s: any) => ({
        id: s.id,
        name: s.user?.name || "N/A",
        email: s.user?.email || "N/A",
      }));
    }
    if (responses[5].status === "fulfilled" && responses[5].value.ok) {
      const deptsRaw = (await responses[5].value.json()).data?.data || [];
      allDepartments = deptsRaw.map((d: any) => ({ id: d.id, name: d.name || "N/A" }));
    }
    if (responses[6].status === "fulfilled" && responses[6].value.ok) {
      const parentsRaw = (await responses[6].value.json()).data || [];
      allParents = parentsRaw.map((p: any) => ({
        id: p.id,
        name: p.user?.name || "N/A",
        email: p.user?.email || "N/A",
      }));
    }
    if (responses[7].status === "fulfilled" && responses[7].value.ok) {
      const organizersRaw = (await responses[7].value.json()).data || [];
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