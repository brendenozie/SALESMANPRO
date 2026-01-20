// AdminInventoryPage / page.tsx
import React from "react";
import StudentRosterPage from "./StudentRosterPage";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { notFound } from "next/navigation";

interface PageProps {
  params: { slug: string; courseId: string }; // Assuming courseId is in the URL
  searchParams: { scheduleId?: string; date?: string; classroomId?: string };
}

export default async function AdminInventoryPage({ params, searchParams }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user?.email) return notFound();

  // Find the educator record for the logged-in user
  const educator = await prisma.educator.findUnique({
    where: { userId: session.user.id },
  });

  const { slug: companyId, courseId } = params;
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