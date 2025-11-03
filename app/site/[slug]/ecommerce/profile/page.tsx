// app/[slug]/profile/page.tsx

'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
    UserCircleIcon, 
    TruckIcon, 
    MapPinIcon, 
    PencilSquareIcon, 
    ArrowLeftIcon,
    CalendarDaysIcon,
    TagIcon,
    CurrencyDollarIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Dummy Data Structures ---
interface User {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    memberSince: string;
    profileImage: string;
}

interface Order {
    id: string;
    date: string;
    total: number;
    status: 'Delivered' | 'Shipped' | 'Processing' | 'Cancelled';
    items: number;
}

interface Address {
    id: string;
    name: string;
    street: string;
    city: string;
    country: string;
    isDefault: boolean;
}

// --- Sample Data ---
const dummyUser: User = {
    firstName: "Alex",
    lastName: "Kipkemboi",
    email: "alex.kipkemboi@example.com",
    phone: "+254 7XX XXX XXX",
    memberSince: "May 2023",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a816d510619?w=100&q=80",
};

const dummyOrders: Order[] = [
    { id: "ORD-93041", date: "Oct 28, 2025", total: 24000, status: 'Delivered', items: 2 },
    { id: "ORD-93042", date: "Sep 15, 2025", total: 12500, status: 'Shipped', items: 1 },
    { id: "ORD-93043", date: "Aug 01, 2025", total: 899, status: 'Processing', items: 1 },
];

const dummyAddresses: Address[] = [
    { id: "ADDR-001", name: "Home (Default)", street: "45 River View Drive", city: "Nairobi", country: "Kenya", isDefault: true },
    { id: "ADDR-002", name: "Work", street: "12 Digital Plaza, 3rd Floor", city: "Nairobi", country: "Kenya", isDefault: false },
];

// --- Animation Variants ---
const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

// =========================================================
// --- TABBED CONTENT COMPONENTS ---
// =========================================================

// --- 1. Personal Information Tab ---
const PersonalInfoTab: React.FC<{ user: User }> = ({ user }) => (
    <motion.div 
        key="personal" 
        variants={tabContentVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
    >
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Account Details</h3>
            <button className="flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
                <PencilSquareIcon className="w-5 h-5 mr-1" /> Edit Profile
            </button>
        </div>

        <InfoField label="Full Name" value={`${user.firstName} ${user.lastName}`} />
        <InfoField label="Email Address" value={user.email} />
        <InfoField label="Phone Number" value={user.phone} />
        <InfoField label="Member Since" value={user.memberSince} />

    </motion.div>
);

// Helper for InfoField
const InfoField: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700/50">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
);


// --- 2. Order History Tab ---
const OrderHistoryTab: React.FC<{ orders: Order[] }> = ({ orders }) => (
    <motion.div 
        key="orders" 
        variants={tabContentVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
    >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Orders ({orders.length})</h3>

        {orders.length === 0 ? (
            <NoDataCard message="No orders found." cta="Start Shopping" ctaHref="/listings" />
        ) : (
            <div className="space-y-4">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        )}
    </motion.div>
);

// Helper for Order Card
const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const statusClasses = clsx("px-3 py-1 text-xs font-bold rounded-full uppercase", {
        "bg-green-100 text-green-700": order.status === 'Delivered',
        "bg-blue-100 text-blue-700": order.status === 'Shipped',
        "bg-yellow-100 text-yellow-700": order.status === 'Processing',
        "bg-red-100 text-red-700": order.status === 'Cancelled',
    });

    return (
        <motion.div 
            whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700/50 transition-all duration-300 flex items-center justify-between"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-2 sm:space-y-0">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <TagIcon className="w-5 h-5 text-gray-400" />
                    {order.id}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <span className="flex items-center gap-1.5"><CalendarDaysIcon className="w-4 h-4" /> {order.date}</span>
                    <span className="flex items-center gap-1.5"><CurrencyDollarIcon className="w-4 h-4" /> Total: **KES {order.total.toLocaleString()}**</span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <span className={statusClasses}>{order.status}</span>
                <Link href={`/orders/${order.id}`} passHref>
                    <span className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer flex items-center text-sm font-semibold">
                        Details <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </span>
                </Link>
            </div>
        </motion.div>
    );
};


