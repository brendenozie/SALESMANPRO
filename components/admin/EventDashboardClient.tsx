"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  TicketIcon,
  UsersIcon,
  BanknotesIcon,
  BellAlertIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  BoltIcon,
  LightBulbIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";

/* ------------------ ANIMATION VARIANTS ------------------ */

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ------------------ TYPES ------------------ */

interface Activity {
  id: string;
  type: string;
  description: string;
  time: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  ticketsSold: number;
}

interface DashboardData {
  totalEvents: number;
  upcomingEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  recentActivities: Activity[];
  upcomingEventsList: Event[];
}

// interface Props {
//   data?: DashboardData;
// }
type Props = DashboardData & {
  slug?: string;
};


/* ------------------ REUSABLE METRIC CARD ------------------ */

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  delay: number;
  link: string;
}> = ({ title, value, icon: Icon, accent, delay, link }) => (
  <motion.a
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
    href={link}
    className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-cyan-500 transition flex flex-col justify-between group"
  >
    <div className="flex justify-between mb-4">
      <p className="text-sm text-gray-400">{title}</p>
      <Icon className={`w-8 h-8 ${accent}`} />
    </div>
    <h2 className="text-4xl font-extrabold text-white">{value}</h2>
    <div className="flex justify-end mt-4">
      <ArrowRightIcon className="w-5 h-5 text-gray-500 group-hover:text-white transition" />
    </div>
  </motion.a>
);

/* ------------------ MAIN COMPONENT ------------------ */

// export default function ({ data }: Props) {
export default function AdminDashboard({
  totalEvents,
  upcomingEvents,
  totalTicketsSold,
  totalRevenue,
  recentActivities,
  upcomingEventsList,
  slug: companyId,
}: Props) {

  // const { slug: companyId } = useParams();

  // if (!data) {
  //   return (
  //     <div className="min-h-screen bg-gray-950 flex items-center justify-center text-cyan-400">
  //       <RocketLaunchIcon className="w-6 h-6 mr-2 animate-bounce" />
  //       Waiting for dashboard data…
  //     </div>
  //   );
  // }

  // const {
  //   totalEvents,
  //   upcomingEvents,
  //   totalTicketsSold,
  //   totalRevenue,
  //   recentActivities,
  //   upcomingEventsList,
  // } = data;

  const hasRecentActivities = recentActivities.length > 0;
  const hasUpcomingEvents = upcomingEventsList.length > 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8 sm:p-12">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.header
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mb-12 border-b border-gray-800 pb-6"
        >
          <p className="text-xl text-cyan-400 font-semibold">Status: Operational</p>
          <h1 className="text-5xl sm:text-6xl font-black text-white">
            Event{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Monitoring performance
          </p>
        </motion.header>

        {/* METRICS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="bg-gray-800 p-8 rounded-3xl shadow-xl border-l-8 border-green-500"
          >
            <div className="flex items-center gap-3 mb-4">
              <BanknotesIcon className="w-10 h-10 text-green-400" />
              <p className="text-lg text-gray-300 font-semibold">Total Revenue</p>
            </div>
            <h2 className="text-6xl font-black text-white">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-sm text-gray-500 mt-2">All-time earnings</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            <MetricCard title="Total Events" value={totalEvents} icon={CalendarIcon} accent="text-indigo-400" delay={0.4} link="/admin/events" />
            <MetricCard title="Upcoming" value={upcomingEvents} icon={BellAlertIcon} accent="text-cyan-400" delay={0.5} link="/admin/events/upcoming" />
            <MetricCard title="Tickets Sold" value={totalTicketsSold.toLocaleString()} icon={TicketIcon} accent="text-pink-400" delay={0.6} link="/admin/tickets" />
            <MetricCard title="Participants" value={totalTicketsSold.toLocaleString()} icon={UsersIcon} accent="text-yellow-400" delay={0.7} link="/admin/users" />
          </div>
        </section>

        {/* ACTIVITY + EVENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BoltIcon className="w-6 h-6 text-pink-400" /> Recent Activity
            </h3>

            {hasRecentActivities ? (
              <ul className="space-y-4">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="p-3 bg-gray-900 rounded-lg border-l-4 border-pink-500">
                    <p className="text-sm">
                      <span className="font-bold text-pink-400 uppercase mr-1">
                        {activity.type}:
                      </span>
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <ExclamationCircleIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                No recent activity
              </div>
            )}
          </motion.div>

          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.9 }} className="lg:col-span-2 bg-gray-800 p-8 rounded-2xl border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-cyan-400" /> Upcoming Events
            </h3>

            {hasUpcomingEvents ? (
              <ul className="space-y-4">
                {upcomingEventsList.map((event) => (
                  <li key={event.id} className="flex justify-between items-center p-4 bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-lg font-semibold">{event.name}</p>
                      <p className="text-sm text-gray-400">{event.date}</p>
                    </div>
                    <a
                      href={`/admin/${companyId}/events/${event.id}`}
                      className="px-4 py-2 bg-indigo-600 rounded-full text-sm hover:bg-indigo-700 flex items-center"
                    >
                      Manage <ArrowRightIcon className="ml-2 w-4 h-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <LightBulbIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                No upcoming events — create one!
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
