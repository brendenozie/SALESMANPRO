'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  HeartIcon, 
  MapPinIcon, 
  CreditCardIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  CubeIcon,
  TruckIcon,
  StarIcon as StarIconOutline,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

// --- Mock Data ---

const USER = {
  name: "Isabella V.",
  email: "isabella@example.com",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  points: 2450,
  tier: "Platinum Member"
};

const ORDERS = [
  { 
    id: "#ORD-9921", 
    date: "Oct 24, 2023", 
    total: "$129.00", 
    status: "Delivered", 
    items: [
      { name: "Silk Blouse", img: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=100&q=80" },
      { name: "Leather Belt", img: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=100&q=80" }
    ]
  },
  { 
    id: "#ORD-9902", 
    date: "Sep 12, 2023", 
    total: "$450.50", 
    status: "In Transit", 
    items: [
      { name: "Winter Coat", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=100&q=80" }
    ]
  }
];

const WISHLIST = [
  { id: 1, name: "Minimalist Watch", price: "$120.00", category: "Accessories", img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "Leather Tote", price: "$240.00", category: "Bags", img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "Summer Hat", price: "$45.00", category: "Apparel", img: "https://images.unsplash.com/photo-1534260164206-2a3a4a728913?auto=format&fit=crop&w=400&q=80" },
];

const ADDRESSES = [
  { id: 1, type: "Home", street: "123 Maple Avenue, Apt 4B", city: "New York, NY 10012", default: true },
  { id: 2, type: "Office", street: "450 Tech Plaza, Suite 900", city: "San Francisco, CA 94107", default: false },
];

// --- Sub-Components ---

const StatCard = ({ icon: Icon, label, value, subtext, color }:{icon: React.ElementType, label: string, value: string, subtext?: string, color: string}) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {subtext && <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-full text-slate-600">{subtext}</span>}
    </div>
    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    <p className="text-sm text-slate-500 font-medium">{label}</p>
  </div>
);

const SectionHeading = ({ title, subtitle }:{title: string, subtitle: string}) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    <p className="text-sm text-slate-500">{subtitle}</p>
  </div>
);

// --- Content Views ---

const OverviewTab = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -10 }} 
    className="space-y-6"
  >
    {/* Welcome Banner */}
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-10 shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full blur-3xl opacity-30 translate-x-1/3 -translate-y-1/3"></div>
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-300 font-medium text-sm tracking-wide uppercase">
            <StarIcon className="w-4 h-4" /> {USER.tier}
          </div>
          <h2 className="text-3xl font-bold mb-2">Hello, {USER.name.split(' ')[0]}!</h2>
          <p className="text-slate-400 max-w-sm">You have <span className="text-white font-bold">{USER.points} points</span> available. Redeem them for exclusive rewards in your next purchase.</p>
        </div>
        <button className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg shadow-white/10">
          Redeem Rewards
        </button>
      </div>
    </div>

    {/* Bento Grid Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard icon={CubeIcon} label="Orders in 2023" value="12" color="bg-blue-500" />
      <StatCard icon={HeartIcon} label="Wishlist Items" value="08" color="bg-rose-500" />
      <StatCard icon={TruckIcon} label="On the Way" value="1" subtext="Arrives Tue" color="bg-emerald-500" />
    </div>

    {/* Recent Order Preview */}
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 text-lg">Recent Order</h3>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Track Order</button>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex -space-x-4 overflow-hidden py-2">
          {ORDERS[1].items.map((item, i) => (
            <img key={i} className="inline-block h-16 w-16 rounded-full ring-2 ring-white object-cover" src={item.img} alt={item.name} />
          ))}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-bold text-slate-900 text-lg">{ORDERS[1].id}</h4>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
              {ORDERS[1].status}
            </span>
          </div>
          <p className="text-slate-500 text-sm">Ordered on {ORDERS[1].date} • Total: <span className="text-slate-800 font-semibold">{ORDERS[1].total}</span></p>
        </div>
        <div className="w-full md:w-48 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className="bg-emerald-500 h-full w-2/3 rounded-full"></div>
        </div>
      </div>
    </div>
  </motion.div>
);

