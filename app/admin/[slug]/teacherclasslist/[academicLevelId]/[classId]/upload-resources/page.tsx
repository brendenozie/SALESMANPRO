// app/admin/[slug]/teacherclasslist/[academicLevelId]/[classId]/upload-resources/page.tsx
import React from "react";
import UploadResourcesPage from "./UploadResourcesPage";

interface Props {
  params: Promise<{
    slug: string;
    academicLevelId: string;
    classId: string;
  }>;
}

export default async function UploadResourcesPageServer({ params }: Props) {
  const { classId } = await params;
  return <UploadResourcesPage classId={classId} />;
}
