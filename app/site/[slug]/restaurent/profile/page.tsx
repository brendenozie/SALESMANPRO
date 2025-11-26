'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr"; // Data fetching hook
import { useSession, signOut } from "next-auth/react"; // Authentication hooks

import {
  ShoppingBagIcon,
  HeartIcon,
  MapPinIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CubeIcon,
  TruckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import { StarIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Type definition for functional props (simplified)
type IconType = React.ElementType;

/* --------------------------------------
    I. SUB COMPONENTS & UI ELEMENTS
---------------------------------------*/

/**
 * StatCard component from the previous UI.
 */
const StatCard = ({ icon: Icon, label, value, color }: { icon: IconType, label: string, value: string | number | undefined, color: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
      </div>
      <h3 className="text-2xl font-bold text-slate-800">
        {value !== undefined && value !== null ? value : "..."}
      </h3>
    </div>
    <p className="text-sm text-slate-500 font-medium">{label}</p>
  </div>
);

/**
 * SettingsForm - Component for updating user profile data.
 */
function SettingsForm({ profile, mutateProfile }: { profile: any, mutateProfile: () => void }) {
  const [name, setName] = React.useState(profile?.name || "");
  const [loading, setLoading] = React.useState(false);
  
  React.useEffect(() => {
    setName(profile?.name || "");
  }, [profile]);

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site/profile", {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        mutateProfile();
      } else {
        alert("Failed to save profile.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred during saving.");
    } finally {
      setLoading(false);
    }
  };

  const isNameUnchanged = name.trim() === profile?.name?.trim();
  
  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Account Settings</h2>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Full Name</label>
          <input
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Email Address (Read-Only)</label>
            <input
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                value={profile?.email || ""}
                disabled
            />
        </div>


        <motion.button
          onClick={save}
          disabled={loading || isNameUnchanged}
          whileTap={{ scale: 0.98 }}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
            loading || isNameUnchanged
              ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </motion.button>
      </div>
    </div>
  );
}

/**
 * Orders Tab Content
 */
