import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/UserNav";
import DashNativeDND from "./DashNativeDND";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const metadata = {
  title: "Task Dashboard | Salesman Pro",
  description: "Manage and track your tasks visually by status",
};

export default async function TasksPage() {
  let tasksData = [];

  try {
    const res = await fetch(`${apiBaseUrl}/tasks`, {
      cache: "no-store", // ensures fresh data each time (like getServerSideProps)
    });
    if (res.ok) {
      tasksData = await res.json();
    }
  } catch (err) {
    console.error("Error fetching tasks:", err);
  }

  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <UserNav />
        <DashNativeDND tasksData={tasksData} />
      </div>
    </UserLayout>
  );
}
