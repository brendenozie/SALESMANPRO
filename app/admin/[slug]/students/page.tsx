// app/admin/[slug]/students/page.tsx

import React from "react";
import StudentsClient, { StudentType, ParentOption, AcademicLevelOption, StudentLevelStatusOption, ClassRoomOption } from "./StudentsClient"; // Import StudentLevelStatusOption
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data ---
const generateSampleStudentsData = (companyId: string): {
  sampleStudents: StudentType[];
  sampleParents: ParentOption[];
  sampleAcademicLevels: AcademicLevelOption[];
  sampleClassRooms: ClassRoomOption[];
} => {
  const academicLevels: AcademicLevelOption[] = [
    // { id: 'AL001', name: 'Playgroup', sortOrder: 1 },
    // { id: 'AL002', name: 'Grade 1', sortOrder: 2 },
    // { id: 'AL003', name: 'Grade 2', sortOrder: 3 },
    // { id: 'AL004', name: 'Grade 7', sortOrder: 8 },
    // { id: 'AL005', name: 'Grade 8', sortOrder: 9 },
    // { id: 'AL006', name: 'Grade 9', sortOrder: 10 },
    // { id: 'AL007', name: 'High School - Freshman', sortOrder: 11 },
    // { id: 'AL008', name: 'University - Year 1', sortOrder: 15 },
  ];

  const sampleParents: ParentOption[] = [
    // { id: 'PAR001', name: 'Mercy Wanjiru', email: 'mercy.w@example.com', phone: '+254711223344', loginCode: '900001' },
    // { id: 'PAR002', name: 'David Otieno', email: 'david.o@example.com', phone: '+254722334455', loginCode: '900002' },
    // { id: 'PAR003', name: 'Elizabeth Kimani', email: 'elizabeth.k@example.com', phone: '+254733445566', loginCode: '900003' },
    // { id: 'PAR004', name: 'Ruth Njoroge', email: 'ruth.n@example.com', phone: '+254744556677', loginCode: '900004' },
    // { id: 'PAR005', name: 'Ahmed Hassan', email: 'ahmed.h@example.com', phone: '+254755667788', loginCode: '900005' },
  ];

  const sampleStudents: StudentType[] = [
    // {
    //   id: 'STU001',
    //   userId: 'USER001',
    //   loginCode: '100001',
    //   firstName: 'Jane',
    //   lastName: 'Wanjiru',
    //   email: 'jane.w@school.com',
    //   profilePicture: 'https://placehold.co/100x100/FFD1DC/FF69B4?text=JW',
    //   phone: '+254711223344',
    //   bio: 'Enthusiastic learner with a passion for science.',
    //   address: '123 Nairobi St, Nairobi',
    //   companyId: companyId,
    //   academicRecords: [
    //     {
    //       academicLevelId: 'AL002', classRoomId: 'CR001', term: 'Term 1',
    //       academicLevelName: "Grade 1", classRoomName: "Room A"
    //     }
    //   ],
    //   parentId: 'PAR001',
    //   parentName: 'Mercy Wanjiru',
    //   parentEmail: 'mercy.w@example.com',
    //   parentPhone: '+254711223344',
    //   totalCourses: 3,
    //   completedCourses: 1,
    //   certificatesEarned: 0,
    //   averageProgress: 33.3,
    //   totalAssignmentSubmissions: 5,
    //   totalAttendanceRecords: 20,
    //   totalExamSubmissions: 2,
    //   createdAt: new Date('2020-09-01').toISOString(),
    //   updatedAt: new Date().toISOString(),
    // },
    // {
    //   id: 'STU002',
    //   userId: 'USER002',
    //   loginCode: '100002',
    //   firstName: 'Kevin',
    //   lastName: 'Otieno',
    //   email: 'kevin.o@school.com',
    //   profilePicture: 'https://placehold.co/100x100/C8E6C9/4CAF50?text=KO',
    //   phone: '+254722334455',
    //   bio: 'Loves mathematics and coding.',
    //   address: '456 Mombasa Rd, Nairobi',
    //   companyId: companyId,
    //   academicRecords: [
    //     {
    //       academicLevelId: 'AL002', classRoomId: 'CR002', term: 'Term 1',
    //       academicLevelName: "Grade 1", classRoomName: "Room B"
    //     }
    //   ],
    //   parentId: 'PAR002',
    //   parentName: 'David Otieno',
    //   parentEmail: 'david.o@example.com',
    //   parentPhone: '+254722334455',
    //   totalCourses: 2,
    //   completedCourses: 0,
    //   certificatesEarned: 0,
    //   averageProgress: 10.5,
    //   totalAssignmentSubmissions: 3,
    //   totalAttendanceRecords: 18,
    //   totalExamSubmissions: 1,
    //   createdAt: new Date('2021-09-01').toISOString(),
    //   updatedAt: new Date().toISOString(),
    // },
    // {
    //   id: 'STU003',
    //   userId: 'USER003',
    //   loginCode: '100003',
    //   firstName: 'Sarah',
    //   lastName: 'Kimani',
    //   email: 'sarah.k@school.com',
    //   profilePicture: 'https://placehold.co/100x100/B3E5FC/2196F3?text=SK',
    //   phone: '+254733445566',
    //   bio: 'Aspiring artist with a keen interest in history.',
    //   address: '789 Kisumu St, Nairobi',
    //   companyId: companyId,
    //   academicRecords: [
    //     {
    //       academicLevelId: 'AL006', classRoomId: 'CR003', term: 'Term 1',
    //       academicLevelName: "Grade 9", classRoomName: "Room C"
    //     }
    //   ],
    //   parentId: 'PAR003',
    //   parentName: 'Elizabeth Kimani',
    //   parentEmail: 'elizabeth.k@example.com',
    //   parentPhone: '+254733445566',
    //   totalCourses: 4,
    //   completedCourses: 2,
    //   certificatesEarned: 1,
    //   averageProgress: 75.0,
    //   totalAssignmentSubmissions: 8,
    //   totalAttendanceRecords: 25,
    //   totalExamSubmissions: 3,
    //   createdAt: new Date('2019-09-01').toISOString(),
    //   updatedAt: new Date().toISOString(),
    // },
    // {
    //   id: 'STU004',
    //   userId: 'USER004',
    //   loginCode: '100004',
    //   firstName: 'Michael',
    //   lastName: 'Njoroge',
    //   email: 'michael.n@school.com',
    //   profilePicture: 'https://placehold.co/100x100/CFD8DC/607D8B?text=MN',
    //   phone: '+254744556677',
    //   bio: 'Strong in physics and problem-solving.',
    //   address: '101 Eldoret Ave, Nairobi',
    //   companyId: companyId,
    //   academicRecords: [
    //     {
    //       academicLevelId: 'AL005', classRoomId: 'CR001', term: 'Term 1',
    //       academicLevelName: "Grade 8", classRoomName: "Room A"
    //     }
    //   ],
    //   parentId: 'PAR004',
    //   parentName: 'Ruth Njoroge',
    //   parentEmail: 'ruth.n@example.com',
    //   parentPhone: '+254744556677',
    //   totalCourses: 3,
    //   completedCourses: 3,
    //   certificatesEarned: 2,
    //   averageProgress: 90.0,
    //   totalAssignmentSubmissions: 10,
    //   totalAttendanceRecords: 22,
    //   totalExamSubmissions: 4,
    //   createdAt: new Date('2020-09-01').toISOString(),
    //   updatedAt: new Date().toISOString(),
    // },
  ];

  const sampleClassRooms: ClassRoomOption[] = [
    // { id: 'CR001', name: 'Classroom A', academicLevelId: 'AL002' },
    // { id: 'CR002', name: 'Classroom B', academicLevelId: 'AL002' },
    // { id: 'CR003', name: 'Classroom C', academicLevelId: 'AL002' },
  ];

  return { sampleStudents, sampleParents, sampleAcademicLevels: academicLevels, sampleClassRooms };
};
// --- End Helper function ---


