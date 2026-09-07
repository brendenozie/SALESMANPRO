// app/(dashboard)/tasks/page.tsx

import { getAuthSession } from "@/lib/auth";
import TaskDashboard from "./TaskDashboardClient";

export default async function TasksPage() {
  const session = await getAuthSession();

  const url = process.env.NEXT_PUBLIC_API_URL || "/api";
  let tasksData = [];

  try {
    const res = await fetch(`${url}/admin/tasks`, { next: { revalidate: 60 } });
    tasksData = await res.json();
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }

  return <TaskDashboard tasksData={tasksData} />;
}
