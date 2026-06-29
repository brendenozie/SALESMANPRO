'use client';

import { signOut } from 'next-auth/react';
import { 
  Squares2X2Icon, 
  BoltIcon, 
  BookOpenIcon, 
  ChatBubbleLeftIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/solid';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon },
    { id: 'workouts', label: 'Workouts', icon: BoltIcon },
    { id: 'programs', label: 'Programs', icon: BookOpenIcon },
    { id: 'messages', label: 'Messages', icon: ChatBubbleLeftIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const handleSignOut = () => {
    const returnTo = window.location.origin;
    signOut({
      redirect: true,
      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
    });
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col p-6 sticky top-0 shadow-sm z-50 mt-16">
      <div className="text-2xl font-black text-emerald-600 mb-10 tracking-tight"></div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeView === item.id 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
        Sign Out
      </button>
    </aside>
  );
}