const OrdersTabContent = ({ orders }: { orders: any[] | undefined }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-900">Your Recent Orders</h2>
    <p className="text-sm text-slate-500">Track, return, or buy items again.</p>
    
    {orders === undefined && <p className="text-slate-500">Loading orders...</p>}
    {orders?.length === 0 && <p className="text-slate-600 p-8 bg-white rounded-xl shadow-sm">You haven't placed any orders yet.</p>}

    <div className="space-y-4">
      {orders?.map((o: any) => (
        <div
          key={o.id}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-50">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Order #{o.id}</h3>
              <p className="text-sm text-slate-500">Ordered on: {new Date(o.date).toLocaleDateString()}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                o.status === "Delivered" ? "bg-green-100 text-green-700" :
                o.status === "In Transit" ? "bg-amber-100 text-amber-700" :
                "bg-slate-100 text-slate-600"
            }`}>
              {o.status}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {o.items?.map((item: any, i: number) => (
                <img
                  key={i}
                  src={item.img || item.product?.image || `https://unsplash.it/64/64?random=${i}`}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                  alt={item.name}
                />
              ))}
            </div>

            <div className="flex flex-col items-end">
              <p className="font-bold text-xl text-slate-900">${o.total?.toFixed(2) || '0.00'}</p>
              <button className="mt-2 text-sm font-medium text-blue-600 hover:underline">View Details</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Wishlist Tab Content (Integrated with moveToCart function)
 */
const WishlistTabContent = ({ wishlist, moveToCart }: { wishlist: any[] | undefined, moveToCart: (itemId: string) => void }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-900">Your Saved Items</h2>
    <p className="text-sm text-slate-500">Items you've saved for later. ({wishlist?.length || 0})</p>
    
    {wishlist === undefined && <p className="text-slate-500">Loading wishlist...</p>}
    {wishlist?.length === 0 && <p className="text-slate-600 p-8 bg-white rounded-xl shadow-sm">Your wishlist is empty.</p>}
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist?.map((item: any) => (
        <div
          key={item.id}
          className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-xl transition group"
        >
          <img
            src={item.product?.image || 'https://unsplash.it/400/300?random'}
            className="w-full h-40 object-cover rounded-xl mb-3 group-hover:scale-[1.02] transition-transform duration-300"
            alt={item.product?.name}
          />
          <h4 className="font-bold text-slate-900">{item.product?.name}</h4>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{item.product?.category || 'General'}</p>
          
          <div className="flex justify-between items-center pt-2 border-t border-slate-50">
              <p className="font-bold text-xl">${item.product?.price.toFixed(2)}</p>
              <button
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition"
                onClick={() => moveToCart(item.id)}
              >
                <ShoppingBagIcon className="w-4 h-4 inline mr-1" /> Move to Cart
              </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Addresses Tab Content (Integrated with functional CRUD operations)
 */
const AddressesTabContent = ({ addresses, deleteAddress, setDefault, mutateAddresses }: { addresses: any[] | undefined, deleteAddress: (id: string) => void, setDefault: (id: string) => void, mutateAddresses: () => void }) => {
    // NOTE: In a real app, you'd have a separate modal/form for adding/editing.
    const handleAddNew = () => alert("New address form goes here! Functionality needs to be built.");

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Delivery Addresses</h2>
            <p className="text-sm text-slate-500">Manage your delivery locations. ({addresses?.length || 0} saved)</p>
            
            {addresses === undefined && <p className="text-slate-500">Loading addresses...</p>}
            {addresses?.length === 0 && <p className="text-slate-600 p-8 bg-white rounded-xl shadow-sm">You haven't added any addresses yet.</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses?.map((addr: any) => (
                    <div
                        key={addr.id}
                        className={`p-6 rounded-2xl border-2 transition-all relative ${addr.isDefault ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                        {addr.isDefault && (
                            <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                Default
                            </span>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                <MapPinIcon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-slate-800">{addr.label || 'Address'}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-6">
                            {addr.name || 'User Name'}<br />
                            {addr.street}<br />
                            {addr.city}, {addr.zip || ''}
                        </p>
                        <div className="flex gap-3">
                            <button className="text-sm font-semibold text-slate-900 hover:underline">Edit</button>
                            {!addr.isDefault && (
                                <>
                                    <button
                                        className="text-sm font-semibold text-blue-600 hover:underline"
                                        onClick={() => setDefault(addr.id)}
                                    >
                                        Set Default
                                    </button>
                                    <button
                                        className="text-sm font-semibold text-rose-600 hover:underline"
                                        onClick={() => deleteAddress(addr.id)}
                                    >
                                        Remove
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                
                <button
                    onClick={handleAddNew}
                    className="p-6 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all bg-white hover:bg-indigo-50"
                >
                    <PlusIcon className="w-5 h-5" /> Add New Address
                </button>
            </div>
        </div>
    );
};

/* --------------------------------------
    II. MAIN COMPONENT (AccountDashboard)
---------------------------------------*/

export default function AccountDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("orders");

  // 🚀 Data Fetching with SWR
  const { data: profile, mutate: mutateProfile } = useSWR("/api/site/profile", fetcher);
  const { data: orders } = useSWR("/api/site/orders", fetcher);
  const { data: wishlist, mutate: mutateWishlist } = useSWR("/api/site/wishlist", fetcher);
  const { data: addresses, mutate: mutateAddresses } = useSWR("/api/site/address", fetcher);

  // --- Guard Clauses ---
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="p-10 text-xl font-medium">Authenticating...</p></div>;
  }
  if (!session) {
    // In a real app, this should redirect to login page
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="p-10 text-xl font-medium">You must be logged in to view this page.</p></div>;
  }
  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="p-10 text-xl font-medium">Loading profile data...</p></div>;
  }
  
  // --- Data Calculations ---
  const totalOrders = orders?.length || 0;
  const wishlistCount = wishlist?.length || 0;
  const inTransitCount = orders && orders.filter((x: any) => x.status === "In Transit").length || 0;
  const tierValue = profile.tier || "Standard"; 
  
  /* --------------------------------------
      Functional Handlers
  ---------------------------------------*/
  const moveToCart = async (itemId: string) => {
    // Optimistic UI update
    const originalWishlist = wishlist;
    mutateWishlist(wishlist?.filter((item: any) => item.id !== itemId), false);

    const res = await fetch("/api/site/wishlist/move-to-cart", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    
    if (!res.ok) {
        alert("Failed to move item to cart.");
        mutateWishlist(originalWishlist, false); // Revert
    }
    mutateWishlist(); // Revalidate data for accuracy
  };
  
  const deleteAddress = async (id: string) => {
    await fetch(`/api/site/address/${id}`, { method: "DELETE" });
    mutateAddresses();
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/site/address/default`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    mutateAddresses();
  };
  
  // --- Tabs Data for Navigation ---
  const navItems = [
    { id: "orders", label: "My Orders", icon: ShoppingBagIcon },
    { id: "wishlist", label: "Wishlist", icon: HeartIcon },
    { id: "addresses", label: "Addresses", icon: MapPinIcon },
    { id: "settings", label: "Settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-28 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Sidebar/Navigation */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-10 space-y-8">
              {/* User Mini Profile */}
              <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                 <img 
                    src={profile.avatar || session.user?.image || `https://ui-avatars.com/api/?name=${profile.name}`} 
                    alt={profile.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" 
                  />
                 <div>
                    <h2 className="font-bold text-lg text-slate-900">{profile.name}</h2>
                    <p className="text-xs text-slate-500">{profile.email || session.user?.email}</p>
                 </div>
              </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <StatCard
                        icon={StarIcon}
                        label="Loyalty Points"
                        value={profile.points || 0}
                        color="bg-yellow-500"
                    />
                    <StatCard
                        icon={HeartIcon}
                        label="Wishlist Items"
                        value={wishlistCount}
                        color="bg-rose-500"
                    />
                </div>
                
              {/* Navigation Menu */}
              <nav className="space-y-1 p-3 bg-white rounded-3xl shadow-sm border border-slate-100">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === item.id 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
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
                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
                {/* Top Stats Bar for larger screens */}
                <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
                    <StatCard icon={CubeIcon} label="Total Orders" value={totalOrders} color="bg-blue-500" />
                    <StatCard icon={TruckIcon} label="In Transit" value={inTransitCount} color="bg-purple-500" />
                    <StatCard icon={StarIcon} label="Loyalty Tier" value={tierValue} color="bg-yellow-500" />
                </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {/* Render Tab Content based on activeTab */}
                {activeTab === "orders" && <OrdersTabContent orders={orders} />}
                {activeTab === "wishlist" && <WishlistTabContent wishlist={wishlist} moveToCart={moveToCart} />}
                {activeTab === "addresses" && <AddressesTabContent addresses={addresses} deleteAddress={deleteAddress} setDefault={setDefault} mutateAddresses={mutateAddresses} />}
                {activeTab === "settings" && <SettingsForm profile={profile} mutateProfile={mutateProfile} />}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}