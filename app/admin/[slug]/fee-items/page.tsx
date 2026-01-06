// app/admin/fee-items/page.tsx
import { cookies } from "next/headers";
import FeeItemsClient from "./FeeItemsClient";
import { FeeItem } from "@/lib/data";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FeeItemsPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialFeeItems: FeeItem[] = [];

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/fee-items?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialFeeItems = (await res.json()).data;
    }
  } catch (err) {
    console.error("[FeeItemsPage] Failed to load fee items", err);
  }

  return (
    <FeeItemsClient
      initialFeeItems={initialFeeItems}
      schoolId={schoolId}
    />
  );
}
