import React from "react";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import { searchPOSCustomers } from "@/lib/pos/posCustomerService";
import AgentCustomersClient from "./AgentCustomersClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentCustomersPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "customers");

  const companyId = context.company.id;

  // Fetch initial customers via canonical POS customer service
  const customers = await searchPOSCustomers({
    companyId,
    query: "",
    limit: 50,
  }).catch(() => []);

  const formatted = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    customerNumber: c.customerNumber,
  }));

  return (
    <AgentCustomersClient
      slug={slug}
      currency={context.company.currency}
      initialCustomers={formatted}
    />
  );
}
