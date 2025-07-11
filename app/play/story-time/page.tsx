"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

// You'd replace these with actual image paths and ensure audio files exist
const stories = [
  { id: 1, slug: 'the-little-bear', title: 'The Little Bear Who Lost His Roar', cover: '/images/story-bear.png', audio: '/audio/bear-roar.mp3' },
  { id: 2, slug: 'brave-princess-lily', title: 'Brave Princess Lily', cover: '/images/story-princess.png', audio: '/audio/princess-lily.mp3' },
  { id: 3, slug: 'the-giggle-monster', title: 'The Giggle Monster', cover: '/images/story-monster.png', audio: '/audio/giggle-monster.mp3' },
];

export default function StoryTimePage() {
  const router = useRouter(); // Initialize the router

  // We no longer need `currentStory` and `isPlaying` states
  // on this page for the primary navigation, as the actual
  // story playback happens on the dedicated story-view page.
  // We keep `audioRef` if you still want a short preview sound on click.
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // This effect can be removed or simplified if no audio preview is needed on this page
  useEffect(() => {
    // If you want a quick sound when a book is clicked, you can keep this
    // For navigating, the sound should ideally play *before* the navigation
    // or on the destination page.
  }, []);

  const handleStorySelect = (story: any) => {
    // Optional: Play a short click/selection sound before navigating
    if (audioRef.current) {
      audioRef.current.src = story.audio; // Use story's audio for preview
      audioRef.current.play().catch(e => console.error("Error playing preview sound:", e));
    }

    // Navigate to the specific story's view page using its slug
    router.push(`/play/story-time/${story.slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-indigo-300 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements for playfulness */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow animation-delay-1000"></div>
      

      {/* Back to Home Button */}
      <Link href="/play" className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back home">
        🏡
      </Link>

      <h1 className="text-6xl font-extrabold text-white mb-8 drop-shadow-lg animate-fadeInDown text-center px-4">
        📖 Story Time Adventures! 📖
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full relative z-10">
        {stories.map((story) => (
          <button
            key={story.id}
            // Call the new handleStorySelect function
            onClick={() => handleStorySelect(story)}
            className={`relative rounded-3xl p-5 bg-white shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex flex-col items-center justify-between border-4 border-white border-opacity-50`}
          >
            <img
              src={story.cover}
              alt={story.title}
              className="w-full h-auto max-h-64 object-cover rounded-2xl mb-4 shadow-lg group-hover:shadow-xl transition-shadow"
            />
            <p className="text-3xl font-bold text-purple-800 text-center leading-tight group-hover:text-purple-600 transition-colors px-2">
              {story.title}
            </p>
            {/* Removed the playing indicator logic from here, as it belongs on the story-view page */}
          </button>
        ))}
      </div>

      {/* Audio Element for optional preview sound */}
      <audio ref={audioRef} className="hidden"></audio>

      {/* Removed the "Currently Playing Story Display" and its controls
          as audio playback is now handled on the story-view page. */}

      <p className="mt-12 text-2xl text-white opacity-90 animate-fadeInUp text-center px-4">
        Tap a book to start a new adventure! ✨
      </p>

      {/* Custom Tailwind CSS animations (add these to your global CSS or tailwind.config.js) */}
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

        @keyframes grow-bounce {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-grow-bounce {
          animation: grow-bounce 0.6s ease-out;
        }

        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.7s ease-out forwards;
        }

        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}