// --- 3. Addresses Tab ---
const AddressesTab: React.FC<{ addresses: Address[] }> = ({ addresses }) => (
    <motion.div 
        key="addresses" 
        variants={tabContentVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
    >
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Addresses ({addresses.length})</h3>
            <button className="flex items-center text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors">
                <MapPinIcon className="w-5 h-5 mr-1" /> Add New Address
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
                <AddressCard key={address.id} address={address} />
            ))}
        </div>
    </motion.div>
);

// Helper for Address Card
const AddressCard: React.FC<{ address: Address }> = ({ address }) => (
    <motion.div 
        whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
        className={clsx(
            "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border transition-all duration-300 space-y-3",
            address.isDefault ? "border-2 border-blue-500" : "border-gray-100 dark:border-gray-700/50"
        )}
    >
        <div className="flex justify-between items-start">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-orange-500" /> {address.name}
            </h4>
            {address.isDefault && (
                <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Default</span>
            )}
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {address.street}, <br />
            {address.city}, {address.country}
        </p>
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50 flex space-x-4 text-sm font-semibold">
            <button className="text-blue-600 hover:text-blue-700">Edit</button>
            <button className="text-red-600 hover:text-red-700">Remove</button>
            {!address.isDefault && <button className="text-green-600 hover:text-green-700">Set as Default</button>}
        </div>
    </motion.div>
);

// Helper for No Data Card
const NoDataCard: React.FC<{ message: string, cta: string, ctaHref: string }> = ({ message, cta, ctaHref }) => (
    <div className="text-center p-12 bg-gray-100 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
        <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">{message}</p>
        <Link href={ctaHref} passHref>
            <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
            >
                {cta}
            </motion.a>
        </Link>
    </div>
);


// =========================================================
// --- MAIN USER PROFILE PAGE COMPONENT ---
// =========================================================

type Tab = 'personal' | 'orders' | 'addresses';

export default function UserProfilePage({ slug = 'thrive-academy' }: { slug?: string }) {
    const [activeTab, setActiveTab] = useState<Tab>('personal');

    const renderContent = () => {
        switch (activeTab) {
            case 'personal':
                return <PersonalInfoTab user={dummyUser} />;
            case 'orders':
                return <OrderHistoryTab orders={dummyOrders} />;
            case 'addresses':
                return <AddressesTab addresses={dummyAddresses} />;
            default:
                return null;
        }
    };

    const tabData: { id: Tab, label: string, icon: React.ElementType }[] = [
        { id: 'personal', label: 'Personal Info', icon: UserCircleIcon },
        { id: 'orders', label: 'Order History', icon: TruckIcon },
        { id: 'addresses', label: 'Addresses', icon: MapPinIcon },
    ];

    return (
        <section className="min-h-screen bg-white dark:bg-gray-950 py-10 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* --- HEADER & BREADCRUMB --- */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link href={`/site/${slug}/dashboard`} passHref>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 flex items-center mb-6 cursor-pointer">
                            <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Dashboard
                        </span>
                    </Link>

                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
                        My Account Settings
                    </h1>
                </motion.div>
                
                {/* --- PROFILE GRID: SIDEBAR & CONTENT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-12 gap-10">
                    
                    {/* --- LEFT SIDEBAR (PROFILE SUMMARY & TABS) --- */}
                    <motion.div 
                        className="lg:col-span-1 xl:col-span-3 space-y-8"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        {/* Profile Card */}
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 text-center">
                            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
                                <Image 
                                    src={dummyUser.profileImage} 
                                    alt={dummyUser.firstName} 
                                    loader={loader}
                                    fill 
                                    objectFit="cover"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{dummyUser.firstName} {dummyUser.lastName}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{dummyUser.email}</p>
                        </div>

                        {/* Navigation Tabs */}
                        <nav className="bg-white dark:bg-gray-800 p-3 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-1">
                            {tabData.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <motion.button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        whileHover={{ x: isActive ? 0 : 5 }}
                                        className={clsx(
                                            "w-full flex items-center p-4 rounded-2xl text-left transition-all duration-200",
                                            isActive
                                                ? "bg-blue-600 text-white shadow-lg font-bold"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium"
                                        )}
                                    >
                                        <Icon className="w-6 h-6 mr-3 flex-shrink-0" />
                                        {tab.label}
                                    </motion.button>
                                );
                            })}
                        </nav>
                    </motion.div>

                    {/* --- RIGHT CONTENT AREA --- */}
                    <motion.div 
                        className="lg:col-span-3 xl:col-span-9 bg-white dark:bg-gray-900 p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        {renderContent()}
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

