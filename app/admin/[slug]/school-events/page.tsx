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
  OrganizerOption, // Renamed from AuthorOption for clarity in events context
} from "./AdminEventsPage";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data (for fallback) ---
const generateSampleEventData = (companyId: string): {
  sampleEvents: EventData[];
  sampleAcademicLevels: AcademicLevelOption[];
  sampleCourses: CourseOption[];
  sampleEducators: EducatorOption[];
  sampleStudents: StudentOption[];
  sampleDepartments: DepartmentOption[];
  sampleParents: ParentOption[];
  sampleOrganizers: OrganizerOption[];
} => {
  const academicLevels: AcademicLevelOption[] = [
    // { id: 'AL001', name: 'Grade 7' },
    // { id: 'AL002', name: 'Grade 8' },
    // { id: 'AL003', name: 'Grade 9' },
  ];
  const courses: CourseOption[] = [
    // { id: 'CRS001', title: 'Mathematics' },
    // { id: 'CRS002', title: 'English Language' },
    // { id: 'CRS003', title: 'Science' },
  ];
  const educators: EducatorOption[] = [
    // { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com' },
    // { id: 'EDU002', name: 'Mrs. Jane Smith', email: 'jane.smith@school.com' },
  ];
  const students: StudentOption[] = [
    // { id: 'STU001', name: 'Alice Johnson', email: 'alice.j@school.com' },
    // { id: 'STU002', name: 'Bob Williams', email: 'bob.w@school.com' },
  ];
  const departments: DepartmentOption[] = [
      // { id: 'DEP001', name: 'Administration' },
      // { id: 'DEP002', name: 'Academic Affairs' },
  ];
  const parents: ParentOption[] = [
    // { id: 'PAR001', name: 'Parent A', email: 'parent.a@example.com' },
    // { id: 'PAR002', name: 'Parent B', email: 'parent.b@example.com' },
  ];
  const organizers: OrganizerOption[] = [
    // { id: 'ORG001', name: 'Admin User', email: 'admin@school.com' },
    // { id: 'ORG002', name: 'Ms. Principal', email: 'principal@school.com' },
    // { id: 'ORG003', name: 'Mr. John Doe', email: 'john.doe@school.com' }, // An educator can also be an organizer
  ];

  const events: EventData[] = [
    // {
    //   id: 'EV001',
    //   title: 'Midterm Exams Week',
    //   summary: 'Important exam period.',
    //   description: 'Midterm examinations for all grades. Schedule to be published soon.',
    //   startDateTime: new Date('2025-07-07T08:00:00Z').toISOString(),
    //   endDateTime: new Date('2025-07-11T17:00:00Z').toISOString(),
    //   location: 'School Wide',
    //   onlineMeetingLink: null,
    //   imageUrl: 'https://placehold.co/400x200/FF5733/FFFFFF?text=Exams',
    //   videoUrl: null,
    //   eventType: 'ACADEMIC',
    //   eventStatus: 'SCHEDULED',
    //   organizerId: 'ORG001',
    //   organizerName: 'Admin User',
    //   organizerEmail: 'admin@school.com',
    //   companyId: companyId,
    //   companyName: 'Sample School',
    //   audience: 'ACADEMIC_LEVEL',
    //   targetAcademicLevelIds: ['AL001', 'AL002', 'AL003'],
    //   targetCourseIds: [],
    //   targetEducatorIds: [],
    //   targetStudentIds: [],
    //   targetDepartmentIds: [],
    //   targetParentIds: [],
    //   isRegistrationRequired: false,
    //   maxCapacity: null,
    //   isPaid: false,
    //   price: null,
    //   contactPerson: 'Academic Office',
    //   contactEmail: 'academic@school.com',
    //   contactPhone: '555-1234',
    //   createdAt: new Date('2025-06-20T10:00:00Z').toISOString(),
    //   updatedAt: new Date('2025-06-20T10:00:00Z').toISOString(),
    // },
    // {
    //   id: 'EV002',
    //   title: 'Parent-Teacher Conference',
    //   summary: 'Meet your child\'s teachers.',
    //   description: 'Opportunity for parents to discuss student progress with teachers. Appointments required.',
    //   startDateTime: new Date('2025-07-15T09:00:00Z').toISOString(),
    //   endDateTime: new Date('2025-07-15T16:00:00Z').toISOString(),
    //   location: 'School Auditorium',
    //   onlineMeetingLink: null,
    //   imageUrl: null,
    //   videoUrl: null,
    //   eventType: 'MEETING',
    //   eventStatus: 'SCHEDULED',
    //   organizerId: 'ORG002',
    //   organizerName: 'Ms. Principal',
    //   organizerEmail: 'principal@school.com',
    //   companyId: companyId,
    //   companyName: 'Sample School',
    //   audience: 'PARENT',
    //   targetAcademicLevelIds: [],
    //   targetCourseIds: [],
    //   targetEducatorIds: [],
    //   targetStudentIds: [],
    //   targetDepartmentIds: [],
    //   targetParentIds: ['PAR001', 'PAR002'],
    //   isRegistrationRequired: true,
    //   maxCapacity: 500,
    //   isPaid: false,
    //   price: null,
    //   contactPerson: 'Admin Office',
    //   contactEmail: 'admin@school.com',
    //   contactPhone: '555-5678',
    //   createdAt: new Date('2025-06-28T11:00:00Z').toISOString(),
    //   updatedAt: new Date('2025-06-28T11:00:00Z').toISOString(),
    // },
    // {
    //   id: 'EV003',
    //   title: 'Annual Science Fair',
    //   summary: 'Showcasing student projects.',
    //   description: 'Annual science fair showcasing student projects from all grades. Open to public.',
    //   startDateTime: new Date('2025-07-20T10:00:00Z').toISOString(),
    //   endDateTime: new Date('2025-07-20T14:00:00Z').toISOString(),
    //   location: 'School Gymnasium',
    //   onlineMeetingLink: null,
    //   imageUrl: 'https://placehold.co/400x200/33FF57/FFFFFF?text=Science+Fair',
    //   videoUrl: null,
    //   eventType: 'CULTURAL', // Or GENERAL
    //   eventStatus: 'SCHEDULED',
    //   organizerId: 'ORG003',
    //   organizerName: 'Mr. John Doe',
    //   organizerEmail: 'john.doe@school.com',
    //   companyId: companyId,
    //   companyName: 'Sample School',
    //   audience: 'ALL',
    //   targetAcademicLevelIds: [],
    //   targetCourseIds: [],
    //   targetEducatorIds: [],
    //   targetStudentIds: [],
    //   targetDepartmentIds: [],
    //   targetParentIds: [],
    //   isRegistrationRequired: false,
    //   maxCapacity: null,
    //   isPaid: false,
    //   price: null,
    //   contactPerson: 'Science Dept.',
    //   contactEmail: 'science@school.com',
    //   contactPhone: '555-9012',
    //   createdAt: new Date('2025-07-01T09:00:00Z').toISOString(),
    //   updatedAt: new Date('2025-07-01T09:00:00Z').toISOString(),
    // },
    // {
    //   id: 'EV004',
    //   title: 'National Holiday (Eid al-Adha)',
    //   summary: 'School closed.',
    //   description: 'School closed for national holiday. Enjoy the break!',
    //   startDateTime: new Date('2025-07-06T00:00:00Z').toISOString(),
    //   endDateTime: new Date('2025-07-06T23:59:59Z').toISOString(),
    //   location: 'N/A',
    //   onlineMeetingLink: null,
    //   imageUrl: null,
    //   videoUrl: null,
    //   eventType: 'HOLIDAY',
    //   eventStatus: 'COMPLETED', // Example of a past event
    //   organizerId: 'ORG002',
    //   organizerName: 'Ms. Principal',
    //   organizerEmail: 'principal@school.com',
    //   companyId: companyId,
    //   companyName: 'Sample School',
    //   audience: 'ALL',
    //   targetAcademicLevelIds: [],
    //   targetCourseIds: [],
    //   targetEducatorIds: [],
    //   targetStudentIds: [],
    //   targetDepartmentIds: [],
    //   targetParentIds: [],
    //   isRegistrationRequired: false,
    //   maxCapacity: null,
    //   isPaid: false,
    //   price: null,
    //   contactPerson: null,
    //   contactEmail: null,
    //   contactPhone: null,
    //   createdAt: new Date('2025-06-01T08:00:00Z').toISOString(),
    //   updatedAt: new Date('2025-06-01T08:00:00Z').toISOString(),
    // },
  ];

  return {
    sampleEvents: events,
    sampleAcademicLevels: academicLevels,
    sampleCourses: courses,
    sampleEducators: educators,
    sampleStudents: students,
    sampleDepartments: departments,
    sampleParents: parents,
    sampleOrganizers: organizers,
  };
};


