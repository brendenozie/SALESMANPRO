import { cookies } from "next/headers";
import LibraryAcquisitionsClient from "./LibraryAcquisitionsClient";

export default async function LibraryAcquisitionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialOrders = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/library/acquisitions?companyId=${schoolId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) {
      const result = await res.json();
      initialOrders = result.data.map((o: any) => ({
        id: o.id,
        title: o.title,
        qty: o.qty,
        cost: o.cost,
        status: o.status,
        vendor: o.vendor,
        date: new Date(o.updatedAt).toLocaleDateString()
      }));
    }
  } catch (err) {
    console.error("Acquisitions fetch error", err);
  }

  return <LibraryAcquisitionsClient initialOrders={initialOrders} schoolId={schoolId} />;
}