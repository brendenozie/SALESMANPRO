// app/admin/[companyId]/academic-levels/[academicLevelId]/attendance/page.tsx
import React from "react";
import TakeAttendancePage from "./TakeAttendancePage";

// Define the API base URL
// Ensure this matches where your Next.js API routes are served
const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: Promise<{
    slug: string; // teacherId
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
  const { slug, classId } =  await params;

  // TODO: Replace with actual educatorId from your authentication system.
  // For demonstration, we use a placeholder.
  const educatorId = slug; //"EDUCATOR_ID_PLACEHOLDER"; // Example: "60c72b2f9b1e8b001c8e4d1b"
  
  return (
    <TakeAttendancePage
      academicLevelId={classId}
      educatorId={educatorId}
    />
  );
}