const OrdersTab = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }} 
    animate={{ opacity: 1, scale: 1 }} 
    exit={{ opacity: 0, scale: 0.95 }} 
    className="space-y-6"
  >
    <SectionHeading title="Order History" subtitle="Track, return, or buy items again." />
    
    <div className="space-y-4">
      {ORDERS.map((order) => (
        <div key={order.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-6 border-b border-slate-50 gap-4">
            <div className="flex gap-4">
               <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                 <CubeIcon className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm text-slate-400 font-medium">Order {order.id}</p>
                 <p className="font-bold text-slate-800">{order.date}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                 order.status === 'Delivered' 
                  ? 'bg-slate-50 border-slate-200 text-slate-600' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-700'
               }`}>
                 {order.status}
               </span>
               <p className="font-mono font-bold text-lg">{order.total}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
               {order.items.map((item, idx) => (
                 <div key={idx} className="relative group/item">
                    <img src={item.img} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                       View
                    </div>
                 </div>
               ))}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg hover:bg-slate-50">Details</button>
              <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800">Buy Again</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const WishlistTab = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }} 
    className="space-y-6"
  >
    <SectionHeading title="My Wishlist" subtitle="Collections you've saved for later." />
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {WISHLIST.map((item) => (
        <div key={item.id} className="group relative bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-100">
            <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-rose-500 hover:bg-white shadow-sm">
              <HeartIcon className="w-5 h-5 fill-current" />
            </button>
          </div>
          <div className="px-2 pb-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{item.category}</p>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.name}</h3>
              <span className="font-medium text-slate-800">{item.price}</span>
            </div>
            <button className="mt-4 w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
              <ShoppingBagIcon className="w-4 h-4" /> Move to Cart
            </button>
          </div>
        </div>
      ))}
      
      {/* Add New Placeholder */}
      <button className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 min-h-[300px] text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors bg-slate-50/50">
        <PlusIcon className="w-8 h-8" />
        <span className="font-medium">Discover Items</span>
      </button>
    </div>
  </motion.div>
);

const AddressesTab = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }} 
    className="space-y-6"
  >
    <SectionHeading title="Shipping Addresses" subtitle="Manage your delivery locations." />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ADDRESSES.map((addr) => (
        <div key={addr.id} className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative ${addr.default ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
          {addr.default && (
            <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              Default
            </span>
          )}
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <MapPinIcon className="w-5 h-5" />
             </div>
             <span className="font-bold text-slate-800">{addr.type}</span>
          </div>
          <p className="text-slate-600 leading-relaxed mb-6">
            {USER.name}<br />
            {addr.street}<br />
            {addr.city}
          </p>
          <div className="flex gap-3">
            <button className="text-sm font-semibold text-slate-900 hover:underline">Edit</button>
            <button className="text-sm font-semibold text-rose-600 hover:underline">Remove</button>
          </div>
        </div>
      ))}
      <button className="p-6 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all">
        <PlusIcon className="w-5 h-5" /> Add New Address
      </button>
    </div>
  </motion.div>
);

// --- Main Layout ---

export default function EcommerceProfile() {
  const [activeTab, setActiveTab] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: CubeIcon },
    { id: 'orders', label: 'My Orders', icon: ShoppingBagIcon },
    { id: 'wishlist', label: 'Wishlist', icon: HeartIcon },
    { id: 'addresses', label: 'Addresses', icon: MapPinIcon },
    { id: 'payment', label: 'Wallet', icon: CreditCardIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation (Mobile/Tablet Friendly) */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <ShoppingBagIcon className="w-5 h-5" />
            </div>
            LUXE.
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm font-medium text-slate-500">Need help?</span>
            <img src={USER.avatar} alt="Profile" className="w-9 h-9 rounded-full ring-2 ring-slate-100" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* User Mini Profile */}
              <div className="flex items-center gap-4 px-2">
                 <img src={USER.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" />
                 <div>
                    <h2 className="font-bold text-lg">{USER.name}</h2>
                    <p className="text-xs text-slate-500">{USER.email}</p>
                 </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === item.id 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                      : 'text-slate-500 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    {activeTab === item.id && <ChevronRightIcon className="w-3 h-3" />}
                  </button>
                ))}
                
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && <OverviewTab key="overview" />}
              {activeTab === 'orders' && <OrdersTab key="orders" />}
              {activeTab === 'wishlist' && <WishlistTab key="wishlist" />}
              {activeTab === 'addresses' && <AddressesTab key="addresses" />}
              {/* Fallback for tabs not implemented in demo */}
              {activeTab === 'payment' && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} key="empty" className="flex flex-col items-center justify-center h-96 text-slate-400">
                  <CreditCardIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p>Payment management is coming soon.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}