"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  HomeModernIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import ProfileSettings from '@/components/profileSettings';
import ActivityOverview from '@/components/activityOverview';
import ShippingAddress from '@/components/shippingAddress';
import SecurityOverview from '@/components/security';
import CommunicationSupport from '@/components/communicationSupport';
import AchievementsBadges from '@/components/AchievementsBadges';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useStateContext } from '@/contexts/ContextProvider';

const tabs = [
  { name: 'Overview', icon: HomeIcon, key: 'overview' },
  { name: 'Profile', icon: UserIcon, key: 'profile' },
  { name: 'Orders', icon: CreditCardIcon, key: 'orders' },
  { name: 'Addresses', icon: MapPinIcon, key: 'addresses' },
  { name: 'Security', icon: LockClosedIcon, key: 'security' },
  { name: 'Support', icon: ChatBubbleLeftRightIcon, key: 'support' },
  { name: 'Achievements', icon: TrophyIcon, key: 'achievements' },
];

const sampleOrders = [
  { id: 'ORD-001', item: 'Wireless Headphones', date: '2025-02-01', status: 'Delivered' },
  { id: 'ORD-002', item: 'Smart Watch', date: '2025-01-28', status: 'Shipped' },
  { id: 'ORD-003', item: 'Gaming Mouse', date: '2025-01-25', status: 'Processing' },
];


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

const ProfilePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const { isDarkMode, setMode } = useStateContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userId = session?.user?.id;

  // Summary stats state
  const [stats, setStats] = useState({ orders: 0, points: 0, visits: 0 });

  useEffect(() => {
    if (status === 'authenticated' && userId) {
      axios.get(`${apiBaseUrl}/shop/user/stats`, { params: { userId } })
        .then(res => setStats(res.data.body))
        .catch(err => console.error(err));
    }
  }, [status, userId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar */}
      <div className="hidden md:flex">
        <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen  setSidebarOpen={setSidebarOpen} />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen}  setSidebarOpen={setSidebarOpen} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 relative">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <ArrowLeftIcon className="w-6 h-6 text-gray-800 dark:text-white" />
          </button>
          <div className="relative w-full md:w-auto">
            <input type="text" placeholder="Search..." className="w-full p-2 pl-10 rounded-xl bg-gray-200 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none" />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
          </div>
          <button onClick={() => setMode(isDarkMode ? 'Light' : 'Dark')} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            {isDarkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-gray-800" />}
          </button>
          <button className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <BellIcon className="w-5 h-5" />
          </button>
          <button onClick={()=> {
            const returnTo = window.location.origin;

            signOut({
              redirect: true,
              callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
            });
          }} 
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>

        <TabContent activeTab={activeTab} stats={stats} userId={userId} />
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const Sidebar = ({ tabs, activeTab, setActiveTab, sidebarOpen, setSidebarOpen }:any) => (
  <motion.div initial={{ x: -250 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed md:relative flex flex-col min-h-screen w-64 md:w-72 bg-gray-800 text-white p-4 shadow-xl">
    <button className="md:hidden p-2 bg-gray-700 rounded-full mb-4" onClick={() => setSidebarOpen(false)}><XMarkIcon className="w-6 h-6 text-white" /></button>
    {tabs.map((tab:any) => (
      <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }} className={`flex items-center gap-3 p-3 rounded-xl mt-2 transition hover:bg-gray-700 ${activeTab === tab.key ? 'bg-yellow-500 text-black' : 'text-white'}`}> <tab.icon className="w-6 h-6" /> {tab.name}</button>
    ))}
  </motion.div>
);

const MobileNav = ({ activeTab, setActiveTab }:any) => (
  <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center bg-white dark:bg-gray-800 p-3 shadow-md md:hidden">
    {tabs.slice(0, 5).map(tab => (
      <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex flex-col items-center text-sm p-2 ${activeTab === tab.key ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}><tab.icon className="w-6 h-6 mb-1" />{tab.name}</button>
    ))}
  </div>
);

const TabContent = ({ activeTab, stats, userId }:any) => {
  switch (activeTab) {
    case 'profile': return <ProfileSettings  />;
    case 'orders': return <ActivityOverview  />;
    case 'addresses': return <ShippingAddress onAddressSelect={()=>{}}  />;
    case 'security': return <SecurityOverview />;
    case 'support': return <CommunicationSupport />;
    case 'achievements': return <AchievementsBadges />;
    default: return <OverviewTab stats={stats} />;
  }
};

const quickLinks = [
  { name: 'My Shop', url: '/admin', icon: HomeModernIcon },
  { name: 'Shop Now', url: '/shop', icon: ShoppingBagIcon },
  { name: 'Support', url: '/support', icon: ChatBubbleLeftRightIcon },
];

// Added mock data so the component renders without errors
// const sampleOrders = [
//   { id: 1, item: 'Wireless Headphones', status: 'Delivered' },
//   { id: 2, item: 'Smart Watch', status: 'Shipped' },
//   { id: 3, item: 'Mechanical Keyboard', status: 'Processing' },
// ];

const OverviewTab = ({ stats = { orders: 24, points: 1250, visits: 3420 } }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }} 
    animate={{ opacity: 1, scale: 1 }} 
    transition={{ duration: 0.4 }} 
    className="bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-gray-800 dark:to-gray-900 shadow-2xl rounded-[2rem] p-6 sm:p-10 text-white w-full max-w-7xl mx-auto"
  >
    <div className="text-center space-y-2 mb-10">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">Welcome Back!</h2>
      <p className="text-base sm:text-lg opacity-90 font-medium">Manage your profile, track activities, and explore new features</p>
    </div>

    {/* Responsive Bento Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Top Row: Stat Cards */}
      <StatCard label="Orders" value={stats.orders} icon={ClipboardDocumentCheckIcon} />
      <StatCard label="Points" value={stats.points} icon={TrophyIcon} />
      
      {/* Spans 2 columns on tablet to keep the grid balanced, 1 col on desktop */}
      <div className="sm:col-span-2 lg:col-span-1 h-full">
        <StatCard label="Visits" value={stats.visits} icon={ArrowTrendingUpIcon} />
      </div>

      {/* Bottom Row: Recent Orders (Spans 2 columns on large screens) */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-lg border border-white/20 dark:border-gray-700 sm:col-span-2 flex flex-col">
        <h4 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
          <ShoppingBagIcon className="w-6 h-6 text-yellow-500" />
          Recent Orders
        </h4>
        <ul className="space-y-3 flex-grow">
          {sampleOrders.map(order => (
            <li key={order.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors">
              <span className='text-gray-900 dark:text-gray-100 font-semibold'>{order.item}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 
                order.status === 'Shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
              }`}>
                {order.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Row: Quick Links (Takes the remaining column) */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-lg border border-white/20 dark:border-gray-700 sm:col-span-2 lg:col-span-1 flex flex-col">
        <h4 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
          <HomeModernIcon className="w-6 h-6 text-yellow-500" />
          Quick Links
        </h4>
        <ul className="space-y-3 flex-grow">
          {quickLinks.map(link => (
            <li key={link.name}>
              {/* Note: If you are using Next.js, swap this <a> tag for a <Link> component */}
              <a href={link.url} className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-yellow-500 hover:text-white dark:hover:bg-yellow-500 transition-all duration-300">
                <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                  <link.icon className="w-5 h-5 text-yellow-500 group-hover:text-yellow-600 dark:group-hover:text-yellow-400" />
                </div>
                <span className="text-base text-gray-900 dark:text-gray-100 group-hover:text-white font-bold transition-colors">{link.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

    </div>
  </motion.div>
);

const StatCard = ({ label, value, icon: Icon }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -4 }} 
    className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-lg border border-white/20 dark:border-gray-700 text-center flex flex-col items-center justify-center h-full"
  >
    <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-2xl mb-4">
      <Icon className="w-8 h-8 text-yellow-500" />
    </div>
    <h4 className="text-3xl sm:text-4xl font-black mt-2 text-gray-900 dark:text-white">{value}</h4>
    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 text-sm uppercase tracking-widest">{label}</p>
  </motion.div>
);

// export default OverviewTab;

export default ProfilePage;
