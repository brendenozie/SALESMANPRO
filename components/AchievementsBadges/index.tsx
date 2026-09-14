import React from "react";
import { motion } from "framer-motion";
import {
  TrophyIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

interface AchievementsBadgesProps {
  stats?: {
    orders?: number;
    points?: number;
    visits?: number;
  };
}

const AchievementsBadges: React.FC<AchievementsBadgesProps> = ({
  stats = { orders: 0, points: 100, visits: 1 },
}) => {
  const { data: session } = useSession();
  const user = session?.user as any;

  // Calculate real profile completion based on actual filled fields
  const fields = [
    Boolean(user?.name),
    Boolean(user?.email),
    Boolean(user?.phone),
    Boolean(user?.address),
    Boolean(user?.bio),
    Boolean(user?.image || user?.profilePicture),
  ];
  const filledCount = fields.filter(Boolean).length;
  const profileCompletion = Math.round((filledCount / fields.length) * 100);

  const orderCount = stats.orders || 0;
  const points = stats.points || 100;

  // Real badges computed from profile & activity
  const allBadges = [
    {
      id: "starter",
      name: "Marketplace Pioneer",
      description: "Joined the Ghuba digital commerce ecosystem.",
      earned: true,
      icon: SparklesIcon,
      color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10",
    },
    {
      id: "profile",
      name: "Profile Complete",
      description: "Filled out full contact details and delivery preferences.",
      earned: profileCompletion >= 80,
      icon: ShieldCheckIcon,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
    },
    {
      id: "first_order",
      name: "Active Shopper",
      description: "Placed an order on the Ghuba marketplace.",
      earned: orderCount >= 1,
      icon: ShoppingBagIcon,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      id: "vip",
      name: "VIP Explorer",
      description: "Achieved 250+ community points & 5+ orders.",
      earned: points >= 250 && orderCount >= 5,
      icon: TrophyIcon,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
    },
  ];

  const getTier = (pts: number) => {
    if (pts >= 1000) return { rank: "Platinum Elite", color: "text-purple-600 dark:text-purple-400" };
    if (pts >= 500) return { rank: "Gold Member", color: "text-yellow-600 dark:text-yellow-400" };
    if (pts >= 250) return { rank: "Silver Shopper", color: "text-blue-600 dark:text-blue-400" };
    return { rank: "Bronze Starter", color: "text-amber-700 dark:text-amber-500" };
  };

  const tier = getTier(points);

  return (
    <div className="p-6 w-full max-w-3xl mx-auto shadow-xl rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60">
      <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <span>🏆</span> Achievements & Loyalty
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Track your profile completeness, loyalty milestones, and shopper rank
        </p>
      </div>

      {/* Profile Completion Progress */}
      <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700/60">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">Profile Completion</h3>
          <span className="text-xs font-black text-yellow-600 dark:text-yellow-400">
            {profileCompletion}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-yellow-500 h-full rounded-full transition-all duration-700"
            initial={{ width: 0 }}
            animate={{ width: `${profileCompletion}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {profileCompletion < 100
            ? "Complete your bio, phone number, and address to unlock all marketplace privileges."
            : "Your profile is fully completed and verified!"}
        </p>
      </div>

      {/* User Tier & Points Card */}
      <div className="mb-8 p-5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-gray-700/60 dark:to-gray-800/60 rounded-2xl border border-yellow-200 dark:border-gray-700/60 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-yellow-500 text-white rounded-2xl shadow-md">
            <TrophyIcon className="w-7 h-7" />
          </div>
          <div>
            <h4 className={`text-lg font-black ${tier.color}`}>{tier.rank}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ghuba Commerce Loyalty Program
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-gray-900 dark:text-white">{points}</span>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Points</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">Milestone Badges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {allBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  badge.earned
                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm"
                    : "bg-gray-50/60 dark:bg-gray-800/40 border-dashed border-gray-200 dark:border-gray-700/60 opacity-60"
                }`}
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${badge.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      {badge.name}
                    </h4>
                    {badge.earned && (
                      <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {badge.description}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-black uppercase tracking-wider mt-2 px-2 py-0.5 rounded-full ${
                      badge.earned
                        ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {badge.earned ? "Unlocked" : "Locked"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsBadges;
