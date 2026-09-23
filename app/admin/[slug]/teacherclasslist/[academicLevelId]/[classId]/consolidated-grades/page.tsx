// app/admin/[slug]/teacherclasslist/[academicLevelId]/[classId]/consolidated-grades/page.tsx
import React from "react";
import ConsolidatedGradesPage from "./ConsolidatedGradesPage";

interface Props {
  params: Promise<{
    slug: string;
    academicLevelId: string;
    classId: string;
  }>;
}

export default async function ConsolidatedGradesPageServer({ params }: Props) {
  const { classId } = await params;
  return <ConsolidatedGradesPage classId={classId} />;
}
