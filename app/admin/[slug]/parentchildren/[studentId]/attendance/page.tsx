import { notFound } from 'next/navigation';
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import AttendanceClient from './AttendanceClient';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";


export default async function StudentSchedulePage({ 
  params 
}: { 
  params: Promise<{ adminSlug: string; studentId: string }> 
}) {
  const { adminSlug, studentId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  // const { studentId } = await params;
    // const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const cookieheader = (await cookies()).toString();
    const MOCK_PARENT_ID = "685084cc4da288b5c3156e4a"; // Replace with actual parent ID from session or params
  
    // const session = await getAuthSession();
    // const parentId = session?.user?.id || MOCK_PARENT_ID; // Fallback to adminSlug if session is not available
    

      // const { slug } = await params;
    
      // const session = await getAuthSession();
    
      // 1. Safely resolve the exact same identifier used in AdminStoreLayout
      // const identifier = slug || session?.user?.id || '';
    
      // 2. Retrieve the memoized company data (no extra DB cost)
      // const company = await findCompanyCached(identifier, "page");
    
      // if (!company) {
      //   return <div>Company not found</div>;
      // }
    
      // Use the actual database ID for your API calls, ensuring consistency
      // const companyId = company.id;

    // 1. Fetch data from our student-classes API
    const response = await fetch(`${apiBaseUrl}/parent/student-classes?studentId=${studentId}`, {
      cache: 'no-store',
      headers: {
        Cookie: cookieheader,
      },
    });

  const result = await response.json();
  if (!result.success) return notFound();

  const { studentName, enrolledClasses } = result.data;

  return (
    <AttendanceClient adminSlug={"685084cc4da288b5c3156e4a"} studentName={studentName} enrolledClasses={enrolledClasses} />
  );
}