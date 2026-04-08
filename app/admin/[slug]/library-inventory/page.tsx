import { cookies } from "next/headers";
import LibraryInventoryClient from "./LibraryInventoryClient";

export default async function LibraryInventoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialItems = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/library/inventory?companyId=${schoolId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) {
      initialItems = (await res.json()).data;
    }
  } catch (err) {
    // console.error("Inventory load failed", err);
  }

  return <LibraryInventoryClient initialItems={initialItems} schoolId={schoolId} />;
}