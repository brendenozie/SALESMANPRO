import { cookies } from "next/headers";
import DepartmentsClient from "./DepartmentsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DepartmentsPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialDepartments = [];
  try {
    const res = await fetch(`${apiBaseUrl}/admin/departments?companyId=${schoolId}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store'
    });
    if (res.ok) initialDepartments = (await res.json()).data;
  } catch (err) {
    console.error("Failed to load departments", err);
  }

  return <DepartmentsClient initialDepartments={initialDepartments} companyId={schoolId} />;
}