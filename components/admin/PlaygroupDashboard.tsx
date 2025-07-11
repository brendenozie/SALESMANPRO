"use client";

import React from 'react';
import Link from 'next/link'; // Import the Link component
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { useStoreContext } from '@/contexts/StoreContext';



export default function PlaygroupDashboard() {
  const router = useRouter(); // Initialize the router
  const { storeFormData, userRole, userId } = useStoreContext();

// Playful icons and assets (ideally, replace with actual animated GIFs or SVGs for better engagement)
const activityAssets = {
  story: { icon: '📚', animation: 'animate-bounce', sound: '/audio/story-sound.mp3', path: `${userId}/play/story-time` },
  song: { icon: '🎵', animation: 'animate-spin', sound: '/audio/song-sound.mp3', path: `${userId}/play/sing-along` },
  game: { icon: '🧩', animation: 'animate-pulse', sound: '/audio/game-sound.mp3', path: `${userId}/play/puzzle-play` },
  drawing: { icon: '🖍️', animation: 'animate-wiggle', sound: '/audio/draw-sound.mp3', path: `${userId}/play/drawing` },
  friend: { icon: '🤝', animation: 'animate-jiggle', sound: '/audio/friend-sound.mp3', path: `${userId}/play/make-friends` },
};


  const activities = [
    { id: 1, label: 'Story Time', asset: activityAssets.story, bg: 'bg-pink-100' },
    { id: 2, label: 'Sing-Along', asset: activityAssets.song, bg: 'bg-yellow-100' },
    { id: 3, label: 'Puzzle Play', asset: activityAssets.game, bg: 'bg-green-100' },
    { id: 4, label: 'Drawing Fun', asset: activityAssets.drawing, bg: 'bg-blue-100' },
    { id: 5, label: 'Meet Friends', asset: activityAssets.friend, bg: 'bg-purple-100' },
  ];

  const handleActivityClick = (activityLabel: string, soundFile: string, path: string) => {
    console.log(`Clicked: ${activityLabel}`);
    // Play a sound effect
    if (soundFile) {
      const audio = new Audio(soundFile);
      audio.play().catch(e => console.error("Error playing sound:", e));
    }

    // Navigate to the specific activity page
    router.push(path);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-300 to-pink-300 font-sans relative overflow-hidden">
      {/* Background shapes/elements for playfulness */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      {/* Header */}
      <header className="text-center mb-10 relative z-10">
        <h1 className="text-5xl font-extrabold text-white mb-3 text-shadow-lg drop-shadow-lg animate-fadeInDown">
          👋 Hi, Little Star!
        </h1>
        <p className="text-xl text-white opacity-90 animate-fadeInUp">
          What adventure will you choose today? ✨
        </p>
      </header>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto relative z-10">
        {activities.map((act) => (
          <button
            key={act.id}
            onClick={() => handleActivityClick(act.label, act.asset.sound, act.asset.path)} // Pass the path
            className={`${act.bg} rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out cursor-pointer border-4 border-white border-opacity-50 group`}
          >
            <div className={`text-6xl mb-4 ${act.asset.animation} group-hover:scale-110 transition-transform`}>
              {act.asset.icon}
            </div>
            <div className="text-2xl font-bold text-purple-900 group-hover:text-purple-700 transition-colors">
              {act.label}
            </div>
          </button>
        ))}
      </div>

      {/* Footer with playful message */}
      <footer className="mt-16 text-center relative z-10">
        <p className="text-lg text-white opacity-80 animate-fadeInUp delay-1000">
          Have a super fun day! 🎉
        </p>
      </footer>
    </div>
  );
}