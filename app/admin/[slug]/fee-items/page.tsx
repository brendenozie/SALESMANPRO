// app/admin/fee-items/page.tsx
import { cookies } from "next/headers";
import FeeItemsClient from "./FeeItemsClient";
import { FeeItem } from "@/lib/data";
import { AcademicLevelOption, ClassRoomOption } from "../students/StudentsClient";


const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FeeItemsPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialFeeItems: FeeItem[] = [];  
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allClassrooms: ClassRoomOption[] = [];


  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/fee-items?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialFeeItems = (await res.json()).data;
    }


    // Fetch all academic levels for this company
    const academicLevelsRes = await fetch(
      `${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(schoolId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (academicLevelsRes.ok) {
      allAcademicLevels = (await academicLevelsRes.json()).data as AcademicLevelOption[];
    } else {
      // console.error(
      //   `[AdminCoursesPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`
      // );
      // fetchError = true;
    }

    // Fetch all classrooms for this company
    const classroomsRes = await fetch(
      `${apiBaseUrl}/admin/classrooms?companyId=${encodeURIComponent(schoolId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );

    if (classroomsRes.ok) {
      allClassrooms = (await classroomsRes.json()).data;
    } else {
      // console.error(
      //   `[AdminCoursesPage] Failed to fetch classrooms: ${classroomsRes.status} ${classroomsRes.statusText}`
      // );
      // fetchError = true; 
    }


  } catch (err) {
    // console.error("[FeeItemsPage] Failed to load fee items", err);
  }

  // console.log("Fetched fee items:", initialFeeItems);
  // console.log("Fetched academic levels:", allAcademicLevels);
  // console.log("Fetched classrooms:", allClassrooms);
  // console.log("Using schoolId:", schoolId);
  // console.log("Using cookieHeader:", cookieHeader);
  
  return (
    <FeeItemsClient
      initialFeeItems={initialFeeItems}
      allAcademicLevels={allAcademicLevels}
      allClassrooms={allClassrooms}
      schoolId={schoolId}
    />
  );
}
