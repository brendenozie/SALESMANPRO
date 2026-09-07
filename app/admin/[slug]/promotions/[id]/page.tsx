import { notFound, redirect } from "next/navigation";
import TaskDetailsClient from "./TaskDetailsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

type Task = {
  id: string;
  taskName: string;
  dueDate: string;
  dueTime: string;
  description: string;
  icon: string;
  status: "pending" | "completed" | "ongoing";
};

async function fetchTask(id: string): Promise<Task | null> {
  const url = process.env.NEXT_PUBLIC_API_URL || "/api";
  try {
    const res = await fetch(`${url}/admin/get-tasks/${id}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface TaskPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskPage({ params }: TaskPageProps) {

  const { id } = await params;

  const task = await fetchTask((await params).id);
 
  if (!task) return notFound();
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = id || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  return <TaskDetailsClient task={task} />;
}
