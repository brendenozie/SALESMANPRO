import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBagIcon,
  BoltIcon,
  HeartIcon,
  BookmarkIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import axios from "axios";

const tabs = [
  { id: "orders", label: "Orders", icon: ShoppingBagIcon },
  { id: "recent", label: "Recent", icon: BoltIcon },
  { id: "wishlist", label: "Wishlist", icon: HeartIcon },
  { id: "saved", label: "Saved", icon: BookmarkIcon },
  { id: "downloads", label: "Downloads", icon: BookOpenIcon },
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

const ActivityOverview: React.FC = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<string>("orders");
  const [data, setData] = useState<Record<string, any[]>>({
    orders: [],
    recent: [],
    wishlist: [],
    saved: [],
    downloads: [],
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
      if (!userId) throw new Error("User not authenticated");

      const response = await axios.get(
        `${apiBaseUrl}/shop/activity?userId=${userId}&tab=${tabId}`
      );

      setData((prev) => ({
        ...prev,
        [tabId]: response.data.body || [],
      }));
    } catch (err) {
      console.error("Error fetching activity:", err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto shadow-xl rounded-3xl bg-white dark:bg-gray-800 dark:text-white">
      <h2 className="text-2xl font-extrabold mb-6 text-center">📦 Activity Overview</h2>

      {/* Tabs List */}
      <div className="relative flex overflow-x-auto scrollbar-hide justify-between gap-2 mb-6 border-b dark:border-gray-700 md:justify-center md:flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-300 rounded-md focus:outline-none flex-shrink-0
              ${activeTab === tab.id ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"}
            `}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-xs md:text-sm">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="mt-4 min-h-[150px]">
        <AnimatePresence mode="wait">
          {tabs.map(
            (tab) =>
              activeTab === tab.id && (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md"
                >
                  {loading ? (
                    <p className="text-center">Loading...</p>
                  ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                  ) : data[tab.id]?.length > 0 ? (
                    <ul className="space-y-3">
                      {data[tab.id].map((item, idx) => (
                        <li
                          key={idx}
                          className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                        >
                          {Object.entries(item).map(([key, value]) => (
                            <p
                              key={key}
                              className="text-gray-700 dark:text-gray-300"
                            >
                              <strong className="capitalize">
                                {key.replace(/_/g, " ")}:
                              </strong>{" "}
                              {typeof value === "object" && value !== null
                                ? JSON.stringify(value)
                                : String(value)}
                            </p>
                          ))}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      No {tab.label.toLowerCase()} found.
                    </p>
                  )}
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md p-2 flex justify-around md:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center text-xs font-medium transition-colors duration-300 
              ${activeTab === tab.id ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"}
            `}
          >
            <tab.icon className="h-6 w-6" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActivityOverview;
