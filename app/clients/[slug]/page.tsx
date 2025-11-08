"use client";

import Image from "next/image";
import Link from "next/link";
import salesIcon from "@/assets/bmi.png";
import targetIcon from "@/assets/hb.png";
import productIcon from "@/assets/bmi.png";
import communicationIcon from "@/assets/bmi.png";
import ClientLayout from "@/components/ClientLayout";
import UserNav from "@/components/UserNav";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // make sure this points to your NextAuth config

// --- Helper Functions ---
const calculateProgress = (currentValue: number, dailyGoal: number) => {
  if (!currentValue || !dailyGoal) return 0;
  const progress = (currentValue / dailyGoal) * 100;
  return Math.min(progress, 100);
};

const loaderProp = ({ src, width, quality }: { src: string; width?: number; quality?: number }) => {
  const params = [`w=${width || 800}`];
  if (quality) params.push(`q=${quality}`);
  return `${src}?${params.join("&")}`;
};

// --- Fetch Server Data ---
async function fetchDashboardData() {
  const baseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  try {
    const [
      salesData,
      clientData,
      inventoryData,
      agentData,
      communicationData,
      taskData,
    ] = await Promise.all([
      fetch(`${baseUrl}/sales-data`, { cache: "no-store" }).then((res) => res.json()),
      fetch(`${baseUrl}/client-data`, { cache: "no-store" }).then((res) => res.json()),
      fetch(`${baseUrl}/inventory-data`, { cache: "no-store" }).then((res) => res.json()),
      fetch(`${baseUrl}/agent-data`, { cache: "no-store" }).then((res) => res.json()),
      fetch(`${baseUrl}/communication-data`, { cache: "no-store" }).then((res) => res.json()),
      fetch(`${baseUrl}/today-tasks`, { cache: "no-store" }).then((res) => res.json()),
    ]);

    return {
      salesData,
      clientData,
      inventoryData,
      agentData,
      communicationData,
      taskData,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      salesData: null,
      clientData: null,
      inventoryData: null,
      agentData: null,
      communicationData: null,
      taskData: null,
    };
  }
}

// --- Main Component ---
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const { salesData, clientData, inventoryData, communicationData, taskData } =
    await fetchDashboardData();

  const dataCards = [
    {
      href: "/sales",
      bgColor: "bg-blue-50 dark:bg-blue-900",
      title: "Daily Sales",
      icon: salesIcon,
      value: `${salesData?.todaySales || 0} Units`,
      progress: calculateProgress(salesData?.todaySales || 0, 100),
      barColor: "bg-green-500",
    },
    {
      href: "/targets",
      bgColor: "bg-pink-50 dark:bg-pink-900",
      title: "Monthly Target",
      icon: targetIcon,
      value: `${salesData?.monthlyTargetProgress || 0}% Achieved`,
      progress: salesData?.monthlyTargetProgress || 0,
      barColor: "bg-blue-500",
    },
    {
      href: "/inventory",
      bgColor: "bg-red-50 dark:bg-red-900",
      title: "Low Stock Products",
      icon: productIcon,
      value: `${inventoryData?.lowStock || 0} Items`,
      progress: calculateProgress(inventoryData?.lowStock || 0, 5),
      barColor: "bg-red-500",
    },
    {
      href: "/communications",
      bgColor: "bg-gray-50 dark:bg-gray-900",
      title: "Messages",
      icon: communicationIcon,
      value: `${communicationData?.today || 0} Messages`,
      progress: calculateProgress(communicationData?.today || 0, 50),
      barColor: "bg-gray-500",
    },
  ];

  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row bg-gray-100 min-h-full h-full p-4 space-y-8 lg:space-y-0 lg:space-x-8">
            {/* Left Section */}
            <div className="w-full lg:w-2/3 space-y-6">
              {/* Data Cards */}
              <div className="p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-800">
                <header className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                    Today's Progress
                  </h2>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dataCards.map((card, index) => (
                    <Link
                      key={index}
                      href={card.href}
                      className={`flex flex-col gap-4 p-6 rounded-2xl shadow-md hover:shadow-lg transition-transform transform hover:scale-105 ${card.bgColor}`}
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={card.icon}
                          alt={card.title}
                          width={48}
                          height={48}
                          loader={loaderProp}
                          className="w-12 h-12 p-2 bg-white rounded-full dark:bg-gray-700"
                        />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {card.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {card.value}
                          </p>
                        </div>
                      </div>
                      <div className="relative w-full h-2 rounded-full bg-gray-200 dark:bg-gray-600">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full ${card.barColor}`}
                          style={{ width: `${card.progress}%` }}
                        ></div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Campaigns Section */}
              <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Recent Orders
                  </h3>
                  <Link
                    href="/salescampaigns"
                    className="py-2 px-5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-lg hover:from-orange-600 hover:to-yellow-600 transition-transform transform hover:scale-105"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      id: "campaign1",
                      campaignName: "Holiday Sales Drive",
                      campaignDesc: "Boost holiday sales with discounted products.",
                    },
                    {
                      id: "campaign2",
                      campaignName: "Customer Retention Campaign",
                      campaignDesc: "Engage existing customers for repeat sales.",
                    },
                    {
                      id: "campaign3",
                      campaignName: "New Product Launch",
                      campaignDesc: "Promote new products for initial traction.",
                    },
                  ].map((campaign, index) => (
                    <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="block">
                      <div
                        className={`p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105 ${
                          index % 2 === 0
                            ? "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800"
                            : "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-600 dark:to-orange-700"
                        }`}
                      >
                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                          {campaign.campaignName}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {campaign.campaignDesc}
                        </p>
                        <button
                          className={`w-full py-2 px-4 font-medium text-white rounded-lg shadow-md transition-colors ${
                            index % 2 === 0
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-gray-900 hover:bg-gray-800"
                          }`}
                        >
                          View Details
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-1/3 p-6 space-y-8 text-gray-800 bg-gradient-to-b from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl dark:from-gray-800 dark:via-gray-700 dark:to-gray-900">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">
                  Today's Plan
                </h3>
                <Link
                  href="/tasks"
                  className="py-2 px-5 bg-indigo-600 font-semibold text-white rounded-full shadow-md hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {taskData && taskData.length > 0 ? (
                  taskData.map((task: any) => (
                    <div
                      key={task.id}
                      className="bg-white shadow-md p-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-start gap-4"
                    >
                      <div className="flex-grow">
                        <h4 className="text-lg font-bold text-gray-800">{task.taskName}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Due:</strong> {task.dueDate} at {task.dueTime}
                        </p>
                        <Link href={`/tasks/${task.id}`}>
                          <button className="mt-4 py-2 px-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-md shadow hover:from-orange-500 hover:to-orange-600 hover:shadow-lg transition-all duration-300">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-600 col-span-full">
                    <p>No tasks available. Add a new task to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
