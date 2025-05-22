import UserLayout from "../../../components/UserLayout";
import UserNav from "../../../components/UserNav";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import salesIcon from "@/assets/bmi.png";
import targetIcon from "@/assets/hb.png";
import ChartThree from "../../../components/ChartThree";
import ChartTwo from "../../../components/ChartTwo";
import React from 'react';
import clientsIcon from "@/assets/bmi.png";
import productIcon from "@/assets/bmi.png";
import agentIcon from "@/assets/bmi.png";
import orderIcon from "@/assets/bmi.png";
import communicationIcon from "@/assets/bmi.png";
import demoIcon from "@/assets/calories.png";
import commissionIcon from "@/assets/sleep.png";
import edit from "@/assets/edit.png";
import waterbottle from "@/assets/water.png"
import Layout from "../../../components/AdminLayout";
import AdminLayout from "../../../components/AdminLayout";

// Helper function to calculate progress as a percentage
const calculateProgress = (currentValue: number, dailyGoal: number | undefined) => {
  if (!currentValue || !dailyGoal) return 0;  // Handle cases where values are missing
  const progress = (currentValue / dailyGoal) * 100;
  return Math.min(progress, 100);  // Ensure progress doesn't exceed 100%
};

type LoaderProps = {
  src: string;
  width?: number;
  quality?: number;
};

const loaderProp = ({ src, width, quality }: LoaderProps) => {
  // Optionally, you can handle width and quality parameters to optimize image loading.
  const params = [`w=${width || 800}`]; // Default width to 800 if not provided
  if (quality) {
    params.push(`q=${quality}`);
  }

  // Return the optimized image URL
  return `${src}?${params.join('&')}`;
};

type Props = {
  clientData: {
    newClients: number;
  };
  inventoryData: {
    lowStock: number;
  };
  agentData: {
    topAgent: string;
    topAgentSales: number;
  };
  communicationData: {
    today: number;
  };
  orderData: {
    completedToday: number;
  };
  salesData?: {
    todaySales?: number;
    monthlyTargetProgress?: number;
    leadsConverted?: number;
    demosConducted?: number;
    commissionEarned?: number;
  };
  taskData?: {
    tasks: {
      id: string;
      taskName: string;
      dueDate: string;
      dueTime: string;
    }[];
  };
  session: Session;
};

