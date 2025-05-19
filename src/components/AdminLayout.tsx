// components/AdminLayout.tsx
import React, { useState, PropsWithChildren } from "react";
import { useRouter } from "next/router";
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const AdminLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { id } = router.query;

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const menuItems = [
    { label: "Dashboard", href: `/admin/${id}`, icon: HomeIcon },
    {
      label: "Products",
      icon: UsersIcon,
      subItems: [
        { label: "Browse Catalog", href: `/admin/${id}/inventory` },
        { label: "Market List", href: `/admin/${id}/mymarketplace` },
      ],
    },
    {
      label: "Orders",
      icon: UsersIcon,
      subItems: [
        { label: "Agent Requests", href: `/admin/${id}/agentorders` },
        { label: "Client Requests", href: `/admin/${id}/clientorders` },
        { label: "Market Place Requests", href: `/admin/${id}/customerorders` },
      ],
    },
    {
      label: "Sales Agents",
      icon: ChartBarIcon,
      subItems: [{ label: "Agents", href: `/admin/${id}/agents` }],
    },
    {
      label: "Clients",
      icon: ChartBarIcon,
      subItems: [{ label: "Clients", href: `/admin/${id}/customers` }],
    },
    {
      label: "Reports",
      icon: CalendarIcon,
      subItems: [
        { label: "Revenue Reports", href: `/admin/${id}/revenuereport` },
        { label: "Target Progress", href: `/admin/${id}/targetprogress` },
      ],
    },
    { label: "Messages", href: `/admin/${id}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${id}/settings`, icon: Cog6ToothIcon },
    { label: "Help & Support", href: `/admin/${id}/helpsupport`, icon: QuestionMarkCircleIcon },
    { label: "Log Out", href: "/logout", icon: ArrowRightOnRectangleIcon },
  ];

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const currentPath = router.asPath;

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-500 to-yellow-500 font-sans">
      <aside className="hidden lg:block w-64 bg-white shadow-lg text-gray-900">
        <div className="flex flex-col items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-extrabold text-orange-600">ADMIN</h1>
        </div>
        <nav className="m-4">
          <ul className="space-y-2">

          </ul>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
