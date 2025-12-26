"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  GiftIcon,
  UsersIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  HeartIcon,
  BoltIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
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

interface MonthlyDonation {
  month: string;
  amount: number;
}

interface VolunteerGrowth {
  month: string;
  new: number;
}

interface NonprofitDashboardData {
  metrics: {
    totalDonations: number;
    activeCampaigns: number;
    totalVolunteers: number;
    upcomingEvents: number;
  };
  tasks: Task[];
  charts: {
    monthlyDonations: MonthlyDonation[];
    volunteerGrowth: VolunteerGrowth[];
  };
}

// interface Props {
//   data?: NonprofitDashboardData;
// }

/* ------------------ CHART COMPONENTS ------------------ */

const DonationTrendChart: React.FC<{ data: MonthlyDonation[] }> = ({ data }) => {
  const series = [
    {
      name: "Donations ($)",
      data: data.map((d) => d.amount),
    },
  ];

  const options: any = {
    chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: 4 },
    colors: ["#ea580c"],
    markers: { size: 4 },
    xaxis: {
      categories: data.map((d) => d.month),
      labels: { style: { colors: "#64748b" } },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `$${val.toLocaleString()}`,
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `$${val.toLocaleString()}`,
      },
    },
  };

  return <Chart options={options} series={series} type="line" height={300} />;
};

const VolunteerGrowthChart: React.FC<{ data: VolunteerGrowth[] }> = ({ data }) => {
  const series = [
    {
      name: "New Volunteers",
      data: data.map((d) => d.new),
    },
  ];

  const options: any = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "60%",
        distributed: true,
      },
    },
    colors: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
    xaxis: {
      categories: data.map((d) => d.month),
      labels: { style: { colors: "#64748b" } },
    },
    yaxis: { show: false },
    grid: { show: false },
    legend: { show: false },
  };

  return <Chart options={options} series={series} type="bar" height={300} />;
};

/* ------------------ MAIN COMPONENT ------------------ */

// export default function ({ data }: Props) {
type Props = NonprofitDashboardData & {
  slug?: string;
};

export default function NonprofitDashboardClient({
  metrics,
  tasks,
  charts,
  slug: companyId,
}: Props) {

  // if (!data)
  //   return (
  //     <div className="min-h-screen flex items-center justify-center text-gray-400">
  //       <RocketLaunchIcon className="w-6 h-6 mr-2 animate-bounce" />
  //       Waiting for dashboard data…
  //     </div>
  //   );

  const cards = [
    {
      title: "Total Donations",
      value: `$${metrics.totalDonations.toLocaleString()}`,
      icon: GiftIcon,
      color: "text-orange-600 border-orange-400 bg-orange-50",
      description: "Funds raised year-to-date",
    },
    {
      title: "Active Campaigns",
      value: metrics.activeCampaigns,
      icon: MegaphoneIcon,
      color: "text-fuchsia-600 border-fuchsia-400 bg-fuchsia-50",
      description: "Currently running projects",
    },
    {
      title: "Total Volunteers",
      value: metrics.totalVolunteers,
      icon: UsersIcon,
      color: "text-indigo-600 border-indigo-400 bg-indigo-50",
      description: "Community helpers",
    },
    {
      title: "Upcoming Events",
      value: metrics.upcomingEvents,
      icon: CalendarDaysIcon,
      color: "text-green-600 border-green-400 bg-green-50",
      description: "Scheduled activities",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto py-12 px-4">

        {/* HEADER */}
        <header className="mb-10 p-8 rounded-3xl shadow-xl bg-gradient-to-br from-blue-900 to-gray-950">
          <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
            <div>
              <p className="text-orange-400 font-semibold">Empowering Change</p>
              <h1 className="text-5xl font-extrabold text-white">
                Impact Command Center
              </h1>
              <p className="text-indigo-200 mt-2">Coordination hub</p>
            </div>
            <button className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition flex items-center gap-2">
              <HeartIcon className="w-5 h-5" /> Launch New Appeal
            </button>
          </div>
        </header>

        {/* METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`p-6 bg-white rounded-2xl shadow-md border-t-8 ${card.color.split(" ")[1]}`}
            >
              <div
                className={`w-12 h-12 rounded-full ${card.color.split(" ")[2]} flex items-center justify-center mb-4`}
              >
                <card.icon className={`w-6 h-6 ${card.color.split(" ")[0]}`} />
              </div>
              <p className="text-3xl font-black">{card.value}</p>
              <h3 className="font-bold text-gray-600">{card.title}</h3>
              <p className="text-xs text-gray-400">{card.description}</p>
            </div>
          ))}
        </section>

        {/* CHARTS + TASKS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-xl font-bold mb-4 flex gap-2 items-center">
                <GiftIcon className="w-6 h-6 text-orange-500" />
                Donation Trajectory
              </h3>
              <DonationTrendChart data={charts.monthlyDonations} />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-xl font-bold mb-4 flex gap-2 items-center">
                <UsersIcon className="w-6 h-6 text-blue-500" />
                Volunteer Enrollment
              </h3>
              <VolunteerGrowthChart data={charts.volunteerGrowth} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow sticky top-8">
            <h3 className="text-xl font-bold mb-4 flex gap-2 items-center">
              <BoltIcon className="w-6 h-6 text-orange-500" />
              Urgent Tasks
            </h3>

            {tasks.length === 0 ? (
              <p className="text-sm text-gray-400">No urgent tasks</p>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 mb-3 bg-gray-50 rounded-xl border-l-4 border-orange-500"
                >
                  <p className="font-bold">{t.name}</p>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{t.dueDate}</span>
                    <span>{t.dueTime}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
