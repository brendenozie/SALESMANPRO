import React from "react";
import AdminAppointmentsClient, {
  AppointmentItem,
  OrderItem,
  UnifiedItem,
} from "./AdminAppointementsClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function AppointmentsPage({ params, searchParams }: Props) {
  const { slug: companyId } = await params;
  const parsedSearchParams = await searchParams;
  
  const page = parsedSearchParams.page || "1";
  const limit = parsedSearchParams.limit || "12"; // Increased to 12 for better matching layout cards

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

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