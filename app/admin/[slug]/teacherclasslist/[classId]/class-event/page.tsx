// app/admin/[slug]/events/page.tsx
import React from "react";
import AddClassEventPage, { AcademicLevelOption, CourseOption, EducatorOption, StudentOption, DepartmentOption, ParentOption, OrganizerOption, EventData } from "./AddClassEventPage";


const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // This is the educatorId (teacherId)
    classId: string; // This is the academicLevelId
  };
}

// --- Helper function to generate sample data (for fallback) ---
// (Keep this function as is, it's good for development/fallback)
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
    { id: 'AL001', name: 'Grade 7' },
    { id: 'AL002', name: 'Grade 8' },
    { id: 'AL003', name: 'Grade 9' },
  ];
  const courses: CourseOption[] = [
    { id: 'CRS001', title: 'Mathematics' },
    { id: 'CRS002', title: 'English Language' },
    { id: 'CRS003', title: 'Science' },
  ];
  const educators: EducatorOption[] = [
    { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com' },
    { id: 'EDU002', name: 'Mrs. Jane Smith', email: 'jane.smith@school.com' },
  ];
  const students: StudentOption[] = [
    { id: 'STU001', name: 'Alice Johnson', email: 'alice.j@school.com' },
    { id: 'STU002', name: 'Bob Williams', email: 'bob.w@school.com' },
  ];
  const departments: DepartmentOption[] = [
    { id: 'DEP001', name: 'Administration' },
    { id: 'DEP002', name: 'Academic Affairs' },
  ];
  const parents: ParentOption[] = [
    { id: 'PAR001', name: 'Parent A', email: 'parent.a@example.com' },
    { id: 'PAR002', name: 'Parent B', email: 'parent.b@example.com' },
  ];
  const organizers: OrganizerOption[] = [
    { id: 'ORG001', name: 'Admin User', email: 'admin@school.com' },
    { id: 'ORG002', name: 'Ms. Principal', email: 'principal@school.com' },
    { id: 'ORG003', name: 'Mr. John Doe', email: 'john.doe@school.com' }, // An educator can also be an organizer
  ];

  const events: EventData[] = [
    {
      id: 'EV001',
      title: 'Midterm Exams Week',
      summary: 'Important exam period.',
      description: 'Midterm examinations for all grades. Schedule to be published soon.',
      startDateTime: new Date('2025-07-07T08:00:00Z').toISOString(),
      endDateTime: new Date('2025-07-11T17:00:00Z').toISOString(),
      location: 'School Wide',
      onlineMeetingLink: null,
      imageUrl: 'https://placehold.co/400x200/FF5733/FFFFFF?text=Exams',
      videoUrl: null,
      eventType: 'ACADEMIC',
      eventStatus: 'SCHEDULED',
      organizerId: 'ORG001',
      organizerName: 'Admin User',
      organizerEmail: 'admin@school.com',
      companyId: companyId,
      companyName: 'Sample School',
      audience: 'ACADEMIC_LEVEL',
      targetAcademicLevelIds: ['AL001', 'AL002', 'AL003'],
      targetCourseIds: [],
      targetEducatorIds: [],
      targetStudentIds: [],
      targetDepartmentIds: [],
      targetParentIds: [],
      isRegistrationRequired: false,
      maxCapacity: null,
      isPaid: false,
      price: null,
      contactPerson: 'Academic Office',
      contactEmail: 'academic@school.com',
      contactPhone: '555-1234',
      createdAt: new Date('2025-06-20T10:00:00Z').toISOString(),
      updatedAt: new Date('2025-06-20T10:00:00Z').toISOString(),
    },
    {
      id: 'EV002',
      title: 'Parent-Teacher Conference',
      summary: 'Meet your child\'s teachers.',
      description: 'Opportunity for parents to discuss student progress with teachers. Appointments required.',
      startDateTime: new Date('2025-07-15T09:00:00Z').toISOString(),
      endDateTime: new Date('2025-07-15T16:00:00Z').toISOString(),
      location: 'School Auditorium',
      onlineMeetingLink: null,
      imageUrl: null,
      videoUrl: null,
      eventType: 'MEETING',
      eventStatus: 'SCHEDULED',
      organizerId: 'ORG002',
      organizerName: 'Ms. Principal',
      organizerEmail: 'principal@school.com',
      companyId: companyId,
      companyName: 'Sample School',
      audience: 'PARENT',
      targetAcademicLevelIds: [],
      targetCourseIds: [],
      targetEducatorIds: [],
      targetStudentIds: [],
      targetDepartmentIds: [],
      targetParentIds: ['PAR001', 'PAR002'],
      isRegistrationRequired: true,
      maxCapacity: 500,
      isPaid: false,
      price: null,
      contactPerson: 'Admin Office',
      contactEmail: 'admin@school.com',
      contactPhone: '555-5678',
      createdAt: new Date('2025-06-28T11:00:00Z').toISOString(),
      updatedAt: new Date('2025-06-28T11:00:00Z').toISOString(),
    },
    {
      id: 'EV003',
      title: 'Annual Science Fair',
      summary: 'Showcasing student projects.',
      description: 'Annual science fair showcasing student projects from all grades. Open to public.',
      startDateTime: new Date('2025-07-20T10:00:00Z').toISOString(),
      endDateTime: new Date('2025-07-20T14:00:00Z').toISOString(),
      location: 'School Gymnasium',
      onlineMeetingLink: null,
      imageUrl: 'https://placehold.co/400x200/33FF57/FFFFFF?text=Science+Fair',
      videoUrl: null,
      eventType: 'CULTURAL', // Or GENERAL
      eventStatus: 'SCHEDULED',
      organizerId: 'ORG003',
      organizerName: 'Mr. John Doe',
      organizerEmail: 'john.doe@school.com',
      companyId: companyId,
      companyName: 'Sample School',
      audience: 'ALL',
      targetAcademicLevelIds: [],
      targetCourseIds: [],
      targetEducatorIds: [],
      targetStudentIds: [],
      targetDepartmentIds: [],
      targetParentIds: [],
      isRegistrationRequired: false,
      maxCapacity: null,
      isPaid: false,
      price: null,
      contactPerson: 'Science Dept.',
      contactEmail: 'science@school.com',
      contactPhone: '555-9012',
      createdAt: new Date('2025-07-01T09:00:00Z').toISOString(),
      updatedAt: new Date('2025-07-01T09:00:00Z').toISOString(),
    },
    {
      id: 'EV004',
      title: 'National Holiday (Eid al-Adha)',
      summary: 'School closed.',
      description: 'School closed for national holiday. Enjoy the break!',
      startDateTime: new Date('2025-07-06T00:00:00Z').toISOString(),
      endDateTime: new Date('2025-07-06T23:59:59Z').toISOString(),
      location: 'N/A',
      onlineMeetingLink: null,
      imageUrl: null,
      videoUrl: null,
      eventType: 'HOLIDAY',
      eventStatus: 'COMPLETED', // Example of a past event
      organizerId: 'ORG002',
      organizerName: 'Ms. Principal',
      organizerEmail: 'principal@school.com',
      companyId: companyId,
      companyName: 'Sample School',
      audience: 'ALL',
      targetAcademicLevelIds: [],
      targetCourseIds: [],
      targetEducatorIds: [],
      targetStudentIds: [],
      targetDepartmentIds: [],
      targetParentIds: [],
      isRegistrationRequired: false,
      maxCapacity: null,
      isPaid: false,
      price: null,
      contactPerson: null,
      contactEmail: null,
      contactPhone: null,
      createdAt: new Date('2025-06-01T08:00:00Z').toISOString(),
      updatedAt: new Date('2025-06-01T08:00:00Z').toISOString(),
    },
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

  const teacherId = params.slug; // This is Educator ID
  const academicLevelId = params.classId; // This is AcademicLevel ID

  let initialEvents: EventData[] = [];
  let allAcademicLevels: AcademicLevelOption[] = []; // Still useful for the form's audience targeting
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allStudents: StudentOption[] = [];
  let allDepartments: DepartmentOption[] = [];
  let allParents: ParentOption[] = [];
  let allOrganizers: OrganizerOption[] = []; // This will be the list of all possible organizers
  let fetchError: boolean = false;

  console.log(`Educator ID (teacherId): ${teacherId}`);
  console.log(`Academic Level ID (classId): ${academicLevelId}`);

  try {
    // Fetch events relevant to this academic level
    const eventsRes = await fetch(`${apiUrl}/teacher/class-events?academicLevelId=${encodeURIComponent(academicLevelId)}&teacherId=${encodeURIComponent(teacherId)}`, {
      cache: "no-store",
    });
    if (eventsRes.ok) {
      initialEvents = (await eventsRes.json()) as EventData[];
    } else {
      console.error(`[EventsManagerPage] Failed to fetch events: ${eventsRes.status} ${eventsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all academic levels (for audience targeting in the form)
    // You mentioned not needing this if pre-populated, but for a dynamic form, it's essential
    // If you always create events for a *single* academic level, you might hardcode it.
    // For now, I'll assume you might target other academic levels from this form.
    // If not, you can remove this fetch and simplify the form's academic level selection.
    const academicLevelsRes = await fetch(`${apiUrl}/admin/academic-levels?teacherId=${encodeURIComponent(teacherId)}`, {
      cache: "no-store",
    });
    if (academicLevelsRes.ok) {
      allAcademicLevels = (await academicLevelsRes.json()) as AcademicLevelOption[];
    } else {
      console.error(`[EventsManagerPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`);
      fetchError = true;
    }


    // Fetch all courses/subjects for the specified academic level (classId)
    const coursesRes = await fetch(`${apiUrl}/teacher/class-subjects?academicLevelId=${encodeURIComponent(academicLevelId)}&teacherId=${encodeURIComponent(teacherId)}`, {
      cache: "no-store",
    });
    if (coursesRes.ok) {
      allCourses = (await coursesRes.json()) as CourseOption[];
    } else {
      console.error(`[EventsManagerPage] Failed to fetch courses: ${coursesRes.status} ${coursesRes.statusText}`);
      fetchError = true;
    }

    // Fetch all educators associated with the specific academic level
    const educatorsRes = await fetch(`${apiUrl}/teacher/class-educators?academicLevelId=${encodeURIComponent(academicLevelId)}&teacherId=${encodeURIComponent(teacherId)}`, {
      cache: "no-store",
    });
    if (educatorsRes.ok) {
      allEducators = (await educatorsRes.json()) as EducatorOption[];
      // Organizers list should include all educators who can organize events
      // For simplicity, assuming all fetched educators can be organizers
      allOrganizers = allEducators;
    } else {
      console.error(`[EventsManagerPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all students for the specific academic level
    const studentsRes = await fetch(`${apiUrl}/teacher/academic-levels/${academicLevelId}/students?teacherId=${encodeURIComponent(teacherId)}`, {
      cache: "no-store",
    });
    if (studentsRes.ok) {
      allStudents = (await studentsRes.json()) as StudentOption[];
    } else {
      console.error(`[EventsManagerPage] Failed to fetch students: ${studentsRes.status} ${studentsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all departments for the company
    const departmentsRes = await fetch(`${apiUrl}/teacher/class-departments?teacherId=${encodeURIComponent(teacherId)}`, {
      cache: "no-store",
    });
    if (departmentsRes.ok) {
      allDepartments = (await departmentsRes.json()) as DepartmentOption[];
    } else {
      console.error(`[EventsManagerPage] Failed to fetch departments: ${departmentsRes.status} ${departmentsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all parents for the company
    const parentsRes = await fetch(`${apiUrl}/teacher/class-parents?teacherId=${encodeURIComponent(teacherId)}`, {
      cache: "no-store",
    });
    if (parentsRes.ok) {
      allParents = (await parentsRes.json()) as ParentOption[];
    } else {
      console.error(`[EventsManagerPage] Failed to fetch parents: ${parentsRes.status} ${parentsRes.statusText}`);
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[EventsManagerPage] Error fetching initial data →", err.message);
    fetchError = true;
  }

  // If any fetch failed or returned empty, use sample data as fallback
  // This fallback logic is robust.
  if (fetchError && initialEvents.length === 0 && allAcademicLevels.length === 0 && allCourses.length === 0
    && allEducators.length === 0 && allStudents.length === 0 && allDepartments.length === 0 && allParents.length === 0
    && allOrganizers.length === 0) {

    console.log("[EventsManagerPage] Using sample data as fallback for events.");
    // In a real app, you'd get the companyId from the authenticated teacher's profile
    // For sample, we'll use a placeholder or derive from teacherId if possible.
    const sampleCompanyId = teacherId; // Placeholder: In reality, fetch this from educator profile
    const {
      sampleEvents,
      sampleAcademicLevels,
      sampleCourses,
      sampleEducators,
      sampleStudents,
      sampleDepartments,
      sampleParents,
      sampleOrganizers
    } = generateSampleEventData(sampleCompanyId);

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
    <AddClassEventPage
      initialEvents={initialEvents}
      allAcademicLevels={allAcademicLevels}
      allCourses={allCourses}
      allEducators={allEducators}
      allStudents={allStudents}
      allDepartments={allDepartments}
      allParents={allParents}
      allOrganizers={allOrganizers}
      teacherId={teacherId}
      classId={academicLevelId} // Renamed for clarity, still refers to academicLevelId
      companyId={academicLevelId} // Renamed for clarity, still refers to academicLevelId
    />
  );
}
