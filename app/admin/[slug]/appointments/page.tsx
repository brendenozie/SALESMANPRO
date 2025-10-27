// app/[slug]/appointments/page.tsx
import React from "react";
import AdminAppointmentsClient, {
  AppointmentItem,
  OrderItem,
  UnifiedItem, // Import the UnifiedItem type
} from "./AdminAppointementsClient";
import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params:Promise<{ slug: string }>
}

// ──────────────────────────────────────────────
// Sample (Fallback) Data with explicit 'type' field
// ──────────────────────────────────────────────

// Appointments are now typed with 'type: "Appointment"'
const sampleAppointments: AppointmentItem[] = [
  {
    id: "apt_001",
    type: "Appointment", // Explicit Type added
    service: "Dental Checkup",
    date: "2025-07-25",
    timeSlot: "10:00 AM",
    client: {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "+254712345678",
    },
    status: "Scheduled",
    notes: "First-time visitor",
  },
  {
    id: "apt_002",
    type: "Appointment", // Explicit Type added
    service: "Therapy Session",
    date: "2025-07-26",
    timeSlot: "02:30 PM",
    client: {
      name: "Bob Smith",
      email: "bob.smith@example.com",
      phone: "+254798765432",
    },
    status: "Scheduled",
    notes: "Follow-up in two weeks",
  },
];

// Order Items are now typed with 'type: "Order"'
const sampleOrderItems: OrderItem[] = [
  {
    id: "ord_item_001",
    type: "Order", // Explicit Type added
    price: 50.0,
    quantity: 1,
    status: "PENDING",
    date: "2025-07-25",
    timeSlot: "01:00 PM",
    // Ensure nested fields align with the strict OrderItem type
    consumer: {
      name: "Emily White",
      email: "emily.white@example.com",
      phone: "+254733445566",
    },
    marketplaceListing: {
      title: "Standard Home Cleaning",
    },
    order: {
      id: "order_xyz_123",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    },
  },
];

// ──────────────────────────────────────────────
// Page Component (Server Component)
// ──────────────────────────────────────────────
export default async function AppointmentsPage({ params }: Props) {
  const { slug : companyId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let fetchedAppointments: AppointmentItem[] = [];
  let fetchedOrderItems: OrderItem[] = [];

  // 1. Fetch data
  try {
    // NOTE: If you have separate endpoints for Appointments and Orders,
    // you would fetch both concurrently using Promise.all().
    
    // Example: Fetch Orders/Services
    const orderRes = await fetch(
      `${apiUrl}/admin/orders?companyId=${encodeURIComponent(companyId)}`,
      {
        next: { revalidate: 60 },
        headers: { cookie: cookieHeader },
      }
    );

    if (orderRes.ok) {
      const json = await orderRes.json();
      
      // Map and add the explicit 'type' field to each order item
      fetchedOrderItems = json?.data?.orderItems
        ?.filter((item: any) => item.date && item.timeSlot)
        .map((item: any) => ({
          ...item,
          type: "Order",
          // Ensure consumer field exists for safety
          consumer: item.consumer || item.order?.consumer || { name: item.name, email: item.email, phone: item.phone },
          // Use item.status or order.status
          status: item.status || item.order?.status || 'UNKNOWN'
        })) || [];
        
      console.log("✅ Fetched and typed order items:", fetchedOrderItems.length);
    } else {
      console.error(
        "[AppointmentsPage] Failed to fetch order items →",
        orderRes.status,
        orderRes.statusText
      );
    }
    
    // TODO: Add a separate fetch call for appointments if needed,
    // and map them to include `type: "Appointment"`.

  } catch (err: any) {
    console.error(
      "[AppointmentsPage] Error fetching data →",
      err.message
    );
  }

  // 2. Combine all fetched data, or use fallback samples
  const combinedSamples = [...sampleAppointments, ...sampleOrderItems];

  const initialData: UnifiedItem[] = 
    (fetchedAppointments.length > 0 || fetchedOrderItems.length > 0)
      ? [...fetchedAppointments, ...fetchedOrderItems] // Use fetched data
      : combinedSamples; // Use fallback data

  console.log(
    (fetchedAppointments.length > 0 || fetchedOrderItems.length > 0)
      ? `✅ Using fetched data. Total items: ${initialData.length}`
      : `⚠️ Using sample fallback data for demo. Total items: ${initialData.length}`
  );

  // 3. Pass the single, unified data array to the client component
  return (
    <AdminAppointmentsClient
      initialData={initialData}
    />
  );
}

// Enforce dynamic rendering
export const dynamic = 'force-dynamic';