// app/admin/products/page.tsx
import { cookies } from "next/headers";
import ProductsClient from "./ProductsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page = "1", search = "" } = await searchParams;
  const cookieStore = (await cookies()).toString();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  let orders = [];
  let riders = [];
  let pagination = { totalPages: 1, currentPage: 1, totalItems: 0 };
  let revenue = { total: 0, pending: 0, monthly: [] };
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

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