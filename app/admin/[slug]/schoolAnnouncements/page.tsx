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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data (for fallback) ---
const generateSampleAnnouncementData = (companyId: string): {
  sampleAnnouncements: AnnouncementData[];
  sampleAcademicLevels: AcademicLevelOption[];
  sampleCourses: CourseOption[];
  sampleEducators: EducatorOption[];
  sampleStudents: StudentOption[];
  sampleDepartments: DepartmentOption[];
  sampleParents: ParentOption[];
  sampleAuthors: AuthorOption[];
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
  const authors: AuthorOption[] = [
    // { id: 'AUTH001', name: 'Admin User', email: 'admin@school.com' },
    // { id: 'AUTH002', name: 'Ms. Principal', email: 'principal@school.com' },
  ];


  const announcements: AnnouncementData[] = [
    // {
    //   id: 'AN001',
    //   title: 'Midterm Exam Schedule Published',
    //   summary: 'New exam schedule available.',
    //   content: 'The official midterm exam schedule for all grades is now available on the student portal. Please review carefully.',
    //   publishedAt: new Date('2025-06-25T09:00:00Z').toISOString(),
    //   expiresAt: new Date('2025-07-15T23:59:59Z').toISOString(),
    //   authorId: 'AUTH001',
    //   authorName: 'Admin User',
    //   authorEmail: 'admin@school.com',
    //   companyId: companyId,
    //   companyName: 'Sample School',
    //   status: 'PUBLISHED',
    //   type: 'ACADEMIC',
    //   audience: 'ACADEMIC_LEVEL',
    //   targetAcademicLevelIds: ['AL001', 'AL002', 'AL003'],
    //   targetCourseIds: [],
    //   targetEducatorIds: [],
    //   targetStudentIds: [],
    //   targetDepartmentIds: [],
    //   targetParentIds: [],
    //   createdAt: new Date('2025-06-24T10:00:00Z').toISOString(),
    //   updatedAt: new Date('2025-06-24T10:00:00Z').toISOString(),
    // },
    // {
    //   id: 'AN002',
    //   title: 'School Closed for National Holiday',
    //   summary: 'School closure on July 6th.',
    //   content: 'School will be closed on July 6th, 2025, in observance of the national holiday (Eid al-Adha).',
    //   publishedAt: new Date('2025-06-20T08:00:00Z').toISOString(),
    //   expiresAt: new Date('2025-07-07T23:59:59Z').toISOString(),
    //   authorId: 'AUTH002',
    //   authorName: 'Ms. Principal',
    //   authorEmail: 'principal@school.com',
    //   companyId: companyId,
    //   companyName: 'Sample School',
    //   status: 'PUBLISHED',
    //   type: 'HOLIDAY',
    //   audience: 'ALL',
    //   targetAcademicLevelIds: [],
    //   targetCourseIds: [],
    //   targetEducatorIds: [],
    //   targetStudentIds: [],
    //   targetDepartmentIds: [],
    //   targetParentIds: [],
    //   createdAt: new Date('2025-06-19T09:00:00Z').toISOString(),
    //   updatedAt: new Date('2025-06-19T09:00:00Z').toISOString(),
    // },
    // {
    //   id: 'AN003',
    //   title: 'Chess Club Practice Rescheduled',
    //   summary: 'Chess Club moved to Friday.',
    //   content: 'Due to unforeseen circumstances, tomorrow\'s Chess Club practice (June 26th) is moved to Friday, June 28th, at 3:30 PM.',
    //   publishedAt: new Date('2025-06-25T14:00:00Z').toISOString(),
    //   expiresAt: new Date('2025-06-28T17:00:00Z').toISOString(),
    //   authorId: 'AUTH001',
    //   authorName: 'Admin User',
    //   authorEmail: 'admin@school.com',
    //   companyId: companyId,
    //   companyName: 'Sample School',
    //   status: 'PUBLISHED',
    //   type: 'EVENT',
    //   audience: 'COURSE',
    //   targetAcademicLevelIds: [],
    //   targetCourseIds: ['CRS001', 'CRS002'], // Example: Chess club is for students in these courses
    //   targetEducatorIds: [],
    //   targetStudentIds: [],
    //   targetDepartmentIds: [],
    //   targetParentIds: [],
    //   createdAt: new Date('2025-06-25T13:00:00Z').toISOString(),
    //   updatedAt: new Date('2025-06-25T13:00:00Z').toISOString(),
    // },
    // {
    //   id: 'AN004',
    //   title: 'New Cafeteria Menu Available',
    //   summary: 'July menu is out.',
    //   content: 'The new cafeteria menu for July is now posted on the school website and bulletin boards.',
    //   publishedAt: new Date('2025-06-24T11:00:00Z').toISOString(),
    //   expiresAt: null, // No expiry
    //   authorId: 'AUTH002',
    //   authorName: 'Ms. Principal',
    //   authorEmail: 'principal@school.com',
    //   companyId: companyId,
    //   companyName: 'Sample School',
    //   status: 'PUBLISHED',
    //   type: 'NEWS',
    //   audience: 'ALL',
    //   targetAcademicLevelIds: [],
    //   targetCourseIds: [],
    //   targetEducatorIds: [],
    //   targetStudentIds: [],
    //   targetDepartmentIds: [],
    //   targetParentIds: [],
    //   createdAt: new Date('2025-06-23T12:00:00Z').toISOString(),
    //   updatedAt: new Date('2025-06-23T12:00:00Z').toISOString(),
    // },
    // {
    //   id: 'AN005',
    //   title: 'Faculty Meeting Reminder',
    //   summary: 'Mandatory PD session.',
    //   content: 'All faculty members are required to attend the PD session on July 25th in the Staff Conference Room.',
    //   publishedAt: new Date('2025-06-15T10:00:00Z').toISOString(),
    //   expiresAt: new Date('2025-07-26T00:00:00Z').toISOString(),
    //   authorId: 'AUTH001',
    //   authorName: 'Admin User',
    //   authorEmail: 'admin@school.com',
    //   companyId: companyId,
    //   companyName: 'Sample School',
    //   status: 'ARCHIVED', // Example archived announcement
    //   type: 'ACADEMIC',
    //   audience: 'EDUCATOR',
    //   targetAcademicLevelIds: [],
    //   targetCourseIds: [],
    //   targetEducatorIds: ['EDU001', 'EDU002'],
    //   targetStudentIds: [],
    //   targetDepartmentIds: [],
    //   targetParentIds: [],
    //   createdAt: new Date('2025-06-14T11:00:00Z').toISOString(),
    //   updatedAt: new Date('2025-06-14T11:00:00Z').toISOString(),
    // },
  ];

  return {
    sampleAnnouncements: announcements,
    sampleAcademicLevels: academicLevels,
    sampleCourses: courses,
    sampleEducators: educators,
    sampleStudents: students,
    sampleDepartments: departments,
    sampleParents: parents,
    sampleAuthors: authors,
  };
};


