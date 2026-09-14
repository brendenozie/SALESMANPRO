import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBagIcon,
  BoltIcon,
  HeartIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
  InboxIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";

interface ActivityOverviewProps {
  slug?: string;
}

const tabs = [
  { id: "orders", label: "Orders", icon: ShoppingBagIcon },
  { id: "wishlist", label: "Wishlist", icon: HeartIcon },
  { id: "recent", label: "Recently Viewed", icon: BoltIcon },
  { id: "saved", label: "Saved Listings", icon: BookmarkIcon },
];

const ActivityOverview: React.FC<ActivityOverviewProps> = ({ slug = "ghuba" }) => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<string>("orders");
  const [data, setData] = useState<Record<string, any[]>>({
    orders: [],
    recent: [],
    wishlist: [],
    saved: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchActivity(activeTab);
    }
  }, [activeTab, status]);

  const fetchActivity = async (tabId: string) => {
    setLoading(true);
    setError(null);

    try {
      const userId = session?.user?.id;
      const response = await axios.get(
        `/api/shop/activity?${userId ? `userId=${userId}&` : ""}tab=${tabId}`
      );

      const items = response.data.body || response.data.data || [];
      setData((prev) => ({
        ...prev,
        [tabId]: items,
      }));
    } catch (err) {
      console.error("Error fetching activity:", err);
      setError("Failed to load activity items.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("deliv") || s.includes("complet") || s.includes("paid")) {
      return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300";
    }
    if (s.includes("ship") || s.includes("transit")) {
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
    }
    if (s.includes("cancel") || s.includes("fail")) {
      return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
    }
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300";
  };

  return (
    <div className="p-4 sm:p-6 w-full max-w-4xl mx-auto shadow-xl rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/60">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span>📦</span> My Shopping & Activity
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Track orders, saved favorites, and marketplace interaction
          </p>
        </div>
        <button
          onClick={() => fetchActivity(activeTab)}
          disabled={loading}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 transition-colors"
          title="Refresh activity"
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700/60">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-yellow-500 text-white shadow-md shadow-yellow-500/20"
                  : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {data[tab.id]?.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive
                      ? "bg-white/30 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {data[tab.id].length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content List */}
      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-yellow-500 mb-2" />
                <p className="text-sm font-medium">Loading {activeTab}...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500 bg-red-50 dark:bg-red-950/30 rounded-2xl">
                <p className="font-semibold">{error}</p>
                <button
                  onClick={() => fetchActivity(activeTab)}
                  className="mt-3 px-4 py-1.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl"
                >
                  Try Again
                </button>
              </div>
            ) : data[activeTab]?.length > 0 ? (
              <ul className="space-y-3">
                {data[activeTab].map((item) => (
                  <li
                    key={item.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-yellow-400/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-14 object-cover rounded-xl border border-gray-200 dark:border-gray-600 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 flex-shrink-0">
                          <ShoppingBagIcon className="w-7 h-7" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.subtitle}
                        </p>
                        {item.amount > 0 && (
                          <p className="text-xs font-extrabold text-yellow-600 dark:text-yellow-400 mt-1">
                            KES {Number(item.amount).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>

                      {activeTab === "orders" && (
                        <Link
                          href={`/site/${slug}/ghuba/orderTracking?orderId=${item.id}`}
                          className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Track</span>
                          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {item.linkUrl && (
                        <Link
                          href={item.linkUrl}
                          className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 shadow-sm"
                        >
                          <span>View</span>
                          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-gray-400 mb-3">
                  <InboxIcon className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-700 dark:text-gray-200">
                  No {activeTab} recorded yet
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mt-1 mb-4">
                  Discover trending deals, services, and reels on the Ghuba marketplace.
                </p>
                <Link
                  href={`/site/${slug}/ghuba/productlist`}
                  className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
                >
                  Explore Marketplace
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActivityOverview;
