// app/admin/[slug]/teacherclasslist/[academicLevelId]/[classId]/generate-reports/page.tsx
import React from "react";
import GenerateReportsPage from "./GenerateReportsPage";

interface Props {
  params: Promise<{
    slug: string;
    academicLevelId: string;
    classId: string;
  }>;
}

export default async function GenerateReportsPageServer({ params }: Props) {
  const { classId } = await params;
  return <GenerateReportsPage classId={classId} />;
}
