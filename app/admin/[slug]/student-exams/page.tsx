// app/admin/[slug]/student-exams/page.tsx
import React from "react";
import StudentExamsPage from "./StudentExamsPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StudentExamsServerPage({ params }: PageProps) {
  const { slug } = await params;
  return <StudentExamsPage />;
}
