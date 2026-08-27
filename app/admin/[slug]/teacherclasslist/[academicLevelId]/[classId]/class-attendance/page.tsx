// app/admin/[companyId]/academic-levels/[academicLevelId]/attendance/page.tsx
import React from "react";
import TakeAttendancePage from "./TakeAttendancePage";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from '@/lib/company-fetcher';

// Define the API base URL
// Ensure this matches where your Next.js API routes are served
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: Promise<{
    // slug: string; // teacherId
    academicLevelId: string;
    classId: string; // The ID of the academic level/class
  }>;
}

/**
 * This is a Server Component. It extracts path parameters
 * and passes them to the Client Component below.
 * In a real application, 'educatorId' would typically come from
 * an authenticated session (e.g., using NextAuth.js's getServerSession).
 */
export default async function AcademicLevelAttendancePage({ params }: Props) {
  const { academicLevelId, classId } =  await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    // const identifier = slug || session?.user?.id || '';
  
    // // 2. Retrieve the memoized company data (no extra DB cost)
    // const company = await findCompanyCached(identifier, "page");
  
    // if (!company) {
    //   return <div>Company not found</div>;
    // }
  
    // // Use the actual database ID for your API calls, ensuring consistency
    // const companyId = company.id;

  // TODO: Replace with actual educatorId from your authentication system.
  // For demonstration, we use a placeholder.
  // const educatorId = slug; //"EDUCATOR_ID_PLACEHOLDER"; // Example: "60c72b2f9b1e8b001c8e4d1b"
  //GET educatorId from session
  // const session = await getAuthSession();
  const educatorId = session?.user?.id || "EDUCATOR_ID_PLACEHOLDER";
  
  return (
    <TakeAttendancePage
      academicLevelId={academicLevelId}
      educatorId={educatorId}
      classId={classId}
    />
  );
}