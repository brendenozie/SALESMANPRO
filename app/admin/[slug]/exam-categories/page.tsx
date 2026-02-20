import { cookies } from "next/headers";
import ExamCategoriesClient from "./ExamCategoriesClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function ExamCategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialCategories = [];
  try {
    const res = await fetch(`${apiBaseUrl}/exam-categories`, {
      headers: { cookie: cookieHeader },
      next: { revalidate: 0 }, // Categorization often needs fresh data
    });

    if (res.ok) {
      initialCategories = await res.json();
    }
  } catch (err) {
    console.error("Failed to load exam categories", err);
  }

  return (
    <ExamCategoriesClient 
      initialData={initialCategories} 
      schoolId={schoolId} 
    />
  );
}