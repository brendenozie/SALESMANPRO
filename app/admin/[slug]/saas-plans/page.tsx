import { PlansClient } from "./PlansClient"; // Adjust this path as necessary


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// =================================================================================================
// TYPE DEFINITIONS
// These types match the data returned by the API routes and are used for type safety.
// =================================================================================================
interface PlanItem {
  id: string;
  companyId: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnually: number;
  features: string[];
  isPopular: boolean;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionItem {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  planId: string;
  plan: {
    id: string;
    name: string;
  };
  startDate: Date;
  endDate: Date | null;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "TRIALING";
  billingCycle: "MONTHLY" | "ANNUALLY";
  amount: number;
  paymentMethod: string | null;
  lastPaymentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PlansClientProps {
  params : Promise<{
    slug: string;
  }>;
}



// =================================================================================================
// SERVER-SIDE DATA FETCHING
// This component fetches all necessary data on the server before rendering the client component.
// =================================================================================================
export default async function DashboardPage({params }: PlansClientProps) {
  const { slug : companyId } = await params;

  // In a real application, you would get this from the user's session or a URL parameter
  // const companyId = "60c84e1b5b4e5d1a2c8a2a01"; // Hardcoded for demonstration

  const subscriptionsPerPage = 10;
  const initialCurrentSubscriptionPage = 1;

  try {
    // Fetch Plans from the API
    const plansRes = await fetch(`${apiBaseUrl}/admin/plan?companyId=${companyId}`, {
      cache: 'no-store', // Always fetch fresh data
    });
    const plansData = await plansRes.json();
    const plans: PlanItem[] = plansData.plans || [];

    // Fetch Subscriptions from the API for the first page
    const subscriptionsRes = await fetch(
      `${apiBaseUrl}/admin/subscriptions?companyId=${companyId}&page=${initialCurrentSubscriptionPage}&perPage=${subscriptionsPerPage}`,
      { cache: 'no-store' }
    );
    const subscriptionsData = await subscriptionsRes.json();
    const initialSubscriptions: SubscriptionItem[] = subscriptionsData.subscriptions || [];

    return (
      <PlansClient
        companyId={companyId}
        plans={plans}
        initialSubscriptions={initialSubscriptions}
        initialTotalSubscriptionItems={subscriptionsData.totalItems || 0}
        initialTotalSubscriptionPages={subscriptionsData.totalPages || 0}
        initialCurrentSubscriptionPage={initialCurrentSubscriptionPage}
        subscriptionsPerPage={subscriptionsPerPage}
      />
    );
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    return <div className="text-center p-10 text-red-500">Failed to load dashboard data. Please try again later.</div>;
  }
}



// const generateDummyPlans = (companyId: string): PlanItem[] => [
//   {
//     id: `plan-free-${companyId}`,
//     name: "Free",
//     description: "Basic features for individuals.",
//     priceMonthly: 0,
//     priceAnnually: 0,
//     features: ["5 Projects", "1 GB Storage", "Basic Analytics", "Email Support"],
//     isPopular: false,
//     status: "Active",
//     createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: `plan-starter-${companyId}`,
//     name: "Starter",
//     description: "Ideal for small teams to grow.",
//     priceMonthly: 29,
//     priceAnnually: 299,
//     features: ["25 Projects", "50 GB Storage", "Advanced Analytics", "Chat Support", "Custom Branding"],
//     isPopular: true,
//     status: "Active",
//     createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: `plan-pro-${companyId}`,
//     name: "Pro",
//     description: "Power tools for growing businesses.",
//     priceMonthly: 79,
//     priceAnnually: 799,
//     features: ["Unlimited Projects", "200 GB Storage", "Real-time Analytics", "Priority Support", "Team Collaboration"],
//     isPopular: false,
//     status: "Active",
//     createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: `plan-business-${companyId}`,
//     name: "Business",
//     description: "Enterprise-grade solutions for large organizations.",
//     priceMonthly: 199,
//     priceAnnually: 1999,
//     features: ["All Pro Features", "Unlimited Storage", "Dedicated Account Manager", "SLA Support", "On-Premise Option"],
//     isPopular: false,
//     status: "Active",
//     createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
// ];