export default async function AnnouncementsManagerPage({ params }: PageProps) {
  const { slug : companyId } = await params;

  let initialAnnouncements: AnnouncementData[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allStudents: StudentOption[] = [];
  let allDepartments: DepartmentOption[] = [];
  let allParents: ParentOption[] = [];
  let allAuthors: AuthorOption[] = []; // Users who can be authors
  let fetchError: boolean = false;

  try {
    // Fetch announcements
    const announcementsRes = await fetch(`${apiBaseUrl}/admin/announcements?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
    });
    if (announcementsRes.ok) {
      initialAnnouncements = (await announcementsRes.json()) as AnnouncementData[];
    } else {
      console.error(`[AnnouncementsManagerPage] Failed to fetch announcements: ${announcementsRes.status} ${announcementsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all academic levels
    const academicLevelsRes = await fetch(`${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
    });
    if (academicLevelsRes.ok) {
      allAcademicLevels = (await academicLevelsRes.json()) as AcademicLevelOption[];
    } else {
      console.error(`[AnnouncementsManagerPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all courses
    const coursesRes = await fetch(`${apiBaseUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
    });
    if (coursesRes.ok) {
      allCourses = (await coursesRes.json()) as CourseOption[];
    } else {
      console.error(`[AnnouncementsManagerPage] Failed to fetch courses: ${coursesRes.status} ${coursesRes.statusText}`);
      fetchError = true;
    }

    // Fetch all educators
    const educatorsRes = await fetch(`${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
    });
    if (educatorsRes.ok) {
      const fetchedEducators = (await educatorsRes.json()) as any[];
      allEducators = fetchedEducators.map(e => ({ id: e.id, name: e.user?.name || 'N/A', email: e.user?.email || 'N/A' }));
    } else {
      console.error(`[AnnouncementsManagerPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all students
    const studentsRes = await fetch(`${apiBaseUrl}/students?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
    });
    if (studentsRes.ok) {
      const fetchedStudents = (await studentsRes.json()) as any[];
      allStudents = fetchedStudents.map(s => ({ id: s.id, name: s.user?.name || 'N/A', email: s.user?.email || 'N/A' }));
    } else {
      console.error(`[AnnouncementsManagerPage] Failed to fetch students: ${studentsRes.status} ${studentsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all departments (assuming a /api/departments endpoint exists)
    const departmentsRes = await fetch(`${apiBaseUrl}/admin/departments?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
    });
    if (departmentsRes.ok) {
      allDepartments = (await departmentsRes.json()) as DepartmentOption[];
    } else {
      console.error(`[AnnouncementsManagerPage] Failed to fetch departments: ${departmentsRes.status} ${departmentsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all parents (assuming a /api/parents endpoint exists)
    const parentsRes = await fetch(`${apiBaseUrl}/admin/parents?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
    });
    if (parentsRes.ok) {
      const fetchedParents = (await parentsRes.json()) as any[];
      allParents = fetchedParents.map(p => ({ id: p.id, name: p.user?.name || 'N/A', email: p.user?.email || 'N/A' }));
    } else {
      console.error(`[AnnouncementsManagerPage] Failed to fetch parents: ${parentsRes.status} ${parentsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all users who can be authors (e.g., Admins and Educators)
    // This might be a combined endpoint or separate calls depending on your User roles.
    // For simplicity, we'll fetch all users and assume some can be authors.
    const authorsRes = await fetch(`${apiBaseUrl}/admin/users?companyId=${encodeURIComponent(companyId)}`, { // Assuming /api/users endpoint
      next: { revalidate: 60 },
    });
    if (authorsRes.ok) {
      const fetchedAuthors = (await authorsRes.json()) as any[];
      allAuthors = fetchedAuthors.map(u => ({ id: u.id, name: u.name || 'N/A', email: u.email || 'N/A' }));
    } else {
      console.error(`[AnnouncementsManagerPage] Failed to fetch authors: ${authorsRes.status} ${authorsRes.statusText}`);
      fetchError = true;
    }


  } catch (err: any) {
    console.error("[AnnouncementsManagerPage] Error fetching initial data →", err.message);
    fetchError = true;
  }

  // If any fetch failed or returned empty, use sample data as fallback
  if (fetchError || initialAnnouncements.length === 0 || allAcademicLevels.length === 0 || allCourses.length === 0 || allEducators.length === 0 || allStudents.length === 0 || allDepartments.length === 0 || allParents.length === 0 || allAuthors.length === 0) {
    // console.log("[AnnouncementsManagerPage] Using sample data as fallback.");
    const {
      sampleAnnouncements,
      sampleAcademicLevels,
      sampleCourses,
      sampleEducators,
      sampleStudents,
      sampleDepartments,
      sampleParents,
      sampleAuthors
    } = generateSampleAnnouncementData(companyId);

    initialAnnouncements = sampleAnnouncements;
    allAcademicLevels = sampleAcademicLevels;
    allCourses = sampleCourses;
    allEducators = sampleEducators;
    allStudents = sampleStudents;
    allDepartments = sampleDepartments;
    allParents = sampleParents;
    allAuthors = sampleAuthors;
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
