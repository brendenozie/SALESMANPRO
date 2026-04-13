import { notFound, redirect } from "next/navigation";
import TaskDetailsClient from "./TaskDetailsClient";

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
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
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
  const task = await fetchTask((await params).id);
  if (!task) return notFound();

  return <TaskDetailsClient task={task} />;
}
