// app/teacher/[educatorId]/academic-levels/[academicLevelId]/reports/page.tsx
import ClassReportsClient from "./ClassReportsClient";

interface PageProps {
  params: Promise<{
    academicLevelId: string;
    classId: string;
  }>;
  searchParams: Promise<{ classId?: string }>;
}

export default async function ClassReportsPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  // const resolvedSearchParams = await searchParams;

  return (
    <ClassReportsClient 
      academicLevelId={resolvedParams.academicLevelId}
      classId={resolvedParams.classId} 
    />
  );
}