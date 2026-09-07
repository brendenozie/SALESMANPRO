// app/(dashboard)/tasks/page.tsx
import { getServerSession } from "next-auth";
import { authOptions, getAuthSession } from "@/lib/auth";
import AgentsCommissionsClient from "./AgentsCommissionsClient";
import { findCompanyCached } from "@/lib/company-fetcher";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TasksPage({ params }: PageProps) {
  
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

  const url = process.env.NEXT_PUBLIC_API_URL || "/api";
  let tasksData = [];

  try {
    const res = await fetch(`${url}/admin/tasks`, { next: { revalidate: 60 } });
    tasksData = await res.json();
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }

  return <AgentsCommissionsClient initialCommissions={tasksData} />;
}
