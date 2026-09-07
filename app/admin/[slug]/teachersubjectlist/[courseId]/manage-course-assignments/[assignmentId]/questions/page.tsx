import React from "react";
import { cookies } from "next/headers";
import QuestionBuilder from "./QuestionBuilder";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function TeacherAssignmentQuestionsPage({ params }: any) {
  const { courseId, assignmentId } = await params;
  const cookieHeader = (await cookies()).toString();

    // const { slug } = await params;
  
    // const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    // const identifier = slug || session?.user?.id || '';
  
    // // 2. Retrieve the memoized company data (no extra DB cost)
    // const company = await findCompanyCached(identifier, "page");
  
    // if (!company) {
    //   return <div>Company not found</div>;
    // }
  
    // // Use the actual database ID for your API calls, ensuring consistency
    // const companyId = company.id;

  let assignment = null;
  let questions = [];

  try {
    const [assignRes, questRes] = await Promise.all([
      fetch(`${apiBaseUrl}/teacher/assignments/${assignmentId}`, {
        headers: { cookie: cookieHeader },
      }),
      fetch(`${apiBaseUrl}/teacher/assignment-questions?assignmentId=${assignmentId}`, {
        headers: { cookie: cookieHeader },
      })
    ]);

    if (assignRes.ok) assignment = (await assignRes.json()).data;
    if (questRes.ok) questions = (await questRes.json()).data || [];
  } catch (err) {
    console.error("Error fetching teacher data:", err);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuestionBuilder 
        initialQuestions={questions} 
        assignment={assignment} 
        courseId={courseId}
        assignmentId={assignmentId}
      />
    </div>
  );
}