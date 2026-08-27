"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import ChartTwo from "@/components/ChartTwo";
import ChartThree from "@/components/ChartThree";

interface MarketplaceStats {
  totalProducts: number;
  totalSellers: number;
  monthlyRevenue: number;
  totalOrders: number;
  newListingsToday: number;
}

interface Listing {
  id: string;
  name: string;
  price: number;
  seller: string;
}

const sampleStats: MarketplaceStats = {
  totalProducts: 872,
  totalSellers: 128,
  monthlyRevenue: 154320,
  totalOrders: 2125,
  newListingsToday: 23,
};

const sampleListings: Listing[] = [
  { id: "1", name: "Smartphone X12", price: 450, seller: "TechWorld" },
  { id: "2", name: "Leather Jacket", price: 89, seller: "UrbanStyles" },
  { id: "3", name: "Wireless Earbuds", price: 39, seller: "SoundBeats" },
];

export default function MarketplaceDashboard() {
  const [stats, setStats] = useState<MarketplaceStats>(sampleStats);
  const [listings, setListings] = useState<Listing[]>(sampleListings);

  const cards = [
    {
      title: "Products",
      value: stats.totalProducts,
      icon: CubeIcon,
      bg: "bg-violet-100",
      link: "/admin/products",
    },
    {
      title: "Sellers",
      value: stats.totalSellers,
      icon: UserGroupIcon,
      bg: "bg-orange-100",
      link: "/admin/sellers",
    },
    {
      title: "Revenue",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      bg: "bg-green-100",
      link: "/admin/revenue",
    },
    {
      title: "Orders",
      value: stats.totalOrders,
      icon: ShoppingBagIcon,
      bg: "bg-yellow-100",
      link: "/admin/orders",
    },
    {
      title: "New Listings Today",
      value: stats.newListingsToday,
      icon: ClockIcon,
      bg: "bg-blue-100",
      link: "/admin/listings",
    },
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Marketplace Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className={`${card.bg} p-6 rounded-xl shadow hover:shadow-md transition`}
          >
            <div className="flex items-center gap-3 mb-2">
              <card.icon className="h-8 w-8 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-800">{card.title}</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Sales Overview</h3>
          <ChartTwo />
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Revenue Growth</h3>
          <ChartThree />
        </div>
      </div>

      {/* Recent Listings */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">Today's New Listings</h3>
          <Link href="/admin/listings" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        <ul className="space-y-3">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100"
            >
              <div>
                <p className="font-medium text-gray-700">{listing.name}</p>
                <p className="text-sm text-gray-500">Seller: {listing.seller}</p>
              </div>
              <span className="text-sm font-semibold text-gray-800">${listing.price}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Suggested Additions
// Top Sellers Leaderboard

// Pending Order Approvals

// Low Stock Alerts

// Category-Based Product Analysis

// Seller Performance Analytics