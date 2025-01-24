import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/UserNav";
import Image from "next/image";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";

import salesIcon from "../../assets/bmi.png";
import targetIcon from "../../assets/hb.png";
import clientsIcon from "../../assets/bmi.png";
import productIcon from "../../assets/bmi.png";
import orderIcon from "../../assets/bmi.png";
import communicationIcon from "../../assets/bmi.png";

type LoaderProps = {
  src: string;
  width?: number;
  quality?: number;
};

// Helper function to calculate progress as a percentage
const calculateProgress = (currentValue: any, dailyGoal: any) => {
  if (!currentValue || !dailyGoal) return 0;
  const progress = (currentValue / dailyGoal) * 100;
  return Math.min(progress, 100);
};

const loaderProp = ({ src, width, quality }: LoaderProps) => {
  const params = [`w=${width || 800}`]; // Default width to 800 if not provided
  if (quality) {
    params.push(`q=${quality}`);
  }
  return `${src}?${params.join("&")}`;
};

type Props = {
  data: {
    salesData: {
      todaySales: number;
      monthlyTargetProgress: number;
      leadsConverted: number;
      demosConducted: number;
      commissionEarned: number;
    };
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
    taskData: {
      id: string;
      taskName: string;
      dueDate: string;
      dueTime: string;
    }[];
  };
  session: Session;
};

const Dash2 = (props: Props) => {
  const { data } = props;

  const dataCards = [
    {
      href: "/agent/sales",
      bgColor: "bg-blue-50 dark:bg-blue-900",
      title: "Daily Sales",
      icon: salesIcon,
      value: `${data.salesData.todaySales || 0} Units`,
      progress: calculateProgress(data.salesData.todaySales || 0, 100),
      barColor: "bg-green-500",
    },
    {
      href: "/agent/targets",
      bgColor: "bg-pink-50 dark:bg-pink-900",
      title: "Monthly Target",
      icon: targetIcon,
      value: `${data.salesData.monthlyTargetProgress || 0}% Achieved`,
      progress: data.salesData.monthlyTargetProgress || 0,
      barColor: "bg-blue-500",
    },
    {
      href: "/agent/customers",
      bgColor: "bg-green-50 dark:bg-green-900",
      title: "New Clients Today",
      icon: clientsIcon,
      value: `${data.clientData.newClients || 0} Clients`,
      progress: calculateProgress(data.clientData.newClients || 0, 10),
      barColor: "bg-green-500",
    },
    {
      href: "/agent/inventory",
      bgColor: "bg-red-50 dark:bg-red-900",
      title: "Low Stock Products",
      icon: productIcon,
      value: `${data.inventoryData.lowStock || 0} Items`,
      progress: calculateProgress(data.inventoryData.lowStock || 0, 5),
      barColor: "bg-red-500",
    },
    {
      href: "/agent/orders",
      bgColor: "bg-orange-50 dark:bg-orange-900",
      title: "Orders Pending",
      icon: orderIcon,
      value: `${data.orderData.completedToday || 0} Orders`,
      progress: calculateProgress(data.orderData.completedToday || 0, 50),
      barColor: "bg-orange-500",
    },
    {
      href: "/agent/communications",
      bgColor: "bg-gray-50 dark:bg-gray-900",
      title: "Messages",
      icon: communicationIcon,
      value: `${data.communicationData.today || 0} Messages`,
      progress: calculateProgress(data.communicationData.today || 0, 50),
      barColor: "bg-gray-500",
    },
  ];

  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto">
          {/* Dashboard Content */}
          {/* Same as before */}
        </div>
      </div>
    </UserLayout>
  );
};

export default Dash2;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context);
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  try {
    const data = await fetch(`${url}/agent/dashboard`).then((res) => res.json());

    return {
      props: {
        session,
        data,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        session,
        data: null,
      },
    };
  }
};
