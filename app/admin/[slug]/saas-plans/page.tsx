// app/admin/[slug]/plans/page.tsx
import React from "react";
import PlansClient from "./PlansClient";

export interface PlanItem {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnually: number;
  features: string[];
  isPopular: boolean;
  status: "Active" | "Archived";
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string | null; // null for lifetime or ongoing
  status: "Active" | "Cancelled" | "Expired" | "Trialing";
  billingCycle: "Monthly" | "Annually";
  amount: number;
  paymentMethod: string;
  lastPaymentDate: string;
}

interface PageProps {
  params: { slug: string }; // companyId
  searchParams: {
    page?: string;
    limit?: string;
    subscriptionStatus?: string;
    planName?: string;
  };
}

// Dummy data generation
const generateDummyPlans = (companyId: string): PlanItem[] => [
  {
    id: `plan-free-${companyId}`,
    name: "Free",
    description: "Basic features for individuals.",
    priceMonthly: 0,
    priceAnnually: 0,
    features: ["5 Projects", "1 GB Storage", "Basic Analytics", "Email Support"],
    isPopular: false,
    status: "Active",
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `plan-starter-${companyId}`,
    name: "Starter",
    description: "Ideal for small teams to grow.",
    priceMonthly: 29,
    priceAnnually: 299,
    features: ["25 Projects", "50 GB Storage", "Advanced Analytics", "Chat Support", "Custom Branding"],
    isPopular: true,
    status: "Active",
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `plan-pro-${companyId}`,
    name: "Pro",
    description: "Power tools for growing businesses.",
    priceMonthly: 79,
    priceAnnually: 799,
    features: ["Unlimited Projects", "200 GB Storage", "Real-time Analytics", "Priority Support", "Team Collaboration"],
    isPopular: false,
    status: "Active",
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: `plan-business-${companyId}`,
    name: "Business",
    description: "Enterprise-grade solutions for large organizations.",
    priceMonthly: 199,
    priceAnnually: 1999,
    features: ["All Pro Features", "Unlimited Storage", "Dedicated Account Manager", "SLA Support", "On-Premise Option"],
    isPopular: false,
    status: "Active",
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const generateDummySubscriptions = (companyId: string, count: number, plans: PlanItem[]): SubscriptionItem[] => {
  const subscriptions: SubscriptionItem[] = [];
  const statuses = ["Active", "Cancelled", "Expired", "Trialing"];
  const billingCycles = ["Monthly", "Annually"];

  for (let i = 1; i <= count; i++) {
    const userNum = Math.floor(Math.random() * 100) + 1; // Corresponds to dummy users
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const startDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString();
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    let endDate: string | null = null;
    if (status === "Expired" || status === "Cancelled") {
      endDate = new Date(new Date(startDate).getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
    } else if (plan.priceMonthly > 0) { // Only active paid plans might have an end date for current cycle
      endDate = new Date(new Date(startDate).getTime() + (plan.priceMonthly ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString();
    }
    const billingCycle = billingCycles[Math.floor(Math.random() * billingCycles.length)];
    const amount = billingCycle === "Monthly" ? plan.priceMonthly : plan.priceAnnually / 12; // Average monthly for annual
    const lastPaymentDate = new Date(new Date(startDate).getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();


    subscriptions.push({
      id: `sub-${i}-${companyId}`,
      userId: `user-${userNum}-${companyId}`,
      userName: `User ${userNum} Name`,
      userEmail: `user${userNum}@example.com`,
      planId: plan.id,
      planName: plan.name,
      startDate,
      endDate,
      status: status as "Active" | "Cancelled" | "Expired" | "Trialing",
      billingCycle: billingCycle as "Monthly" | "Annually",
      amount: parseFloat(amount.toFixed(2)),
      paymentMethod: "Credit Card", // Simplified
      lastPaymentDate,
    });
  }
  return subscriptions;
};

export default async function PlansPage({ params, searchParams }: PageProps) {
  const companyId = params.slug;
  const page = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "10");
  const subscriptionStatus = searchParams.subscriptionStatus || "";
  const planName = searchParams.planName || "";

  const allPlans = generateDummyPlans(companyId);

  const fetchSubscriptions = async (
    currentPage: number,
    currentLimit: number,
    currentStatus: string,
    currentPlanName: string
  ) => {
    // Simulate API call for subscriptions
    const allDummySubscriptions = generateDummySubscriptions(companyId, 50, allPlans); // 50 dummy subscriptions
    let filteredSubscriptions = allDummySubscriptions;

    if (currentStatus) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.status === currentStatus);
    }
    if (currentPlanName) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.planName === currentPlanName);
    }

    const startIndex = (currentPage - 1) * currentLimit;
    const endIndex = startIndex + currentLimit;
    const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

    return {
      subscriptionsData: paginatedSubscriptions,
      totalSubscriptionItems: filteredSubscriptions.length,
      totalSubscriptionPages: Math.ceil(filteredSubscriptions.length / currentLimit),
    };
  };

  let plansData: PlanItem[] = [];
  let subscriptionsData: SubscriptionItem[] = [];
  let totalSubscriptionItems = 0;
  let totalSubscriptionPages = 0;

  try {
    plansData = allPlans; // Plans are usually static or managed separately
    ({ subscriptionsData, totalSubscriptionItems, totalSubscriptionPages } = await fetchSubscriptions(
      page,
      limit,
      subscriptionStatus,
      planName
    ));
  } catch (err: any) {
    console.error("[PlansPage] Error fetching data:", err.message);
  }

  return (
    <PlansClient
      companyId={companyId}
      plans={plansData}
      subscriptions={subscriptionsData}
      totalSubscriptionItems={totalSubscriptionItems}
      totalSubscriptionPages={totalSubscriptionPages}
      currentSubscriptionPage={page}
      subscriptionsPerPage={limit}
      refetchSubscriptions={fetchSubscriptions}
    />
  );
}