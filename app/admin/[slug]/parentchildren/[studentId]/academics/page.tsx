

import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import AcademicsClient from './AcademicsClient';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";



export default async function StudentAcademicsPage({ params }: { params: Promise<{ adminSlug: string; studentId: string }>}) {
  const { studentId } = await params;
  // const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const cookieheader = (await cookies()).toString();
  const MOCK_PARENT_ID = "685084cc4da288b5c3156e4a"; // Replace with actual parent ID from session or params

  const session = await getAuthSession();
  // const parentId = session?.user?.id || MOCK_PARENT_ID; // Fallback to adminSlug if session is not available
  
  // 1. Fetch data from our student-classes API
  const response = await fetch(`${apiBaseUrl}/parent/student-classes?studentId=${studentId}`, {
    cache: 'no-store',
    headers: {
      Cookie: cookieheader,
    },
  });

  let result = await response.json();

  if (!result.success) {
    // return notFound();
    //SAMPLE dATA
    result={
      data:{
        studentName:"",
        studentGradeLevel:"",
        enrolledClasses:[
          
        ]
      }
    }
  }

  const { studentName, studentGradeLevel, enrolledClasses } = result.data;

  return (
    <AcademicsClient  adminSlug={'685084cc4da288b5c3156e4a'} studentId={studentId} studentName={studentName} studentGradeLevel={studentGradeLevel} enrolledClasses={enrolledClasses} />
  );
}