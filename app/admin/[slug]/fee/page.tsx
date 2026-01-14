import React from "react";
import { cookies } from "next/headers";
import FeesClient from "./FeesClient";
import { Student, FeeItem } from "@/lib/data";
import { AcademicLevelOption, ClassRoomOption } from "../students/StudentsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function FeesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookHeader = (await cookies()).toString();

  // Parallel data fetching for performance
  const fetchData = async (endpoint: string) => {
    const res = await fetch(`${apiBaseUrl}${endpoint}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookHeader },
    });
    return res.ok ? (await res.json()).data : [];
  };

  const [initialFeeRecords, initialStudents, initialFeeItems, allAcademicLevels, allClassrooms] = 
    await Promise.all([
      fetchData(`/admin/student-fee-records?companyId=${schoolId}`),
      fetchData(`/admin/students?companyId=${schoolId}`),
      fetchData(`/admin/fee-items?companyId=${schoolId}`),
      fetchData(`/admin/academic-levels?companyId=${schoolId}`),
      fetchData(`/admin/classrooms?companyId=${schoolId}`),
    ]);

  console.log('Initial Fee Records:', initialFeeRecords);
  console.log('Initial Students:', initialStudents);
  console.log('Initial Fee Items:', initialFeeItems);
  console.log('All Academic Levels:', allAcademicLevels);
  console.log('All Classrooms:', allClassrooms);
  
  return (
    <FeesClient
      initialFeeRecordsData={initialFeeRecords}
      initialStudentsData={initialStudents}
      initialFeeItemsData={initialFeeItems}
      allAcademicLevels={allAcademicLevels}
      allClassrooms={allClassrooms}
      schoolId={schoolId}
    />
  );
}