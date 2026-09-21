import React from "react";
import ExamSubmissionsManagerPage, { ExamDetailsForSubmissions, ExamSubmissionData } from "./ExamSubmissionsManagerPage";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{
    slug: string;
    examId: string;
  }>;
}

export default async function ExamSubmissionsPage({ params }: PageProps) {
  const { slug, examId } = await params;

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let initialExamDetails: ExamDetailsForSubmissions | null = null;
  let initialSubmissions: ExamSubmissionData[] = [];

  try {
    const [examRes, submissionsRes] = await Promise.all([
      serverFetchJson<any>(`/api/admin/exams/${examId}`),
      serverFetchJson<ExamSubmissionData[]>(`/api/admin/exam-submissions?examId=${encodeURIComponent(examId)}`)
    ]);

    if (examRes.success && examRes.data) {
      const examData = examRes.data;
      initialExamDetails = {
        id: examData.id,
        title: examData.title,
        courseTitle: examData.courseTitle || examData.course?.title || "Exam",
        isOnline: examData.isOnline ?? false,
        autoGrade: examData.autoGrade ?? false,
        totalPoints: examData.totalPoints ?? 100,
        companyId: examData.companyId || companyId,
      };
    }

    if (submissionsRes.success && Array.isArray(submissionsRes.data)) {
      initialSubmissions = submissionsRes.data;
    }
  } catch (err: any) {
    console.error("[ExamSubmissionsPage] Error fetching data:", err);
  }

  if (!initialExamDetails) {
    initialExamDetails = {
      id: examId,
      title: "Exam Submissions",
      courseTitle: "Course Exam",
      isOnline: true,
      autoGrade: true,
      totalPoints: 100,
      companyId: companyId,
    };
  }

  return (
    <ExamSubmissionsManagerPage
      examDetails={initialExamDetails}
      initialSubmissions={initialSubmissions}
      companyId={companyId}
    />
  );
}
