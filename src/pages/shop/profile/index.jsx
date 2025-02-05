import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BookmarkIcon,
  ShoppingBagIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentCheckIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import ProfileSettings from '../../../components/profileSettings';
import ActivityOverview from '../../../components/activityOverview';
import ShippingAddress from '../../../components/shippingAddress';
import SecurityOverview from '../../../components/security';
import CommunicationSupport from '../../../components/communicationSupport';
import AchievementsBadges from '../../../components/AchievementsBadges';
import { useStateContext } from "../../../contexts/ContextProvider.js";
import { useRouter } from 'next/router.js';

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

const activityStats = [
  { label: 'Orders', value: 128, icon: ClipboardDocumentCheckIcon },
  { label: 'Points', value: 5400, icon: TrophyIcon },
  { label: 'Visits', value: 230, icon: ArrowTrendingUpIcon },
];

const quickLinks = [
  { name: 'Shop Now', url: '/shop', icon: ShoppingBagIcon },
  { name: 'Support', url: '/support', icon: ChatBubbleLeftRightIcon },
  { name: 'Account Settings', url: '/profile', icon: UserIcon },
];

const ProfilePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const { isDarkMode, setMode } = useStateContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accentColor, setAccentColor] = useState('yellow');
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleSearch = (e) => setSearchQuery(e.target.value);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300`}>      
      <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} accentColor={accentColor} />

      <div className="flex-1 p-6 space-y-6 relative">
        <div className="flex justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md backdrop-blur-md">
          <button onClick={toggleSidebar} className="md:hidden p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            {sidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
          </button>
          <div className="relative">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={handleSearch} 
              placeholder="Search..." 
              className="p-2 pl-10 rounded-xl bg-gray-200 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
          </div>
          <button onClick={() => setMode(isDarkMode ? "Light" : "Dark")} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            {isDarkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-gray-800" />}
          </button>
          <button className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            <BellIcon className="w-5 h-5" />
            {notifications > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{notifications}</span>}
          </button>
          <button onClick={() => router.push("/shop")} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            <ShoppingBagIcon className={`w-5 h-5 ${isDarkMode ? "text-yellow-400" : "text-gray-800"}`} />
          </button>
        </div>

        <TabContent activeTab={activeTab} accentColor={accentColor} />
      </div>
    </div>
  );
};

const Sidebar = ({ tabs, activeTab, setActiveTab, sidebarOpen, setSidebarOpen, accentColor }) => (
  <motion.div
    initial={{ x: -250 }}
    animate={{ x: sidebarOpen ? 0 : -250 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className={`fixed md:relative z-20 md:flex flex-col w-64 bg-gradient-to-b from-${accentColor}-400 to-${accentColor}-500 dark:from-gray-800 dark:to-gray-900 shadow-xl p-4 rounded-r-2xl`}
  >
    {tabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        className={`flex items-center gap-3 p-3 rounded-xl mt-2 transition-all hover:bg-white hover:text-${accentColor}-500 relative overflow-hidden
          ${activeTab === tab.key ? `bg-white text-${accentColor}-500 shadow-lg` : 'text-white'}`}
      >
        <span className={`absolute left-0 h-full w-1 bg-${accentColor}-500 transition-transform ${activeTab === tab.key ? 'scale-y-100' : 'scale-y-0'}`}></span>
        <tab.icon className="w-5 h-5" /> {sidebarOpen && tab.name}
      </button>
    ))}
  </motion.div>
);

const TabContent = ({ activeTab, accentColor }) => {
  switch (activeTab) {
    case 'profile':
      return <ProfileSettings />;
    case 'orders':
      return <ActivityOverview />;
    case 'addresses':
      return <ShippingAddress />;
    case 'security':
      return <SecurityOverview />;
    case 'support':
      return <CommunicationSupport />;
    case 'achievements':
      return <AchievementsBadges />;
    default:
      return <OverviewTab accentColor={accentColor} />;
  }
};

const OverviewTab = ({ accentColor }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-gray-800 dark:to-gray-900 shadow-xl rounded-2xl p-8 space-y-6 transition-colors duration-300 text-white"
  >
    <h2 className="text-4xl font-extrabold text-center">Welcome Back!</h2>
    <p className="text-center text-lg opacity-90">Manage your profile, track activities, and explore new features.</p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {activityStats.map((stat) => (
        <motion.div 
          key={stat.label} 
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <stat.icon className="w-10 h-10 mx-auto text-yellow-500" />
          <h4 className={`text-2xl text-black dark:text-white font-bold mt-2`}>{stat.value}</h4>
          <p className={`text-gray-500 dark:text-gray-400`}>{stat.label}</p>
        </motion.div>
      ))}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-black dark:text-white">Recent Orders</h4>
        <ul className="space-y-3">
          {sampleOrders.map(order => (
            <li key={order.id} className="flex justify-between items-center">
              <span className='text-black dark:text-white'>{order.item}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>{order.status}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-black dark:text-white">Quick Links</h4>
        <ul className="space-y-3">
          {quickLinks.map(link => (
            <li key={link.name} className="flex items-center gap-3 hover:text-yellow-500 transition-transform transform hover:translate-x-2">
              <link.icon className="w-6 h-6 text-yellow-500" />
              <a href={link.url} className="text-lg text-black dark:text-white font-medium">{link.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </motion.div>
);

export default ProfilePage;
