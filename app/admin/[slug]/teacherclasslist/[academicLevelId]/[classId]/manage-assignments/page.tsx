// app/admin/[slug]/teacherclasslist/[academicLevelId]/[classId]/manage-assignments/page.tsx
import React from "react";
import ManageAssignmentsPage from "./ManageAssignmentsPage";

interface Props {
  params: Promise<{
    slug: string;
    academicLevelId: string;
    classId: string;
  }>;
}

export default async function ManageAssignmentsPageServer({ params }: Props) {
  const { classId } = await params;
  return <ManageAssignmentsPage classId={classId} />;
}
