// app/play/friend-activity-view/[activityId]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Mock Activity Data (In a real app, fetch this from a data source)
const allFriendActivitiesData = {
  'learn-sharing': {
    title: 'Learning About Sharing',
    icon: '🍎',
    description: "Sharing makes everyone happy! Let's watch a story about it.",
    mainContent: (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-4xl mb-6 text-center text-blue-700 font-bold animate-pop">
          The Sharing Story!
        </p>
        {/* Placeholder for an embedded video or interactive story component */}
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-3xl font-semibold border-4 border-dashed border-gray-300">
          [Video or Interactive Story about Sharing]
        </div>
        <p className="mt-6 text-3xl text-gray-600 animate-fadeInUp">
          "Sharing your toys means more fun for everyone!"
        </p>
        <button className="mt-8 px-8 py-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors text-4xl font-bold animate-bounce-subtle">
          Practice Sharing!
        </button>
      </div>
    ),
    backgroundGradient: 'from-blue-200 to-green-300',
    audio: '/audio/sharing-story-audio.mp3' // Audio related to the story/activity
  },
  'practice-hello': {
    title: 'Practice Saying Hello',
    icon: '👋',
    description: "Saying hello is a great way to make a friend! Let's practice!",
    mainContent: (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-4xl mb-6 text-center text-purple-700 font-bold animate-pop">
          Hello Song & Practice!
        </p>
        {/* Placeholder for an interactive "hello" game or song */}
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-3xl font-semibold border-4 border-dashed border-gray-300">
          [Interactive "Hello" Game / Song Lyrics]
        </div>
        <p className="mt-6 text-3xl text-gray-600 animate-fadeInUp">
          "Can you wave hello? 👋"
        </p>
        <button className="mt-8 px-8 py-4 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-colors text-4xl font-bold animate-bounce-subtle">
          Say Hello!
        </button>
      </div>
    ),
    backgroundGradient: 'from-purple-200 to-indigo-300',
    audio: '/audio/hello-song-audio.mp3'
  },
  'play-together': {
    title: 'Playing a Game Together',
    icon: '🎲',
    description: "Games are more fun with friends! Let's play a simple one.",
    mainContent: (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-4xl mb-6 text-center text-orange-700 font-bold animate-pop">
          Friendship Matching Game!
        </p>
        {/* Placeholder for a simple game children can play */}
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-3xl font-semibold border-4 border-dashed border-gray-300">
          [Simple Matching Game UI]
        </div>
        <p className="mt-6 text-3xl text-gray-600 animate-fadeInUp">
          "It's more fun when we play together!"
        </p>
        <button className="mt-8 px-8 py-4 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors text-4xl font-bold animate-bounce-subtle">
          Play Again!
        </button>
      </div>
    ),
    backgroundGradient: 'from-orange-200 to-red-300',
    audio: '/audio/game-play-audio.mp3'
  },
};

export default function FriendActivityViewPage() {
  const params = useParams();
  const router = useRouter();
  const activitySlug = Array.isArray(params.activityId) ? params.activityId[0] : params.activityId;
  const activityData = allFriendActivitiesData[activitySlug as keyof typeof allFriendActivitiesData];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Redirect if activity data not found
  useEffect(() => {
    if (!activityData) {
      router.replace('/play/make-friends'); // Redirect to selection if slug is invalid
    }
  }, [activityData, router]);

  // Play activity-specific intro audio when page loads
  useEffect(() => {
    if (audioRef.current && activityData?.audio) {
      audioRef.current.src = activityData.audio;
      audioRef.current.play().catch(e => console.error("Error playing activity intro audio:", e));
    }
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [activityData]);

  if (!activityData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-200 to-red-300 text-white text-3xl font-bold">
        Oops! Activity not found... heading back!
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${activityData.backgroundGradient} p-6 flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Background Shapes */}
      <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-white rounded-full mix-blend-overlay opacity-30 animate-blob-slow animation-delay-500"></div>
      <div className="absolute bottom-1/4 left-1/4 w-52 h-52 bg-white rounded-full mix-blend-overlay opacity-30 animate-blob-slow animation-delay-1500"></div>

      {/* Back to Make Friends Selection Button */}
      <Link href="/play/make-friends" className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back to friend activities">
        💖
      </Link>

      <h1 className="text-6xl font-extrabold text-white mb-6 drop-shadow-lg animate-fadeInDown text-center px-4 z-10">
        {activityData.title} {activityData.icon}
      </h1>

      <div className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-4xl w-full flex flex-col items-center justify-center min-h-[65vh] z-10">
        <p className="text-3xl md:text-4xl font-semibold text-gray-700 text-center mb-8 animate-fadeInUp leading-relaxed">
          {activityData.description}
        </p>

        {/* Main interactive content for the activity */}
        <div className="w-full flex-grow flex items-center justify-center">
          {activityData.mainContent}
        </div>

        {/* "Great job" or encouraging message */}
        <p className="mt-8 text-3xl font-bold text-pink-700 animate-pop">
          You're doing great! Keep learning! ✨
        </p>
      </div>

      {/* Hidden Audio Player */}
      <audio ref={audioRef} className="hidden"></audio>

      {/* Custom Tailwind CSS animations */}
      <style jsx>{`
        @keyframes blob-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(0, 20px) scale(0.9); }
          75% { transform: translate(-20px, -10px) scale(1.05); }
        }
        .animate-blob-slow {
          animation: blob-slow 10s infinite ease-in-out;
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.5s ease-out;
        }

        @keyframes bounce-subtle { /* A softer bounce for buttons */
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}