/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function StudentsManagementPage({ params }: PageProps) {
  const { slug }  = await params;
    const cookieHeader = (await cookies()).toString();

  let initialStudents: StudentType[] = [];
  let allParents: ParentOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allClassRooms: ClassRoomOption[] = [];
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  // Define StudentLevelStatus options
  const allStudentLevelStatusOptions: StudentLevelStatusOption[] = [
    { value: 'JUNIOR', label: 'Junior' },
    { value: 'SENIOR', label: 'Senior' },
  ];

  let fetchError: boolean = false;

  try {
    // Fetch all students for this company
    const studentsRes = await fetch(
      `${apiBaseUrl}/admin/students?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } } // equivalent to SSR on every request
    );
    if (studentsRes.ok) {
      const data = (await studentsRes.json()).data;
      initialStudents = data as StudentType[];
    } else {
      console.error(
        `[StudentsManagementPage] Failed to fetch students: ${studentsRes.status} ${studentsRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all parents for this company (or globally if not company-specific)
    const parentsRes = await fetch(
      `${apiBaseUrl}/admin/parents?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader }  }
    );
    if (parentsRes.ok) {
      const data = (await parentsRes.json()).data;
      
      const parentsData = data as ParentOption[];
      allParents = parentsData.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        loginCode: p.loginCode
      }));
    } else {
      console.error(
        `[StudentsManagementPage] Failed to fetch parents: ${parentsRes.status} ${parentsRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all academic levels for this company
    const academicLevelsRes = await fetch(
      `${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader }  }
    );
    if (academicLevelsRes.ok) {
      const data = (await academicLevelsRes.json()).data;
      
      allAcademicLevels = data as AcademicLevelOption[];
    } else {
      console.error(
        `[StudentsManagementPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all classrooms for this company
    const classRoomsRes = await fetch(
      `${apiBaseUrl}/admin/classrooms?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader }  }
    );
    if (classRoomsRes.ok) {
      const data = (await classRoomsRes.json()).data;
      allClassRooms = data as ClassRoomOption[];
    } else {
      console.error(
        `[StudentsManagementPage] Failed to fetch classrooms: ${classRoomsRes.status} ${classRoomsRes.statusText}`
      );
      fetchError = true;
    }
  } catch (err: any) {
    console.error("[StudentsManagementPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  // If fetching failed or returned no data, use sample data
  // if (fetchError && initialStudents.length === 0 && allParents.length === 0 && allAcademicLevels.length === 0 && allClassRooms.length === 0) {
  //   // console.log("[StudentsManagementPage] Using sample data for students, parents, academic levels, and classrooms.");
  //   const { sampleStudents, sampleParents, sampleAcademicLevels, sampleClassRooms } = generateSampleStudentsData(companyId);
  //   initialStudents = sampleStudents;
  //   allParents = sampleParents;
  //   allAcademicLevels = sampleAcademicLevels;
  //   allClassRooms = sampleClassRooms;
  // }

  return (
    <StudentsClient
      initialStudents={initialStudents}
      allParents={allParents}
      allAcademicLevels={allAcademicLevels}
      allStudentLevelStatusOptions={allStudentLevelStatusOptions} // Pass the new prop
      allClassRooms={allClassRooms}
      companyId={companyId}
      apiBaseUrl={apiBaseUrl}
    />
  );
}
