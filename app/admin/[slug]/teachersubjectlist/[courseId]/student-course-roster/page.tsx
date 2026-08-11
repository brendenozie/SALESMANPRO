// AdminInventoryPage / page.tsx
import React from "react";
import StudentRosterPage from "./StudentRosterPage";
import prisma from "@/server/db/prismadb";
import { notFound } from "next/navigation";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

interface PageProps {
  params: { slug: string; courseId: string }; // Assuming courseId is in the URL
  searchParams: { scheduleId?: string; date?: string; classroomId?: string };
}

export default async function AdminInventoryPage({ params, searchParams }: PageProps) {
  const session = await getAuthSession();

  if (!session?.user?.email) return notFound();
  
   const { slug, courseId } = await params;
  
    // const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  // Find the educator record for the logged-in user
  const educator = await prisma.educator.findUnique({
    where: { userId: session.user.id },
  });

  const { scheduleId, date, classroomId } = searchParams;

  const pageContext = {
    companyId,
    courseId,
    educatorId: session.user.id, // The API expects the User ID
    scheduleId: scheduleId || "",
    date: date || new Date().toISOString().split('T')[0], // Default to today
    classroomId: classroomId || "",
    courseTitle: searchParams.classroomId || "Class Roster",
    educatorName: session.user.name || "Educator"
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <StudentRosterPage context={pageContext} />
    </div>
  );
}