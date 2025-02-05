import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  CreditCardIcon,
  MapPinIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import ProfileSettings from '../../../components/profileSettings';
import ActivityOverview from '../../../components/activityOverview';
import ShippingAddress from '../../../components/shippingAddress';
import SecurityOverview from '../../../components/security';
import CommunicationSupport from '../../../components/communicationSupport';
import AchievementsBadges from '../../../components/AchievementsBadges';

const tabs = [
  { name: '', icon: HomeIcon, key: 'overview' },
  { name: 'Profile Information', icon: UserIcon, key: 'profile' },
  { name: 'Orders', icon: CreditCardIcon, key: 'orders' },
  { name: 'Addresses', icon: MapPinIcon, key: 'addresses' },
  { name: 'Security', icon: LockClosedIcon, key: 'security' },
  { name: 'Support', icon: ChatBubbleLeftRightIcon, key: 'support' },
  { name: 'Achievements', icon: TrophyIcon, key: 'achievements' },
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-4">
        <MobileTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabContent activeTab={activeTab} />
      </div>
    </div>
  );
};

const Sidebar = ({ tabs, activeTab, setActiveTab }) => (
  <div className="hidden md:flex flex-col w-64 bg-white shadow-lg p-4">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        className={`flex items-center gap-3 p-3 rounded-lg transition-transform hover:scale-105 ${
          activeTab === tab.key ? 'bg-yellow-400 text-white' : 'text-gray-700'
        }`}
      >
        <tab.icon className="w-5 h-5" /> {tab.name}
      </button>
    ))}
  </div>
);

const MobileTabs = ({ tabs, activeTab, setActiveTab }) => (
  <div className="flex md:hidden justify-around bg-white p-2 shadow-md rounded-lg mb-4">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        className={`flex flex-col items-center text-sm ${
          activeTab === tab.key ? 'text-yellow-400' : 'text-gray-500'
        }`}
      >
        <tab.icon className="w-5 h-5 mb-1" />
        {tab.name}
      </button>
    ))}
  </div>
);

const TabContent = ({ activeTab }) => {
  switch (activeTab) {
    case 'profile':
      return <ProfileSettings />;
    case 'orders':
      return <ActivityOverview/>;
    case 'addresses':
      return <ShippingAddress/>;
    case 'security':
      return <SecurityOverview/>;
    case 'support':
      return <CommunicationSupport/>;
    case 'achievements':
      return <AchievementsBadges/>;
    default:
      return <PlaceholderContent title="KARIBU" />;
  }
};



const PaymentsholderContent = ({ title }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white shadow-xl rounded-2xl p-6 text-center"
  >
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-500 mt-2">Content for {title} will appear here.</p>
  </motion.div>
);

const AddressesholderContent = ({ title }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white shadow-xl rounded-2xl p-6 text-center"
  >
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-500 mt-2">Content for {title} will appear here.</p>
  </motion.div>
);
const SecurityholderContent = ({ title }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white shadow-xl rounded-2xl p-6 text-center"
  >
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-500 mt-2">Content for {title} will appear here.</p>
  </motion.div>
);
const SupportholderContent = ({ title }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white shadow-xl rounded-2xl p-6 text-center"
  >
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-500 mt-2">Content for {title} will appear here.</p>
  </motion.div>
);
const AchievementsholderContent = ({ title }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white shadow-xl rounded-2xl p-6 text-center"
  >
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-500 mt-2">Content for {title} will appear here.</p>
  </motion.div>
);

const PlaceholderContent = ({ title }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white shadow-xl rounded-2xl p-6 text-center"
  >
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-500 mt-2">Content for {title} will appear here.</p>
  </motion.div>
);

const OverviewTab = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white shadow-xl rounded-2xl p-6"
  >
    <h2 className="text-2xl font-bold text-gray-800">Welcome to Your Profile Overview</h2>
    <p className="text-gray-600 mt-4">Manage your information and settings efficiently.</p>
  </motion.div>
);

export default ProfilePage;
