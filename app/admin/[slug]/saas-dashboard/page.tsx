// app/admin/[slug]/page.tsx
import React from "react";
import DashboardClient from "./DashboardClient";

// Dummy data types
export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  newSignupsToday: number;
  churnRate: number;
  mrrGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: string; // e.g., 'User Signup', 'Subscription Change', 'Invoice Paid', 'Blog Published'
  description: string;
  timestamp: string;
  link?: string;
}

export interface LatestReview {
  id: string;
  user: string;
  rating: number; // 1-5
  comment: string;
  timestamp: string;
}

interface PageProps {
  params:Promise<{ slug: string }> // companyId
}

export default async function DashboardPage({ params }: PageProps) {
  const { slug : companyId } = await params;

  // --- Simulate API Calls with Dummy Data ---
  let stats: DashboardStats = {
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    newSignupsToday: 0,
    churnRate: 0,
    mrrGrowth: 0,
  };
  let recentActivities: RecentActivity[] = [];
  let latestReviews: LatestReview[] = [];

  try {
    // In a real app, you'd fetch from your API:
    // const statsRes = await fetch(`/api/admin/dashboard/stats?companyId=${companyId}`, { next: { revalidate: 60 } });
    // if (statsRes.ok) stats = await statsRes.json();

    // const activityRes = await fetch(`/api/admin/dashboard/recent-activity?companyId=${companyId}`, { next: { revalidate: 60 } });
    // if (activityRes.ok) recentActivities = await activityRes.json();

    // const reviewsRes = await fetch(`/api/admin/dashboard/latest-reviews?companyId=${companyId}`, { next: { revalidate: 60 } });
    // if (reviewsRes.ok) latestReviews = await reviewsRes.json();

    // --- Dummy Data ---
    stats = {
      totalUsers: 2543,
      activeSubscriptions: 1890,
      monthlyRevenue: 98760,
      newSignupsToday: 23,
      churnRate: 1.2, // percentage
      mrrGrowth: 5.8, // percentage
    };
    recentActivities = [
      { id: "act1", type: "User Signup", description: "Sophia K. just subscribed to the Pro plan.", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: "act2", type: "Invoice Paid", description: "Invoice #INV-2025-07-00123 for $99.00 paid by David Lee.", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: "act3", type: "Subscription Change", description: "Mark T. downgraded from Business to Pro plan.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: "act4", type: "Blog Published", description: "New article: 'Mastering Workflow Automation' published.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
      { id: "act5", type: "Support Ticket", description: "New support ticket from Emily R. about billing.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    ];
    latestReviews = [
      { id: "rev1", user: "Jessica W.", rating: 5, comment: "Absolutely love AscendFlow! Transformed our team's productivity.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
      { id: "rev2", user: "Michael P.", rating: 4, comment: "Great features, but onboarding could be a bit smoother.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() },
    ];

  } catch (err: any) {
    console.error("[DashboardPage] Error fetching data:", err.message);
    // You might pass an error prop to DashboardClient
  }

  return (
    <DashboardClient
      companyId={companyId}
      stats={stats}
      recentActivities={recentActivities}
      latestReviews={latestReviews}
    />
  );
}