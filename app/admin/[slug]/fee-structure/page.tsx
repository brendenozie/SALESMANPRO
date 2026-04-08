import { cookies } from "next/headers";
import FeeStructureClient from "./FeeStructureClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FeeStructurePage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialStructures = [];
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/fee-structure?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialStructures = (await res.json()).data;
    }
  } catch (err) {
    // console.error("[FeeStructurePage] Failed to load fee structures", err);
  }

  return (
    <FeeStructureClient
      initialStructures={initialStructures}
      schoolId={schoolId}
    />
  );
}
