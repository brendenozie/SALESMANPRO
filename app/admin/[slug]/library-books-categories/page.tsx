// app/admin/library/categories/page.tsx
import { cookies } from "next/headers";
import LibraryCategoriesClient from "./LibraryCategoriesClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function LibraryCategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialCategories = [];

  try {
    const res = await fetch(`${apiBaseUrl}/admin/library/categories?companyId=${schoolId}`, {
      headers: { cookie: cookieHeader },
      next: { revalidate: 0 },
    });
    if (res.ok) initialCategories = (await res.json()).data;
  } catch (err) {
    console.error("Failed to load categories", err);
  }

  return <LibraryCategoriesClient initialCategories={initialCategories} schoolId={schoolId} />;
}