const AdminDash = (props: Props) => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };


  const salesGoal = 100;


   const dataCards = [
    {
      href: "/admin/sales",
      bgColor: "bg-blue-50 dark:bg-blue-900",
      title: "Daily Sales",
      icon: salesIcon,
      value: `${props?.salesData?.todaySales || 0} Units`,
      progress: calculateProgress(props?.salesData?.todaySales || 0, salesGoal),
      barColor: "bg-green-500",
    },
    {
      href: "/admin/targets",
      bgColor: "bg-pink-50 dark:bg-pink-900",
      title: "Monthly Targets",
      icon: targetIcon,
      value: `${props?.salesData?.monthlyTargetProgress || 0}% Achieved`,
      progress: props?.salesData?.monthlyTargetProgress || 0,
      barColor: "bg-blue-500",
    },
    {
      href: "/admin/customers",
      bgColor: "bg-green-50 dark:bg-green-900",
      title: "New Client",
      icon: clientsIcon,
      value: `${props?.clientData?.newClients || 0} Clients`,
      progress: calculateProgress(props?.clientData?.newClients || 0, 10),
      barColor: "bg-green-500",
    },
    {
      href: "/admin/agents",
      bgColor: "bg-teal-50 dark:bg-teal-900",
      title: "Top Agents",
      icon: agentIcon,
      value: `${props?.agentData?.topAgent || "N/A"}`,
      progress: calculateProgress(props?.agentData?.topAgentSales || 0, 10),
      barColor: "bg-teal-500",
    },
    {
      href: "/admin/inventory",
      bgColor: "bg-red-50 dark:bg-red-900",
      title: "Low Stock ",
      icon: productIcon,
      value: `${props?.inventoryData?.lowStock || 0} Items`,
      progress: calculateProgress(props?.inventoryData?.lowStock || 0, 5),
      barColor: "bg-red-500",
    },
    {
      href: "/admin/orders",
      bgColor: "bg-orange-50 dark:bg-orange-900",
      title: "Orders Pending",
      icon: orderIcon,
      value: `${props?.orderData?.completedToday || 0} Orders`,
      progress: calculateProgress(props?.orderData?.completedToday || 0, 50),
      barColor: "bg-orange-500",
    },
    {
      href: "/admin/communications",
      bgColor: "bg-gray-50 dark:bg-gray-900",
      title: "Messages",
      icon: communicationIcon,
      value: `${props?.communicationData?.today || 0} Messages`,
      progress: calculateProgress(props?.communicationData?.today || 0, 50),
      barColor: "bg-gray-500",
    },
  ];

    return (
        <AdminLayout>
            <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
                <UserNav />
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-full h-full p-4 space-y-8 lg:space-y-0 lg:space-x-8"> 
                      <div className="w-full lg:w-2/3 space-y-6">

                        {/* Progress for Today */}
                        <div className="p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-800">
                          
                          <header className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Progress</h2>
                          </header>
                          <div className="mb-6">
                            {props?.inventoryData?.lowStock > 0 && (
                              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                ⚠️ {props.inventoryData.lowStock} products are low on stock.{' '}
                                <Link href="/admin/inventory">View Inventory</Link>
                              </div>
                            )}
                          </div>
                          
                          {/* Data Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dataCards.map((card, index) => (
                              <Link
                                key={index}
                                href={card.href}
                                className={`flex flex-col gap-6 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 ${card.bgColor}`}
                              >
                                {/* Card Header */}
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-white rounded-full shadow-md dark:bg-gray-800">
                                    <Image
                                      src={card.icon}
                                      alt={card.title}
                                      width={48}
                                      height={48}
                                      loader={loaderProp}
                                      className="w-10 h-10"
                                    />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{card.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-300">{card.value}</p>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                                  <div
                                    className={`absolute top-0 left-0 h-full rounded-full ${card.barColor}`}
                                    style={{ width: `${card.progress}%` }}
                                  ></div>
                                </div>

                                {/* Card Footer */}
                                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                                  <span>{`${card.progress}% Completed`}</span>
                                  <span className="text-orange-500 font-medium hover:underline">View Details</span>
                                </div>
                              </Link>
                            ))}
                          </div>                          
                        </div>

                        {/* Task List or Upcoming Meetings */}
                        <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-lg shadow-xl">
                          <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ongoing Campaigns</h3>
                          <a
                            href="/salescampaigns"
                            className="py-2 px-5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-lg hover:from-orange-600 hover:to-yellow-600 transition-transform transform hover:scale-105"
                          >
                            View All
                          </a>
                          </div>

                          {/* Campaigns List */}
                          <div className="space-y-6">
                            {[
                              {
                                id: "campaign1",
                                campaignName: "Holiday Sales Drive",
                                campaignDesc: "Boost holiday sales by focusing on discounted products.",
                                status: "Ongoing",
                              },
                              {
                                id: "campaign2",
                                campaignName: "Customer Retention Campaign",
                                campaignDesc: "Follow up with existing customers for repeat sales.",
                                status: "Ongoing",
                              },
                              {
                                id: "campaign3",
                                campaignName: "New Product Launch",
                                campaignDesc: "Promote the latest product to drive initial sales.",
                                status: "Ongoing",
                              },
                            ].map((campaign, index) => (
                              <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="block">
                                <div
                                  className={`p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105 dark:shadow-md ${{
                                    0: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800",
                                    1: "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-600 dark:to-orange-700",
                                  }[index % 2]}`}
                                >
                                  <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{campaign.campaignName}</h2>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{campaign.campaignDesc}</p>
                                  <button
                                    className={`w-full py-2 px-4 font-medium text-white rounded-lg shadow-md transition-colors ${{
                                      0: "bg-orange-500 hover:bg-orange-600",
                                      1: "bg-gray-900 hover:bg-gray-800",
                                    }[index % 2]}`}
                                  >
                                    View Details
                                  </button>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Statistics and Activity */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-800">
                          
                          {/* Statistics Section */}
                          <div className="col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistics</h2>
                            <div className="flex justify-center items-center ">
                              <ChartTwo />
                            </div>
                          </div>

                          {/* Exercise Activity Section */}
                          <div className="col-span-1 bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exercise Activity</h2>
                            <div className="flex justify-center items-center ">
                              <ChartThree />
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Right Sidebar */}
                      <div className="w-full lg:w-1/3 p-6 space-y-8 text-gray-800 bg-gradient-to-b from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl dark:from-gray-800 dark:via-gray-700 dark:to-gray-900">
                        {/* Header */}

                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-extrabold text-gray-800">Today's Plan</h3>
                            <a
                              href="/tasks"
                              className="py-2 px-5 bg-indigo-600 font-semibold text-white rounded-full shadow-md hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25M8.25 9V5.25m-1.5 12.75h9a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0015.75 5.25h-7.5A2.25 2.25 0 006 7.5v7.5A2.25 2.25 0 008.25 17.25z" />
                              </svg>
                              View All
                            </a>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
                            {[
                              {
                                id: "task1",
                                taskName: "Follow Up with Lead",
                                dueDate: "2024-12-01",
                                dueTime: "10:00 AM",
                                description: "Call the client to finalize the sales deal.",
                                icon: "📞",
                              },
                              {
                                id: "task2",
                                taskName: "Team Sales Meeting",
                                dueDate: "2024-12-01",
                                dueTime: "12:00 PM",
                                description: "Discuss progress and upcoming targets for the team.",
                                icon: "📋",
                              },
                              {
                                id: "task3",
                                taskName: "Product Demo",
                                dueDate: "2024-12-01",
                                dueTime: "3:00 PM",
                                description: "Present the product to a new client.",
                                icon: "💡",
                              },
                              {
                                id: "task4",
                                taskName: "Review Campaign Metrics",
                                dueDate: "2024-12-01",
                                dueTime: "5:00 PM",
                                description: "Analyze performance of current campaigns.",
                                icon: "📊",
                              },
                            ].map((task, index) => (
                              <div
                                key={index}
                                className="bg-white shadow-md p-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-start gap-4"
                              >
                                <div className="flex-shrink-0 text-3xl">{task.icon}</div>
                                <div className="flex-grow">
                                  <h4 className="text-lg font-bold text-gray-800">{task.taskName}</h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    <strong>Due:</strong> {task.dueDate} at {task.dueTime}
                                  </p>
                                  <p className="text-gray-500 mt-2">{task.description}</p>
                                  <Link href={`/taskdetails/${task.id}`}>
                                    <button className="mt-4 py-2 px-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-md shadow hover:from-orange-500 hover:to-orange-600 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                      </svg>
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
            {/* <Suspense fallback={<>Loading...</>}>
                <AddExerciseSchedule exercisesData={props.exercisesData} session={props.session} />
            </Suspense> */}
        </AdminLayout >
    );
};

export default AdminDash;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context);
  const url = process.env.NEXT_PUBLIC_API_URL;

  // const today = new Date();
  // const oneMonthBack = new Date();
  // oneMonthBack.setMonth(today.getMonth() - 1);

  // Format dates for query parameters
  // const fromDate = new Date(oneMonthBack.setHours(0, 0, 0, 0)).toISOString(); // Start of one month back
  // const toDate = new Date(today.setHours(23, 59, 59, 999)).toISOString(); // End of today

  // const userId = session?.user?.id || ""; // Extract userId from session

  // -data?fromDate=${encodeURIComponent(
  //       fromDate
  //     )}&toDate=${encodeURIComponent(toDate)}&userId=${userId}

  try {
    // Single API call with query parameters
    const res = await fetch(
      `${url}/admin/dashboard`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const data = await res.json(); // Parse the response

    console.log(data);
    
      return {
      props: {
        clientData: data.clientData,
        inventoryData: data.inventoryData,
        agentData: data.agentData,
        communicationData: data.communicationData,
        orderData: data.orderData,
        salesData: data.salesData,
        taskData: data.taskData,
      },
    };

    // return {
    //   props: {
    //     session,
    //     clientData: {
    //       newClients: data.clientData.newClients || 0,
    //     },
    //     inventoryData: {
    //       lowStock: data.inventoryData.lowStock || 0,
    //     },
    //     agentData: {
    //       topAgent: data.agentData.topAgent || "",
    //       topAgentSales: data.agentData.topAgentSales || 0,
    //     },
    //     communicationData: {
    //       today: data.communicationData.today || 0,
    //     },
    //     orderData: {
    //       completedToday: data.orderData.completedToday || 0,
    //     },
    //     salesData: {
    //       todaySales: data.salesData?.todaySales || 0,
    //       monthlyTargetProgress:
    //         data.salesData?.monthlyTargetProgress || 0,
    //       leadsConverted: data.salesData?.leadsConverted || 0,
    //       demosConducted: data.salesData?.demosConducted || 0,
    //       commissionEarned: data.salesData?.commissionEarned || 0,
    //     },
    //     taskData: {
    //       tasks: data.taskData?.tasks || [],
    //     },
    //   },
    // };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    // Return default values in case of errors
    return {
      props: {
        session,
        clientData: { newClients: 0 },
        inventoryData: { lowStock: 0 },
        agentData: { topAgent: "", topAgentSales: 0 },
        communicationData: { today: 0 },
        orderData: { completedToday: 0 },
        salesData: {
          todaySales: 0,
          monthlyTargetProgress: 0,
          leadsConverted: 0,
          demosConducted: 0,
          commissionEarned: 0,
        },
        taskData: { tasks: [] },
      },
    };
  }
};