export default async function EventsManagerPage({ params }: PageProps) {
  const { slug : companyId } = await params;  
  const cookieHeaders = (await cookies()).toString();

  let initialEvents: EventData[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allStudents: StudentOption[] = [];
  let allDepartments: DepartmentOption[] = [];
  let allParents: ParentOption[] = [];
  let allOrganizers: OrganizerOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch events
    const eventsRes = await fetch(`${apiBaseUrl}/admin/events?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders }
    });
    if (eventsRes.ok) {
      const data = (await eventsRes.json()).data;
      // console.log("[EventsManagerPage] Fetched events data:", data);
      initialEvents = data as EventData[];
    } else {
      console.error(`[EventsManagerPage] Failed to fetch events: ${eventsRes.status} ${eventsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all academic levels
    const academicLevelsRes = await fetch(`${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders }
    });
    if (academicLevelsRes.ok) {
      const data = (await academicLevelsRes.json()).data;
      // console.log("[EventsManagerPage] Fetched academic levels data:", data);
      allAcademicLevels = data as AcademicLevelOption[];
    } else {
      console.error(`[EventsManagerPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all courses
    const coursesRes = await fetch(`${apiBaseUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders }
    });
    if (coursesRes.ok) {
      const data = (await coursesRes.json()).data;
      // console.log("[EventsManagerPage] Fetched courses data:", data);
      allCourses = data as CourseOption[];
    } else {
      console.error(`[EventsManagerPage] Failed to fetch courses: ${coursesRes.status} ${coursesRes.statusText}`);
      fetchError = true;
    }

    // Fetch all educators
    const educatorsRes = await fetch(`${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders }
    });
    if (educatorsRes.ok) {
      const data = (await educatorsRes.json()).data.data;
      // console.log("[EventsManagerPage] Fetched educators data:", data);
      const fetchedEducators = data as any[];      
      allEducators = fetchedEducators.map(e => ({ id: e.id, name: e.user?.name || 'N/A', email: e.user?.email || 'N/A' }));
    } else {
      console.error(`[EventsManagerPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all students
    const studentsRes = await fetch(`${apiBaseUrl}/admin/students?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders }
    });
    if (studentsRes.ok) {
      const data = (await studentsRes.json()).data;
      // console.log("[EventsManagerPage] Fetched students data:", data);
      const fetchedStudents = data as any[];
      allStudents = fetchedStudents.map(s => ({ id: s.id, name: s.user?.name || 'N/A', email: s.user?.email || 'N/A' }));
    } else {
      console.error(`[EventsManagerPage] Failed to fetch students: ${studentsRes.status} ${studentsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all departments (assuming a /api/departments endpoint exists)
    const departmentsRes = await fetch(`${apiBaseUrl}/admin/departments?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders }
    });
    if (departmentsRes.ok) {
      const data = (await departmentsRes.json()).data.data;
      // console.log("[EventsManagerPage] Fetched departments data:", data);
      const fetchedDepartments = data as any[];
      allDepartments = fetchedDepartments.map(d => ({ id: d.id, name: d.name || 'N/A' }));
    } else {
      console.error(`[EventsManagerPage] Failed to fetch departments: ${departmentsRes.status} ${departmentsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all parents (assuming a /api/parents endpoint exists)
    const parentsRes = await fetch(`${apiBaseUrl}/admin/parents?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders }
    });
    if (parentsRes.ok) {
      const data = (await parentsRes.json()).data;
      // console.log("[EventsManagerPage] Fetched parents data:", data);
      const fetchedParents = data as any[];
      allParents = fetchedParents.map(p => ({ id: p.id, name: p.user?.name || 'N/A', email: p.user?.email || 'N/A' }));
    } else {
      console.error(`[EventsManagerPage] Failed to fetch parents: ${parentsRes.status} ${parentsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all users who can be organizers (e.g., Admins, Educators, Staff)
    const organizersRes = await fetch(`${apiBaseUrl}/admin/staff?companyId=${encodeURIComponent(companyId)}`, { // Assuming /api/users endpoint
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders }
    });
    if (organizersRes.ok) {
      const data = (await organizersRes.json()).data;
      // console.log("[EventsManagerPage] Fetched organizers data:", data);
      const fetchedOrganizers = data as any[];
      allOrganizers = fetchedOrganizers.map(u => ({ id: u.id, name: u.name || 'N/A', email: u.email || 'N/A' }));
    } else {
      console.error(`[EventsManagerPage] Failed to fetch organizers: ${organizersRes.status} ${organizersRes.statusText}`);
      fetchError = true;
    }


  } catch (err: any) {
    console.error("[EventsManagerPage] Error fetching initial data →", err.message);
    fetchError = true;
  }

  // If any fetch failed or returned empty, use sample data as fallback
  if (fetchError || initialEvents.length === 0 && allAcademicLevels.length === 0 && allCourses.length === 0 && allEducators.length === 0 || allStudents.length === 0 && allDepartments.length === 0 && allParents.length === 0 && allOrganizers.length === 0) {
    // console.log("[EventsManagerPage] Using sample data as fallback for events.");
    const {
      sampleEvents,
      sampleAcademicLevels,
      sampleCourses,
      sampleEducators,
      sampleStudents,
      sampleDepartments,
      sampleParents,
      sampleOrganizers
    } = generateSampleEventData(companyId);

    initialEvents = sampleEvents;
    allAcademicLevels = sampleAcademicLevels;
    allCourses = sampleCourses;
    allEducators = sampleEducators;
    allStudents = sampleStudents;
    allDepartments = sampleDepartments;
    allParents = sampleParents;
    allOrganizers = sampleOrganizers;
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
