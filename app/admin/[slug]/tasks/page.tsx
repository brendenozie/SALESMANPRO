// app/(dashboard)/tasks/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TaskDashboard from "./TaskDashboardClient";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  let tasksData = [];

  try {
    const res = await fetch(`${url}/admin/tasks`, { next: { revalidate: 60 } });
    tasksData = await res.json();
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }

  return <TaskDashboard tasksData={tasksData} />;
}
