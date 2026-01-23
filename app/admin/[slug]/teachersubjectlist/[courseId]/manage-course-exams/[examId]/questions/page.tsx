import React from "react";
import { cookies } from "next/headers";
import QuestionBuilder from "./QuestionBuilder";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function TeacherAssignmentQuestionsPage({ params }: any) {
  const { courseId, assignmentId } = await params;
  const cookieHeader = (await cookies()).toString();

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