// 'use client';

// import React, { useState, ChangeEvent } from 'react';
// import { motion } from 'framer-motion';
// import Section from '@/components/site/Section/Section';
// import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
// import { useStateContext } from '@/contexts/ContextProvider';
// import { useStore } from '@/contexts/StoreContext';

// const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


// export default function ProfilePage() {
//   const store = useStore();
//   const { user, orders: initialOrders } = useStateContext();

//   const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
//   const [name, setName] = useState(user?.name || '');
//   const [email, setEmail] = useState(user?.email || '');
//   const [phone, setPhone] = useState(user?.phone || '');
//   const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '/default-avatar.png');
//   const [orders] = useState(initialOrders || []);
//   const [message, setMessage] = useState('');

//   const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) setAvatarPreview(URL.createObjectURL(file));
//     // TODO: upload avatar
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setMessage('');
//     try {
//       const res = await fetch(`${apiBaseUrl}/user/update`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name, email, phone }),
//       });
//       setMessage(res.ok ? 'Profile updated!' : 'Update failed.');
//     } catch {
//       setMessage('Error updating profile');
//     }
//   };

//   if (!store) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-xl">Store not found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
//       <Section title=''>
//         {/* Tabs */}
//         <div className="flex space-x-4 mb-6">
//           {['profile', 'orders'].map(tab => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab as any)}
//               className={`px-4 py-2 rounded-md font-medium ${
//                 activeTab === tab
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
//               }`}
//             >
//               {tab === 'profile' ? 'My Profile' : 'Order History'}
//             </button>
//           ))}
//         </div>

//         {activeTab === 'profile' && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
//             {/* Avatar & Stats */}
//             <div className="flex items-center space-x-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
//               <div className="relative group">
//                 <img
//                   src={avatarPreview}
//                   alt="Avatar"
//                   className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
//                 />
//                 <label className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity cursor-pointer">
//                   <input type="file" className="hidden" onChange={handleAvatarChange} />
//                   <span className="text-white text-sm">Change</span>
//                 </label>
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">{user?.name}</h2>
//                 <div className="mt-2 flex space-x-4 text-gray-600 dark:text-gray-300">
//                   <div className="flex items-center space-x-1">
//                     <span className="font-semibold">{orders.length}</span>
//                     <span>Orders</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Profile Form */}
//             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
//               {message && <p className="text-green-500 mb-4">{message}</p>}
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 {['Name', 'Email', 'Phone'].map((label, i) => {
//                   const state = [name, email, phone][i];
//                   const setter = [setName, setEmail, setPhone][i];
//                   const type = label === 'Email' ? 'email' : label === 'Phone' ? 'tel' : 'text';
//                   return (
//                     <div key={label}>
//                       <label className="block text-sm font-medium">{label}</label>
//                       <input
//                         type={type}
//                         value={state}
//                         onChange={e => setter(e.target.value)}
//                         className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
//                       />
//                     </div>
//                   );
//                 })}
//                 <button
//                   type="submit"
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
//                 >
//                   Save Changes
//                 </button>
//               </form>
//             </div>
//           </motion.div>
//         )}

//         {activeTab === 'orders' && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
//             {orders.map((o : any) => (
//               <motion.div
//                 key={o.id}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition"
//               >
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center space-x-3">
//                     <img src={o.items[0]?.thumbnail} className="w-16 h-16 rounded" />
//                     <div>
//                       <h3 className="font-semibold">Order #{o.id}</h3>
//                       <p className="text-sm text-gray-500">{new Date(o.date).toLocaleDateString()}</p>
//                     </div>
//                   </div>
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs ${
//                       o.status === 'Delivered'
//                         ? 'bg-green-100 text-green-800'
//                         : o.status === 'In Transit'
//                         ? 'bg-yellow-100 text-yellow-800'
//                         : 'bg-red-100 text-red-800'
//                     }`}
//                   >
//                     {o.status}
//                   </span>
//                 </div>
//                 <details className="mt-2">
//                   <summary className="cursor-pointer text-blue-600">View Items</summary>
//                   <ul className="mt-2 space-y-1">
//                     {o.items.map((item:any) => (
//                       <li key={item.id} className="flex justify-between">
//                         <span>{item.name}</span>
//                         <span>x{item.qty}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </details>
//               </motion.div>
//             ))}
//           </motion.div>
//         )}
//       </Section>
//       <NewsletterSection />
//     </div>
//   );
// }