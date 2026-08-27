import React from "react";
import AssignmentQuestionsManagerPage from "./AssignmentQuestionsManagerPage";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{
    slug: string; // companyId
    assignmentId: string;
  }>;
}

export default async function AssignmentQuestionsPage({ params }: PageProps) {
  const { slug , assignmentId } = await params;
  const cookieHeader = (await cookies()).toString();
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  let initialAssignmentDetails = null;
  let initialQuestions = [];

  try {
    // Fetch assignment details (title, course, etc.)
    const assignmentRes = await fetch(`${apiBaseUrl}/admin/assignments/${assignmentId}`, {
      next: { revalidate: 60 },
      headers: {
        cookie: cookieHeader,
      },
    });
    
    if (assignmentRes.ok) {
      const result = (await assignmentRes.json());
      initialAssignmentDetails = result.data;
    }

    // Fetch assignment questions
    const questionsRes = await fetch(`${apiBaseUrl}/admin/assignment-questions?assignmentId=${assignmentId}`, {
      next: { revalidate: 0 },
      headers: {
        cookie: cookieHeader,
      },
    });
    
    if (questionsRes.ok) {
      const result = (await questionsRes.json());
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