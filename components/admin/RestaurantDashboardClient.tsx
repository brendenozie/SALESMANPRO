"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  TruckIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  TicketIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";

/* ------------------ DYNAMIC CHART IMPORT ------------------ */

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ------------------ TYPES ------------------ */

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface DailyOrderVolume {
  hour: string;
  orders: number;
}

interface RevenueTrend {
  day: string;
  revenue: number;
}

interface RestaurantDashboardData {
  metrics: {
    totalOrders: number;
    activeDeliveries: number;
    menuItems: number;
    revenueToday: number;
  };
  tasks: Task[];
  charts: {
    dailyOrdersVolume: DailyOrderVolume[];
    revenueTrends: RevenueTrend[];
  };
}

// interface Props {
//   data?: RestaurantDashboardData;
// }

/* ------------------ CHART COMPONENTS ------------------ */

const OrderFlowChart: React.FC<{ data: DailyOrderVolume[] }> = ({ data }) => {
  const series = [
    {
      name: "Orders",
      data: data.map((d) => d.orders),
    },
  ];

  const options: any = {
    chart: {
      type: "line",
      toolbar: { show: false },
      animations: { enabled: true, easing: "easeinout", speed: 800 },
    },
    stroke: { curve: "stepline", width: 4 },
    colors: ["#ef4444"],
    markers: { size: 0 },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    xaxis: {
      categories: data.map((d) => d.hour),
      labels: { style: { colors: "#64748b" } },
    },
    yaxis: {
      labels: { style: { colors: "#64748b" } },
    },
    tooltip: { theme: "light" },
  };

  return <Chart options={options} series={series} type="line" height={300} />;
};

const RevenueTrendChart: React.FC<{ data: RevenueTrend[] }> = ({ data }) => {
  const series = [
    {
      name: "Revenue",
      data: data.map((d) => d.revenue),
    },
  ];

  const options: any = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "55%",
        distributed: true,
      },
    },
    colors: ["#22c55e", "#16a34a", "#15803d", "#166534"],
    xaxis: {
      categories: data.map((d) => d.day),
      labels: { style: { colors: "#64748b" } },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `$${val.toLocaleString()}`,
      },
    },
    grid: { show: false },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val: number) => `$${val.toLocaleString()}` },
    },
  };

  return <Chart options={options} series={series} type="bar" height={300} />;
};

/* ------------------ MAIN COMPONENT ------------------ */

// export default function ({ data }: Props) {
// export default function ({ data }: Props) {
type Props = RestaurantDashboardData & {
  slug?: string;
};

export default function RestaurantDashboardClient({
  metrics,
  tasks,
  charts,
  slug: companyId,
}: Props) {
  // const { slug: companyId } = useParams();

  // if (!data) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center text-stone-400">
  //       <RocketLaunchIcon className="w-6 h-6 mr-2 animate-bounce" />
  //       Waiting for dashboard data…
  //     </div>
  //   );
  // }

  const cards = [
    {
      title: "Total Orders",
      value: metrics?.totalOrders || 0,
      icon: ClipboardDocumentCheckIcon,
      accent: "text-yellow-500 bg-yellow-100 border-yellow-500",
    },
    {
      title: "Active Deliveries",
      value: metrics?.activeDeliveries || 0,
      icon: TruckIcon,
      accent: "text-blue-500 bg-blue-100 border-blue-500",
    },
    {
      title: "Menu Items",
      value: metrics?.menuItems || 0,
      icon: FireIcon,
      accent: "text-red-500 bg-red-100 border-red-500",
    },
    {
      title: "Revenue Today",
      value: `$${metrics?.revenueToday?.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      accent: "text-green-500 bg-green-100 border-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      <div className="max-w-7xl mx-auto py-12 px-4">

        {/* HEADER */}
        <header className="mb-10 p-10 rounded-[2rem] shadow-2xl text-white bg-gradient-to-br from-stone-700 to-stone-900">
          <div className="flex flex-col md:flex-row justify-between gap-8 items-center">
            <div>
              <span className="bg-yellow-500/20 text-yellow-400 px-4 py-1 rounded-full text-sm font-bold uppercase">
                Live Kitchen Data
              </span>
              <h1 className="text-5xl font-black mt-2">Restaurant Control</h1>
              <p className="mt-2 text-stone-400">Operational overview</p>
            </div>
            <a
              href={`/admin/${companyId}/pos`}
              className="px-8 py-4 bg-red-600 rounded-2xl font-black hover:bg-red-700 transition flex items-center gap-3"
            >
              <TicketIcon className="w-6 h-6" /> Start New Order
            </a>
          </div>
        </header>

        {/* METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`p-6 bg-white rounded-2xl shadow-lg border-l-8 ${card.accent.split(" ")[2]}`}
            >
              <div className={`w-12 h-12 rounded-xl ${card.accent.split(" ")[1]} flex items-center justify-center mb-4`}>
                <card.icon className={`w-7 h-7 ${card.accent.split(" ")[0]}`} />
              </div>
              <p className="text-4xl font-black text-stone-900">{card.value}</p>
              <h2 className="font-bold text-stone-500">{card.title}</h2>
            </div>
          ))}
        </section>

        {/* CHARTS + TASKS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <FireIcon className="w-8 h-8 text-red-500" />
                Rush Hour Flow
              </h3>
              <OrderFlowChart data={charts?.dailyOrdersVolume || []} />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
                Revenue Performance
              </h3>
              <RevenueTrendChart data={charts?.revenueTrends || []} />
            </div>
          </div>

          <aside className="bg-white p-8 rounded-3xl shadow sticky top-8">
            <h3 className="text-2xl font-black mb-6">Rush Tasks</h3>

            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto opacity-20" />
                <p className="mt-4 font-bold text-stone-400">Kitchen is clean</p>
              </div>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-5 bg-red-50 rounded-2xl border-l-4 border-red-500 mb-4"
                >
                  <p className="font-black">{t.name}</p>
                  <p className="text-sm font-bold text-red-500 mt-1 flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" /> Due {t.dueTime}
                  </p>
                </div>
              ))
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}
