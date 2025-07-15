// app/admin/[adminSlug]/settings/page.tsx

import { motion } from 'framer-motion';
import { Cog6ToothIcon, UserCircleIcon, BellIcon, PaintBrushIcon } from '@heroicons/react/24/solid';

export default function SettingsPage() {
  return (
    <div>
      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-[#0A192F] rounded-lg shadow-md border border-blue-800 p-6">
          <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
            <Cog6ToothIcon className="h-7 w-7 mr-3 text-blue-500" /> General Settings
          </h3>
          <form className="space-y-4">
            <div>
              <label htmlFor="firmName" className="block text-blue-200 text-sm font-medium mb-1">Firm Name</label>
              <input
                type="text"
                id="firmName"
                defaultValue="CapitalEdge"
                className="w-full p-3 rounded-md bg-[#1B2A41] text-white border border-blue-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-blue-200 text-sm font-medium mb-1">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                defaultValue="info@capitaledge.com"
                className="w-full p-3 rounded-md bg-[#1B2A41] text-white border border-blue-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Save Changes
            </button>
          </form>
        </div>

        {/* User Management (Admin Accounts) */}
        <div className="bg-[#0A192F] rounded-lg shadow-md border border-blue-800 p-6">
          <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
            <UserCircleIcon className="h-7 w-7 mr-3 text-blue-500" /> User Management
          </h3>
          <p className="text-blue-200 mb-4">Manage admin accounts and permissions.</p>
          {/* Example: A simple list of users */}
          <ul className="space-y-2">
            <li className="flex justify-between items-center text-white bg-[#1B2A41] p-3 rounded-md border border-blue-700">
              <span>Admin User 1 (admin@example.com)</span>
              <div className="flex space-x-2">
                <button className="text-blue-400 hover:text-blue-600 text-sm">Edit</button>
                <button className="text-red-400 hover:text-red-600 text-sm">Delete</button>
              </div>
            </li>
            <li className="flex justify-between items-center text-white bg-[#1B2A41] p-3 rounded-md border border-blue-700">
              <span>Admin User 2 (editor@example.com)</span>
              <div className="flex space-x-2">
                <button className="text-blue-400 hover:text-blue-600 text-sm">Edit</button>
                <button className="text-red-400 hover:text-red-600 text-sm">Delete</button>
              </div>
            </li>
          </ul>
          <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Add New Admin User
          </button>
        </div>

        {/* Notifications Settings */}
        <div className="bg-[#0A192F] rounded-lg shadow-md border border-blue-800 p-6">
          <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
            <BellIcon className="h-7 w-7 mr-3 text-blue-500" /> Notification Preferences
          </h3>
          <form className="space-y-4">
            <div className="flex items-center">
              <input type="checkbox" id="newClientNotify" className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 mr-2" defaultChecked />
              <label htmlFor="newClientNotify" className="text-blue-200">Email me on new client sign-ups</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="invoicePaidNotify" className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 mr-2" />
              <label htmlFor="invoicePaidNotify" className="text-blue-200">Email me when an invoice is paid</label>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Save Preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}