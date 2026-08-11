import React from "react";
import AdminAppointmentsClient, {
  AppointmentItem,
  OrderItem,
  UnifiedItem,
} from "./AdminAppointementsClient";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function AppointmentsPage({ params, searchParams }: Props) {
  
  const parsedSearchParams = await searchParams;
  
  const page = parsedSearchParams.page || "1";
  const limit = parsedSearchParams.limit || "12"; // Increased to 12 for better matching layout cards

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
    const { slug } = await params;
  
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

  let fetchedAppointments: AppointmentItem[] = [];
  let fetchedOrderItems: OrderItem[] = [];
  let totalPages = 1;
  let totalItems = 0;

  try {
    const orderRes = await fetch(
      `${apiBaseUrl}/admin/orders?companyId=${encodeURIComponent(companyId)}&page=${page}&limit=${limit}`,
      {
        next: { revalidate: 10 },
        headers: { cookie: cookieHeader },
      }
    );

    if (orderRes.ok) {
      const json = await orderRes.json();
      
      if (json?.data) {
        totalPages = json.data.meta?.totalPages || json.meta?.totalPages || 1;
        totalItems = json.data.meta?.totalItems || json.meta?.totalItems || 0;
        const ordersArray = json.data.orders || json.data.results || [];
        
        fetchedOrderItems = ordersArray.map((item: any) => ({
          ...item,
          type: "Order",
          consumer: item.consumer || item.order?.consumer || { 
            name: item.name || "Unknown Customer", 
            email: item.email || "", 
            phone: item.phone || "" 
          },
          status: item.status || item.order?.status || 'PENDING',
          items: item.items || []
        }));
      }
    }
  } catch (err: any) {
    console.error("[AppointmentsPage] Error fetching data →", err.message);
  }

  const initialData: UnifiedItem[] = [...fetchedAppointments, ...fetchedOrderItems];

  return (
    <AdminAppointmentsClient
      initialData={initialData}
      currentPage={parseInt(page, 10)}
      totalPages={totalPages}
      totalItems={totalItems}
      limit={parseInt(limit, 10)}
    />
  );
}