import React from "react";
import AssignmentSubmissionsManager from "./AssignmentSubmissionsManagerPage";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{
    slug: string;
    assignmentId: string;
  }>;
}

export default async function AssignmentSubmissionsPage({ params }: PageProps) {
  const { slug, assignmentId } = await params;

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let assignmentData = null;
  let submissionsData = [];

  try {
    const [assignmentRes, submissionsRes] = await Promise.all([
      serverFetchJson<any>(`/api/admin/course-assignments/${assignmentId}`),
      serverFetchJson<any>(`/api/admin/assignment-submissions?assignmentId=${assignmentId}`)
    ]);

    if (assignmentRes.success && assignmentRes.data) {
      assignmentData = assignmentRes.data;
    }
    if (submissionsRes.success && submissionsRes.data) {
      submissionsData = Array.isArray(submissionsRes.data) ? submissionsRes.data : [];
    }
  } catch (err) {
    console.error("Error fetching submissions:", err);
  }

  const finalAssignment = assignmentData || {
    id: assignmentId,
    title: "Assignment Submissions",
    dueDate: new Date().toISOString(),
    totalPoints: 100,
    courseTitle: ""
  };

  return (
    <AssignmentSubmissionsManager 
      assignment={finalAssignment}
      initialSubmissions={submissionsData}
      companyId={companyId}
    />
  );
}