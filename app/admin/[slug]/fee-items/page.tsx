// app/admin/fee-items/page.tsx
import { cookies } from "next/headers";
import FeeItemsClient from "./FeeItemsClient";
import { FeeItem } from "@/lib/data";
import { AcademicLevelOption, ClassRoomOption } from "../students/StudentsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';


const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FeeItemsPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialFeeItems: FeeItem[] = [];  
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allClassrooms: ClassRoomOption[] = [];

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


  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/fee-items?companyId=${companyId}`,
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
      `${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`,
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
      `${apiBaseUrl}/admin/classrooms?companyId=${encodeURIComponent(companyId)}`,
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
      companyId={companyId}
    />
  );
}
