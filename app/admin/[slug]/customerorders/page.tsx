// app/admin/products/page.tsx
import { cookies } from "next/headers";
import ProductsClient from "./ProductsClient";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { slug: companyId } = await params;
  const { page = "1", search = "" } = await searchParams;
  const cookieStore = (await cookies()).toString();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  let orders = [];
  let riders = [];
  let pagination = { totalPages: 1, currentPage: 1, totalItems: 0 };
  let revenue = { total: 0, pending: 0, monthly: [] };

  try {
    const [ordersRes, ridersRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/orders?companyId=${companyId}&page=${page}&search=${search}&limit=10`, {
        headers: { Cookie: cookieStore },
        next: { revalidate: 0 },
      }),
      fetch(`${apiBaseUrl}/admin/transport/store-drivers?companyId=${companyId}`, {
        headers: { Cookie: cookieStore },
        next: { revalidate: 3600 },
      })
    ]);

    if (ordersRes.ok) {
      const res = await ordersRes.json();
      orders = res.data.orders || [];
      pagination = res.data.pagination;
      revenue = res.data.revenue;
    }

    if (ridersRes.ok) {
      const res = await ridersRes.json();
      riders = res.data || [];
    }
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
  }

  return (
    <ProductsClient 
      initialOrders={orders} 
      initialRiders={riders} 
      pagination={pagination}
      revenue={revenue}
      companyId={companyId}
    />
  );
}