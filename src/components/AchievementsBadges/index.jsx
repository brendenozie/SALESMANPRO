import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  ChartBarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const AchievementsBadges = () => {
  const [profileCompletion, setProfileCompletion] = useState(75);
  const badges = [
    { id: 1, name: 'Starter Badge', description: 'Completed first task.', icon: <TrophyIcon className='h-8 w-8 text-yellow-500' /> },
    { id: 2, name: 'Consistency Star', description: 'Logged in 7 days in a row.', icon: <StarIcon className='h-8 w-8 text-blue-500' /> },
  ];
  const userRank = {
    points: 1500,
    rank: 'Gold Member',
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto shadow-lg rounded-2xl bg-white dark:bg-gray-900 dark:text-white">
      <h2 className="text-xl font-bold mb-4">🏆 Achievements & Badges</h2>

      {/* Profile Completion Progress */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Profile Completion</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${profileCompletion}%` }}
          ></div>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{profileCompletion}% Complete</p>
      </div>

      {/* Badges Earned */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Badges Earned</h3>
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-3 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {badge.icon}
              <div>
                <h4 className="font-medium">{badge.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Rankings/Points */}
      <div>
        <h3 className="font-semibold mb-2">User Rankings & Points</h3>
        <motion.div
          className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center gap-3 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ChartBarIcon className='h-8 w-8 text-blue-600 dark:text-blue-400' />
          <div>
            <h4 className="font-medium">{userRank.rank}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Points: {userRank.points}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AchievementsBadges;
