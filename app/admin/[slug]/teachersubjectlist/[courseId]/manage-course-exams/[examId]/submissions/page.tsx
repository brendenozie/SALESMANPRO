import React from "react";
import ExamSubmissionsManagerPage from "./ExamSubmissionsManagerPage";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{
    slug: string;
    assignmentId: string;
  }>;
}

export default async function AssignmentSubmissionsPage({ params }: PageProps) {
  const { slug: companyId, assignmentId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // --- Fallback Data Definitions ---
  const sampleExam = {
    id: assignmentId,
    title: "Quarterly Marketing Report (Sample)",
    dueDate: new Date().toISOString(),
    totalPoints: 100,
    courseTitle: "Marketing 101"
  };

  const sampleSubmissions = [
    {
      id: "sample-1",
      studentName: "Marcus Aurelius",
      studentEmail: "marcus@stoic.com",
      submittedAt: new Date().toISOString(),
      status: "Submitted",
      fileUrl: "#",
      score: null,
      feedback: "",
    }
  ];

  let examData = null;
  let submissionsData = [];
  let useFallback = false;

  try {
    // Parallel fetching for better performance
    const [examRes, submissionsRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/exams/${assignmentId}`, {
        next: { revalidate: 60 },
        headers: { cookie: cookieHeader },
      }),
      fetch(`${apiBaseUrl}/admin/exam-submissions?examId=${assignmentId}`, {
        cache: 'no-store', // Submissions change frequently
        headers: { cookie: cookieHeader },
      })
    ]);

    if (examRes.ok && submissionsRes.ok) {
      const examJson = await examRes.json();
      const submissionsJson = await submissionsRes.json();
      
      examData = examJson.data;
      submissionsData = submissionsJson.data || [];
    } else {
      console.error("API Error: One or more requests failed");
      useFallback = true;
    }
  } catch (err) {
    console.error("Network Error fetching submissions:", err);
    useFallback = true;
  }

  // Determine final data to pass
  const finalExam = useFallback || !examData ? sampleExam : examData;
  const finalSubmissions = useFallback ? sampleSubmissions : submissionsData;

  return (
    <ExamSubmissionsManagerPage 
      exam={finalExam}
      initialSubmissions={finalSubmissions}
      companyId={companyId}
    />
  );
}