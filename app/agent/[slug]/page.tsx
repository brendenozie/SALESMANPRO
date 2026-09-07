// app/agent/dashboard/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions, getAuthSession } from "@/lib/auth";

import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/UserNav";
import ChartThree from "@/components/ChartThree";
import ChartTwo from "@/components/ChartTwo";

// Icons
import salesIcon from "@/assets/bmi.png";
import targetIcon from "@/assets/hb.png";
import clientsIcon from "@/assets/bmi.png";
import productIcon from "@/assets/bmi.png";
import orderIcon from "@/assets/bmi.png";
import communicationIcon from "@/assets/bmi.png";

type DashboardData = {
  salesData: {
    todaySales: number;
    monthlyTargetProgress: number;
    leadsConverted: number;
    demosConducted: number;
    commissionEarned: number;
  };
  clientData: { newClients: number };
  inventoryData: { lowStock: number };
  agentData: { topAgent: string; topAgentSales: number };
  communicationData: { today: number };
  orderData: { completedToday: number };
  taskData: {
    id: string;
    taskName: string;
    dueDate: string;
    dueTime: string;
  }[];
};

// Helper to calculate percentage progress
const calculateProgress = (currentValue: number, goal: number) => {
  if (!goal) return 0;
  const progress = (currentValue / goal) * 100;
  return Math.min(progress, 100);
};

// ✅ Server Component (no "use client")
export default async function AgentDashboardPage() {
  
  const session = await getAuthSession();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-700 dark:text-gray-200">
        <h2>You must be logged in to view this page.</h2>
      </div>
    );
  }

  // --- Fetch dashboard data ---
  let data: DashboardData | null = null;

  try {
    const token =
      (session as any)?.accessToken ||
      (session as any)?.user?.token ||
      "";

    const res = await fetch(`${apiBaseUrl}/agent/dashboard`, {
      cache: "no-store", // always fresh data
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (res.ok) {
      data = await res.json();
    } else {
      console.error("❌ Failed to fetch dashboard data:", res.statusText);
    }
  } catch (error) {
    console.error("⚠️ Error fetching dashboard data:", error);
  }

  if (!data) {
    return (
      <UserLayout>
        <div className="flex h-screen items-center justify-center text-gray-700 dark:text-gray-200">
          <p>Unable to load dashboard data. Please try again later.</p>
        </div>
      </UserLayout>
    );
  }

  // --- Dashboard cards ---
  const dataCards = [
    {
      href: "/agent/sales",
      bgColor: "bg-blue-50 dark:bg-blue-900",
      title: "Daily Sales",
      icon: salesIcon,
      value: `${data.salesData.todaySales ?? 0} Units`,
      progress: calculateProgress(data.salesData.todaySales ?? 0, 100),
      barColor: "bg-green-500",
    },
    {
      href: "/agent/targets",
      bgColor: "bg-pink-50 dark:bg-pink-900",
      title: "Monthly Target",
      icon: targetIcon,
      value: `${data.salesData.monthlyTargetProgress ?? 0}% Achieved`,
      progress: data.salesData.monthlyTargetProgress ?? 0,
      barColor: "bg-blue-500",
    },
    {
      href: "/agent/customers",
      bgColor: "bg-green-50 dark:bg-green-900",
      title: "New Clients Today",
      icon: clientsIcon,
      value: `${data.clientData.newClients ?? 0} Clients`,
      progress: calculateProgress(data.clientData.newClients ?? 0, 10),
      barColor: "bg-green-500",
    },
    {
      href: "/agent/inventory",
      bgColor: "bg-red-50 dark:bg-red-900",
      title: "Low Stock Products",
      icon: productIcon,
      value: `${data.inventoryData.lowStock ?? 0} Items`,
      progress: calculateProgress(data.inventoryData.lowStock ?? 0, 5),
      barColor: "bg-red-500",
    },
    {
      href: "/agent/orders",
      bgColor: "bg-orange-50 dark:bg-orange-900",
      title: "Orders Completed",
      icon: orderIcon,
      value: `${data.orderData.completedToday ?? 0} Orders`,
      progress: calculateProgress(data.orderData.completedToday ?? 0, 50),
      barColor: "bg-orange-500",
    },
    {
      href: "/agent/communications",
      bgColor: "bg-gray-50 dark:bg-gray-900",
      title: "Messages",
      icon: communicationIcon,
      value: `${data.communicationData.today ?? 0} Messages`,
      progress: calculateProgress(data.communicationData.today ?? 0, 50),
      barColor: "bg-gray-500",
    },
  ];

  // --- JSX output ---
  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />

        <div className="container mx-auto p-4">
          <div className="flex flex-col lg:flex-row bg-gray-100 dark:bg-gray-800 min-h-full h-full p-4 space-y-8 lg:space-y-0 lg:space-x-8 rounded-2xl shadow-inner">

            {/* --- Main Dashboard Section --- */}
            <div className="w-full lg:w-2/3 space-y-6">
              <section className="p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-900 transition-all">
                <header className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                    Progress Overview
                  </h2>
                </header>

                {data.inventoryData.lowStock > 0 && (
                  <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 mb-6">
                    ⚠️ {data.inventoryData.lowStock} products are low on stock.{" "}
                    <Link href="/admin/inventory" className="underline">
                      View Inventory
                    </Link>
                  </div>
                )}

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dataCards.map((card, index) => (
                    <Link
                      key={index}
                      href={card.href}
                      className={`flex flex-col gap-6 p-6 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-300 ${card.bgColor}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-full shadow-md dark:bg-gray-800">
                          <Image
                            src={card.icon}
                            alt={card.title}
                            width={48}
                            height={48}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {card.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {card.value}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full ${card.barColor}`}
                          style={{ width: `${card.progress}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                        <span>{`${card.progress.toFixed(1)}% Completed`}</span>
                        <span className="text-orange-500 font-medium hover:underline">
                          View Details
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Charts Section */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                <div className="col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Sales Statistics
                  </h2>
                  <ChartTwo />
                </div>

                <div className="col-span-1 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Activity Summary
                  </h2>
                  <ChartThree />
                </div>
              </div>
            </div>

            {/* --- Right Sidebar: Tasks --- */}
            <div className="w-full lg:w-1/3 p-6 space-y-8 text-gray-800 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">
                  Today's Plan
                </h3>
                <Link
                  href="/agent/tasks"
                  className="py-2 px-5 bg-indigo-600 font-semibold text-white rounded-full shadow-md hover:bg-indigo-700 transition-all duration-300"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {data.taskData.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-start gap-4"
                  >
                    <div className="text-3xl">📋</div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                        {task.taskName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <strong>Due:</strong> {task.dueDate} at {task.dueTime}
                      </p>
                      <Link href={`/agent/tasks/${task.id}`}>
                        <button className="mt-4 py-2 px-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-md shadow hover:from-orange-500 hover:to-orange-600 transition-all duration-300">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
