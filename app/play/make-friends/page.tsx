import React from 'react';
import Link from 'next/link';

const friendActivities = [
  { id: 1, title: 'Learn About Sharing', icon: '🍎' },
  { id: 2, title: 'Practice Saying Hello', icon: '👋' },
  { id: 3, title: 'Play a Game Together', icon: '🎲' },
];

export default function MakeFriendsPage() {
  const handleFriendActivity = (activity) => {
    console.log(`Starting friend activity: ${activity.title}`);
    alert(`Imagine you're learning about ${activity.title}!`); // For demo
    // In a real app, this would lead to a video, interactive story, or guided game.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 to-red-300 p-6 flex flex-col items-center justify-center">
      <Link href="/play" className="absolute top-6 left-6 text-5xl animate-bounce" aria-label="Go back home">
        🏠
      </Link>

      <h1 className="text-5xl font-extrabold text-white mb-8 drop-shadow-lg animate-fadeInDown">
        💖 Let's Be Friends! 💖
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {friendActivities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => handleFriendActivity(activity)}
            className="rounded-3xl p-6 bg-white shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex flex-col items-center group"
          >
            <div className={`text-7xl mb-4 group-hover:animate-heartbeat`}> {/* Custom animation */}
              {activity.icon}
            </div>
            <p className="text-2xl font-bold text-red-800 text-center group-hover:text-red-600 transition-colors">
              {activity.title}
            </p>
          </button>
        ))}
      </div>

      <p className="mt-12 text-2xl text-white opacity-90 animate-fadeInUp">
        Explore ways to be a great friend! 🤗
      </p>
    </div>
  );
}