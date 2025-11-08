"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type Task = {
  id: string;
  taskName: string;
  dueDate: string;
  dueTime: string;
  description: string;
  icon: string;
  status: "pending" | "completed" | "ongoing";
};

type Props = {
  task: Task;
};

const TaskDetails = ({ task }: Props) => {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<Task["status"]>(
    task.status
  );

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as Task["status"];
    setSelectedStatus(newStatus);

    await fetch(`${apiBaseUrl}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    router.refresh(); // revalidate server data
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      await fetch(`${apiBaseUrl}/tasks/${task.id}`, { method: "DELETE" });
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 flex-shrink-0 rounded-full bg-gray-200 flex justify-center items-center text-4xl text-gray-700">
            {task.icon}
          </div>
          <div className="ml-6">
            <h1 className="text-3xl font-bold text-gray-800">{task.taskName}</h1>
            <p className="text-sm text-gray-500">
              Due: {task.dueDate} at {task.dueTime}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-700">Description</h2>
          <p className="text-gray-600">{task.description}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-700">Status</h2>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full p-2 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleDelete}
            className="py-2 px-4 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition-all duration-300"
          >
            Delete Task
          </button>
          <Link href="/dashboard">
            <button className="py-2 px-4 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-all duration-300">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
