import { useState } from 'react';
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
  Bars3Icon,
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
  const [accentColor, setAccentColor] = useState('yellow');
  const { isDarkMode, setMode } = useStateContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar for Desktop & Slide-in for Mobile */}
      <Sidebar 
        tabs={tabs} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 relative ">
        {/* Top Navigation md:ml-72*/}
        <div className="flex justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
          {/* Mobile Sidebar Toggle */}
          {/* <button className="md:hidden p-2 rounded-full bg-gray-200 dark:bg-gray-700" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6 text-gray-800 dark:text-white" />
          </button> */}
          {/* Home Button */}
          <button className="md:hidden p-2 rounded-full bg-gray-200 dark:bg-gray-700" onClick={() => setSidebarOpen(true)}>
            <HomeIcon className="w-6 h-6 text-gray-800 dark:text-white" />
          </button>

          {/* Search Bar */}
          <div className="relative w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full p-2 pl-10 rounded-xl bg-gray-200 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
          </div>

          {/* Theme Toggle */}
          <button onClick={() => setMode(isDarkMode ? "Light" : "Dark")} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            {isDarkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-gray-800" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <BellIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Tab Content */}
        <TabContent activeTab={activeTab} accentColor={accentColor}/>
      </div>

      {/* Bottom Mobile Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

/* Responsive Sidebar */
const Sidebar = ({ tabs, activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => (
  <motion.div
    initial={{ x: -250 }}
    animate={{ x: sidebarOpen ? 0 : -250 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className={`fixed md:relative z-40 flex flex-col h-screen w-64 md:w-72 bg-gray-800 text-white p-4 shadow-xl transform transition-transform md:translate-x-0`}
  >
    {/* Close Button for Mobile */}
    <button className="md:hidden p-2 bg-gray-700 rounded-full mb-4" onClick={() => setSidebarOpen(false)}>
      <XMarkIcon className="w-6 h-6 text-white" />
    </button>

    {/* Sidebar Links */}
    {tabs.map(tab => (
      <button 
        key={tab.key} 
        onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }} 
        className={`flex items-center gap-3 p-3 rounded-xl mt-2 transition hover:bg-gray-700 ${activeTab === tab.key ? 'bg-yellow-500 text-black' : 'text-white'}`}
      >
        <tab.icon className="w-6 h-6" />
        {tab.name}
      </button>
    ))}
  </motion.div>
);

/* Bottom Mobile Navigation */
const MobileNav = ({ activeTab, setActiveTab }) => (
  <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center bg-white dark:bg-gray-800 p-3 shadow-md md:hidden">
    {tabs.slice(0, 5).map(tab => (
      <button 
        key={tab.key} 
        onClick={() => setActiveTab(tab.key)} 
        className={`flex flex-col items-center text-sm p-2 ${activeTab === tab.key ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}
      >
        <tab.icon className="w-6 h-6 mb-1" />
        {tab.name}
      </button>
    ))}
  </div>
);

/* Dynamic Tab Content */
const TabContent = ({ activeTab, accentColor }) => {
  switch (activeTab) {
    case 'profile': return <ProfileSettings />;
    case 'orders': return <ActivityOverview />;
    case 'addresses': return <ShippingAddress />;
    case 'security': return <SecurityOverview />;
    case 'support': return <CommunicationSupport />;
    case 'achievements': return <AchievementsBadges />;
    default: return <OverviewTab accentColor={accentColor} />;
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
