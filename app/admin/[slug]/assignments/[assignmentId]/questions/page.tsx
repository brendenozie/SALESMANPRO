import React from "react";
import AssignmentQuestionsManagerPage from "./AssignmentQuestionsManagerPage";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{
    slug: string; // companyId
    assignmentId: string;
  }>;
}

export default async function AssignmentQuestionsPage({ params }: PageProps) {
  const { slug: companyId, assignmentId } = await params;

  let initialAssignmentDetails = null;
  let initialQuestions = [];

  try {
    // Fetch assignment details (title, course, etc.)
    const assignmentRes = await fetch(`${apiBaseUrl}/admin/assignments/${assignmentId}`, {
      next: { revalidate: 60 },
    });
    
    if (assignmentRes.ok) {
      const result = await assignmentRes.json();
      initialAssignmentDetails = result.data;
    }

    // Fetch assignment questions
    const questionsRes = await fetch(`${apiBaseUrl}/admin/assignment-questions?assignmentId=${assignmentId}`, {
      next: { revalidate: 0 },
    });
    
    if (questionsRes.ok) {
      const result = await questionsRes.json();
      initialQuestions = result.data || [];
    }
  } catch (err) {
    console.error("Error fetching assignment data:", err);
  }

  // if (!initialAssignmentDetails) {
  //   return <div className="p-8 text-center text-red-500 font-semibold">Assignment not found.</div>;
  // }

  return (
    <AssignmentQuestionsManagerPage
      assignmentDetails={initialAssignmentDetails}
      initialQuestions={initialQuestions}
      companyId={companyId}
      assignmentId={assignmentId}
    />
  );
}