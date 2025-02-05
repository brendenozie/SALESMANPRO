import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  BoltIcon,
  HeartIcon,
  BookmarkIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  { id: "orders", label: "Order History", icon: <ShoppingBagIcon className='h-8 w-8' /> },
  { id: "recent", label: "Recent Activity", icon: <BoltIcon className='h-8 w-8' /> },
  { id: "wishlist", label: "Wishlist", icon: <HeartIcon className='h-8 w-8' /> },
  { id: "saved", label: "Saved Items", icon: <BookmarkIcon className='h-8 w-8' /> },
  { id: "downloads", label: "Download History", icon: <BookOpenIcon className='h-8 w-8' /> },
];

const ActivityOverview = () => {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="p-6 w-full max-w-3xl mx-auto shadow-lg rounded-2xl bg-white">
      <h2 className="text-xl font-bold mb-4">📦 Activity Overview</h2>

      {/* Tabs List */}
      <div className="grid grid-cols-5 gap-2 mb-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 p-2 text-sm font-medium border-b-2 ${
              activeTab === tab.id ? "border-black text-black" : "border-transparent text-gray-500"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="mt-4">
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <motion.div key={tab.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-gray-600">{`No ${tab.label.toLowerCase()} found.`}</p>
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
};

export default ActivityOverview;
