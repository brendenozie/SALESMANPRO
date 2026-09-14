"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  CreditCardIcon,
  MapPinIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentCheckIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  FilmIcon,
  LifebuoyIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import ProfileSettings from "@/components/profileSettings";
import ActivityOverview from "@/components/activityOverview";
import ShippingAddress from "@/components/shippingAddress";
import SecurityOverview from "@/components/security";
import CommunicationSupport from "@/components/communicationSupport";
import AchievementsBadges from "@/components/AchievementsBadges";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useStateContext } from "@/contexts/ContextProvider";

const tabs = [
  { name: "Overview", icon: HomeIcon, key: "overview" },
  { name: "Profile", icon: UserIcon, key: "profile" },
  { name: "Orders", icon: CreditCardIcon, key: "orders" },
  { name: "Addresses", icon: MapPinIcon, key: "addresses" },
  { name: "Security", icon: LockClosedIcon, key: "security" },
  { name: "Support", icon: ChatBubbleLeftRightIcon, key: "support" },
  { name: "Achievements", icon: TrophyIcon, key: "achievements" },
];

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = (params?.slug as string) || "ghuba";

  const [activeTab, setActiveTab] = useState("overview");
  const { isDarkMode, setMode } = useStateContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const userId = session?.user?.id;

  // --- Auth & Loading Pipeline ---
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") {
      const callbackUrl = window.location.href;
      router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    return null;
  }

  // Summary stats state
  const [stats, setStats] = useState({
    orders: 0,
    points: 100,
    visits: 1,
    recentOrders: [] as any[],
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      setLoadingStats(true);
      axios
        .get("/api/shop/user/stats", {
          params: userId ? { userId } : {},
        })
        .then((res) => {
          const body = res.data.body || res.data.data || res.data;
          if (body) {
            setStats({
              orders: body.orders || 0,
              points: body.points || 100,
              visits: body.visits || 1,
              recentOrders: body.recentOrders || [],
            });
          }
        })
        .catch((err) => console.error("Failed to load user stats:", err))
        .finally(() => setLoadingStats(false));
    }
  }, [status, userId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/site/${slug}/ghuba/productlist?search=${encodeURIComponent(
          searchQuery.trim()
        )}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex">
        <Sidebar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Sidebar (Mobile Overlay) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Sidebar
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setSidebarOpen={setSidebarOpen}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 relative max-w-7xl mx-auto w-full pb-24 md:pb-8">
        {/* Top Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              title="Go back"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-800 dark:text-white" />
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2.5 rounded-xl bg-yellow-500 text-white font-bold text-xs"
            >
              Menu
            </button>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 max-w-md min-w-[200px]"
          >
            <input
              type="text"
              placeholder="Search products or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2.5 pl-10 pr-4 text-sm rounded-xl bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none transition-all dark:text-white"
            />
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          </form>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode(isDarkMode ? "Light" : "Dark")}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-yellow-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                title="Notifications"
              >
                <BellIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-500 rounded-full"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl p-4 z-50 text-xs">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b dark:border-gray-700">
                    <span className="font-bold text-gray-900 dark:text-white">Notifications</span>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 py-1">
                    🎉 Welcome to Ghuba Reels! Explore instant shop reels in your feed.
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-2">
                    Orders and status changes will appear here.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const returnTo = window.location.origin;
                signOut({
                  redirect: true,
                  callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                });
              }}
              className="px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dynamic Tab Body */}
        <TabContent
          activeTab={activeTab}
          stats={stats}
          userId={userId}
          slug={slug}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Mobile Bottom Quick Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const Sidebar = ({ tabs, activeTab, setActiveTab, setSidebarOpen }: any) => (
  <motion.div
    initial={{ x: -250 }}
    animate={{ x: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="fixed md:relative flex flex-col min-h-screen w-64 md:w-72 bg-gray-900 text-white p-5 shadow-2xl z-50"
  >
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🛍️</span>
        <span className="font-black text-lg tracking-tight">Ghuba Account</span>
      </div>
      <button
        className="md:hidden p-2 bg-gray-800 hover:bg-gray-700 rounded-xl"
        onClick={() => setSidebarOpen(false)}
      >
        <XMarkIcon className="w-5 h-5 text-white" />
      </button>
    </div>

    <nav className="space-y-1.5 flex-1">
      {tabs.map((tab: any) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              isActive
                ? "bg-yellow-500 text-gray-950 shadow-lg shadow-yellow-500/20"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </button>
        );
      })}
    </nav>
  </motion.div>
);

const MobileNav = ({ activeTab, setActiveTab }: any) => (
  <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-2 shadow-lg md:hidden z-40">
    {tabs.slice(0, 5).map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.key;
      return (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex flex-col items-center text-[11px] font-bold p-1.5 rounded-xl transition-all ${
            isActive
              ? "text-yellow-500 scale-105"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
          }`}
        >
          <Icon className="w-5 h-5 mb-0.5" />
          <span>{tab.name}</span>
        </button>
      );
    })}
  </div>
);

const TabContent = ({
  activeTab,
  stats,
  slug,
  setActiveTab,
}: {
  activeTab: string;
  stats: any;
  userId?: string;
  slug: string;
  setActiveTab: (t: string) => void;
}) => {
  switch (activeTab) {
    case "profile":
      return <ProfileSettings />;
    case "orders":
      return <ActivityOverview slug={slug} />;
    case "addresses":
      return <ShippingAddress onAddressSelect={() => {}} />;
    case "security":
      return <SecurityOverview />;
    case "support":
      return <CommunicationSupport slug={slug} />;
    case "achievements":
      return <AchievementsBadges stats={stats} />;
    default:
      return (
        <OverviewTab
          stats={stats}
          slug={slug}
          onNavigate={(t) => setActiveTab(t)}
        />
      );
  }
};

const OverviewTab = ({
  stats,
  slug,
  onNavigate,
}: {
  stats: { orders: number; points: number; visits: number; recentOrders: any[] };
  slug: string;
  onNavigate: (tab: string) => void;
}) => {
  const quickLinks = [
    {
      name: "Shop Marketplace",
      url: `/site/${slug}/ghuba/productlist`,
      icon: ShoppingBagIcon,
    },
    {
      name: "Discover Reels",
      url: `/site/${slug}/ghuba/feed`,
      icon: FilmIcon,
    },
    {
      name: "Track Orders",
      url: `/site/${slug}/ghuba/orderTracking`,
      icon: TruckIcon,
    },
    {
      name: "Help Center",
      url: `/site/${slug}/ghuba/help-center`,
      icon: LifebuoyIcon,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-500 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 shadow-2xl rounded-3xl p-6 sm:p-8 lg:p-10 text-white w-full"
    >
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
          Welcome Back!
        </h2>
        <p className="text-sm sm:text-base opacity-90 font-medium">
          Manage your orders, saved favorites, delivery address, and account settings
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <StatCard
          label="Total Orders"
          value={stats.orders}
          icon={ClipboardDocumentCheckIcon}
          onClick={() => onNavigate("orders")}
        />
        <StatCard
          label="Reward Points"
          value={stats.points}
          icon={TrophyIcon}
          onClick={() => onNavigate("achievements")}
        />
        <div className="sm:col-span-2 lg:col-span-1 h-full">
          <StatCard
            label="Activity Score"
            value={stats.visits}
            icon={ArrowTrendingUpIcon}
            onClick={() => onNavigate("orders")}
          />
        </div>

        {/* Recent Orders Box */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 dark:border-gray-700 sm:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                <ShoppingBagIcon className="w-5 h-5 text-yellow-500" />
                Recent Orders
              </h4>
              <button
                onClick={() => onNavigate("orders")}
                className="text-xs font-bold text-yellow-600 dark:text-yellow-400 hover:underline"
              >
                View All
              </button>
            </div>

            {stats.recentOrders?.length > 0 ? (
              <ul className="space-y-2.5">
                {stats.recentOrders.slice(0, 3).map((order) => (
                  <li
                    key={order.id}
                    className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/60"
                  >
                    <div>
                      <span className="text-gray-900 dark:text-gray-100 font-bold text-sm block">
                        {order.item}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {order.date}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === "DELIVERED" || order.status === "COMPLETED"
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                          : order.status === "SHIPPED"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300"
                      }`}
                    >
                      {order.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm font-medium">No orders placed yet.</p>
                <Link
                  href={`/site/${slug}/ghuba/productlist`}
                  className="mt-3 inline-block px-4 py-2 bg-yellow-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-yellow-600 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links Box */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 dark:border-gray-700 sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2.5">
              <span>⚡</span> Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.url}
                      className="group flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-yellow-500 hover:text-white dark:hover:bg-yellow-500 transition-all"
                    >
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-xl group-hover:scale-110 transition-transform text-yellow-500">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-white font-bold transition-colors">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: any;
  onClick?: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    onClick={onClick}
    className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 dark:border-gray-700 text-center flex flex-col items-center justify-center h-full cursor-pointer group"
  >
    <div className="p-3.5 bg-yellow-50 dark:bg-yellow-500/10 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7 text-yellow-500" />
    </div>
    <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
      {value}
    </h4>
    <p className="text-gray-400 dark:text-gray-500 font-extrabold text-xs uppercase tracking-wider mt-1">
      {label}
    </p>
  </motion.div>
);

export default ProfilePage;
