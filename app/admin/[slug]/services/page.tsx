import React from "react";
import AdminServicesClient, { ServiceItem } from "./AdminServicesClient";

// Sample data for services
const sampleServices: ServiceItem[] = [
  {
    id: "svc_001",
    name: "Website Design",
    category: "Design & Development",
    price: 1200,
    duration: "4 weeks",
    provider: {
      name: "Creative Studio",
      email: "contact@creativestudio.com",
      phone: "+254701234567",
    },
    status: "Active",
  },
  {
    id: "svc_002",
    name: "SEO Optimization",
    category: "Marketing",
    price: 800,
    duration: "2 weeks",
    provider: {
      name: "OptimizePro",
      email: "hello@optimizepro.com",
      phone: "+254712345678",
    },
    status: "Pending",
  },
  {
    id: "svc_003",
    name: "Social Media Management",
    category: "Marketing",
    price: 600,
    duration: "1 month",
    provider: {
      name: "SocialBee",
      email: "support@socialbee.com",
      phone: "+254798765432",
    },
    status: "Completed",
  },
];

export default function ServicesPage() {
  // In a real scenario, you'd fetch from an API:
  // const res = await fetch(`/api/admin/services?companyId=${companyId}`);
  // const services = await res.json();

  const initialServices = sampleServices;

  return (
    <div>
      <AdminServicesClient initialServices={initialServices} />
    </div>
  );
}
