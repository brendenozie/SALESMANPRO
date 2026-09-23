import React from "react";
import StudentRosterPage, { StudentRosterStudent } from "./StudentRosterPage";
import { getAuthSession } from "@/lib/auth";
import { serverFetchJson } from "@/lib/api/serverFetch";

interface Props {
  params: Promise<{
    slug: string;
    academicLevelId: string;
    classId: string;
  }>;
}

export default async function StudentRosterPageServer({ params }: Props) {
  const { slug, classId, academicLevelId } = await params;

  const session = await getAuthSession();
  const teacherId = session?.user?.id || "";

  let studentsData: StudentRosterStudent[] = [];

  try {
    const res = await serverFetchJson<StudentRosterStudent[]>(
      `/api/teacher/academic-levels/${encodeURIComponent(academicLevelId)}/students?teacherId=${teacherId}&classId=${classId}`
    );

    if (res.success && res.data) {
      studentsData = Array.isArray(res.data) ? res.data : [];
    } else {
      console.error(`[StudentRosterPageServer] Failed to fetch student roster: ${res.error || res.status}`);
    }
  } catch (err: any) {
    console.error("StudentRosterPageServer-fetch error:", err?.message || err);
  }

  return (
    <StudentRosterPage
      students={studentsData}
      companyId={slug || academicLevelId}
    />
  );
}
