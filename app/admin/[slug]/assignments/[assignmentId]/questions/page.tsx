import React from "react";
import AssignmentQuestionsManagerPage from "./AssignmentQuestionsManagerPage";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{
    slug: string;
    assignmentId: string;
  }>;
}

export default async function AssignmentQuestionsPage({ params }: PageProps) {
  const { slug, assignmentId } = await params;

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let initialAssignmentDetails = null;
  let initialQuestions = [];

  try {
    const [assignmentRes, questionsRes] = await Promise.all([
      serverFetchJson<any>(`/api/admin/course-assignments/${assignmentId}`),
      serverFetchJson<any>(`/api/admin/assignment-questions?assignmentId=${assignmentId}`)
    ]);

    if (assignmentRes.success && assignmentRes.data) {
      initialAssignmentDetails = assignmentRes.data;
    }
    if (questionsRes.success && questionsRes.data) {
      initialQuestions = Array.isArray(questionsRes.data) ? questionsRes.data : [];
    }
  } catch (err) {
    console.error("Error fetching assignment data:", err);
  }

  return (
    <AssignmentQuestionsManagerPage
      assignmentDetails={initialAssignmentDetails}
      initialQuestions={initialQuestions}
      companyId={companyId}
      assignmentId={assignmentId}
    />
  );
}