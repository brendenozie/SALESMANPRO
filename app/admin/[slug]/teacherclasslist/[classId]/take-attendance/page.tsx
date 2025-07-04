// app/admin/[companyId]/academic-levels/[academicLevelId]/attendance/page.tsx
import React from "react";
import TakeAttendancePage from "./TakeAttendancePage";

// Define the API base URL
// Ensure this matches where your Next.js API routes are served
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: {
    slug: string;
    classId: string;
  };
}

/**
 * This is a Server Component. It extracts path parameters
 * and passes them to the Client Component below.
 * In a real application, 'educatorId' would typically come from
 * an authenticated session (e.g., using NextAuth.js's getServerSession).
 */
export default async function AcademicLevelAttendancePage({ params }: Props) {
  const { slug, classId } = params;

  // TODO: Replace with actual educatorId from your authentication system.
  // For demonstration, we use a placeholder.
  // const educatorId = slug; //"EDUCATOR_ID_PLACEHOLDER"; // Example: "60c72b2f9b1e8b001c8e4d1b"

  // No need to fetch products, categories, agents here, as this page is
  // specifically for attendance and TakeAttendancePage will fetch its own data.

  return (
    <TakeAttendancePage
      academicLevelId={classId}
      educatorId={slug}
      // Pass apiUrl if your client component needs to know it
      // Though typically, client-side fetches would go to relative /api paths
      // or use a configured base URL if the API is external.
      // For this example, we'll keep API_BASE_URL defined within TakeAttendancePage.
    />
  );
}