import React from "react";
import AdminAppointmentsClient, { AppointmentItem } from "./AdminAppointementsClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  status?:string;
  date?:string;
  timeSlot?:string;
  marketplaceListing?: {
    title?: string;
    name?: string;
  };
  order?: {
    status?: string;
    rider?: string;
    createdAt?: string;
    name?: string;
    title?: string;
    email?:string;
    phone?:string;
    consumer?: {
      name?: string;
    };
  };
}

interface Props {
  params: {
    slug: string; // companyId
  };
}


// Sample data for appointments
const sampleAppointments: AppointmentItem[] = [
  {
    id: "apt_001",
    service: "Dental Checkup",
    date: "2025-06-20",
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
    service: "Therapy Session",
    date: "2025-06-21",
    timeSlot: "02:30 PM",
    client: {
      name: "Bob Smith",
      email: "bob.smith@example.com",
      phone: "+254798765432",
    },
    status: "Completed",
    notes: "Follow-up in two weeks",
  },
  {
    id: "apt_003",
    service: "Consultation",
    date: "2025-06-22",
    timeSlot: "11:15 AM",
    client: {
      name: "Carol Lee",
      email: "carol.lee@example.com",
      phone: "+254701234567",
    },
    status: "Cancelled",
    notes: "Client requested reschedule",
  },
];

export default async function AppointmentsPage({ params }: Props) {
  const companyId = params.slug;
    let orderItems: OrderItem[] = [];
  
    try {
      const res = await fetch(
        `${apiUrl}/admin/orders?companyId=${encodeURIComponent(companyId)}`,
        { cache: "no-store" } // SSR on every request
      );
      if (res.ok) {
        const json = (await res.json()) as { orderItems: OrderItem[] };
        orderItems = json.orderItems || [];
      } else {
        console.error(
          "[ProductsPage] Failed to fetch order items →",
          res.status,
          res.statusText
        );
      }
    } catch (err: any) {
      console.error("[ProductsPage] Error fetching order items →", err.message);
    }
  
  // For now, use sample data
  const initialAppointments = sampleAppointments;

  console.log(orderItems);

  return <AdminAppointmentsClient initialAppointments={initialAppointments} initialOrderItems={orderItems} />;
}
