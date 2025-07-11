// app/play/story-view/[storyId]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Mock Story Data (In a real app, you'd fetch this from a database/API)
const allStoriesData = {
  'the-little-bear': {
    title: 'The Little Bear Who Lost His Roar',
    pages: [
      { id: 1, image: '/images/story-bear-page1.png', text: 'Once upon a time, in a big green forest, lived a little bear named Barnaby. But Barnaby had a secret...' },
      { id: 2, image: '/images/story-bear-page2.png', text: 'He had lost his ROAR! All the other bears roared loudly, but Barnaby\'s roar was just a tiny squeak.' },
      { id: 3, image: '/images/story-bear-page3.png', text: 'He asked his friend, the wise old owl, "How can I find my roar?"' },
      { id: 4, image: '/images/story-bear-page4.png', text: 'The owl hooted, "Look inside, brave Barnaby!" And with a deep breath, Barnaby found his BIGGEST roar yet!' },
    ],
    audio: {
      fullStory: '/audio/bear-roar-full.mp3', // Full story audio for auto-play
      pageAudios: { // Optional: individual page audios
        1: '/audio/bear-roar-page1.mp3',
        2: '/audio/bear-roar-page2.mp3',
        3: '/audio/bear-roar-page3.mp3',
        4: '/audio/bear-roar-page4.mp3',
      }
    }
  },
  // Add other stories here, e.g., 'brave-princess-lily', 'the-giggle-monster'
  'brave-princess-lily': {
    title: 'Brave Princess Lily',
    pages: [
      { id: 1, image: '/images/story-princess-page1.png', text: 'In a land of sparkling castles, lived Princess Lily. She loved adventures more than gowns!' },
      { id: 2, image: '/images/story-princess-page2.png', text: 'One day, a tiny dragon cried for help. His sparkle had gone missing!' },
      { id: 3, image: '/images/story-princess-page3.png', text: 'Lily bravely followed clues through the whispering woods.' },
      { id: 4, image: '/images/story-princess-page4.png', text: 'She found the sparkle, deep inside a gloomy cave. Lily cheered, and the dragon sparkled brighter than ever!' },
    ],
    audio: {
      fullStory: '/audio/princess-lily-full.mp3',
      pageAudios: { /* ... */ }
    }
  },
  'the-giggle-monster': {
    title: 'The Giggle Monster',
    pages: [
      { id: 1, image: '/images/story-monster-page1.png', text: 'Meet Giggles, the silliest monster! He loved to make everyone giggle.' },
      { id: 2, image: '/images/story-monster-page2.png', text: 'He tickled toes, told funny jokes, and made funny faces.' },
      { id: 3, image: '/images/story-monster-page3.png', text: 'But sometimes, Giggles felt sad when he was all alone.' },
      { id: 4, image: '/images/story-monster-page4.png', text: 'Then he learned, sharing giggles with friends makes everyone happy!' },
    ],
    audio: {
      fullStory: '/audio/giggle-monster-full.mp3',
      pageAudios: { /* ... */ }
    }
  },
};

export default function StoryViewPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = Array.isArray(params.storyId) ? params.storyId[0] : params.storyId; // Handle potential array for dynamic routes
  const storyData = allStoriesData[storyId as keyof typeof allStoriesData];

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // If storyData is not found, redirect or show error
  useEffect(() => {
    if (!storyData) {
      router.replace('/play/story-time'); // Redirect to story selection if ID is invalid
    }
  }, [storyData, router]);

  // Handle audio playback for the full story
  useEffect(() => {
    if (audioRef.current && storyData?.audio?.fullStory) {
      if (isReadingAloud) {
        audioRef.current.src = storyData.audio.fullStory;
        audioRef.current.currentTime = 0; // Start from beginning
        audioRef.current.play().catch(e => console.error("Error playing full story audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isReadingAloud, storyData]);

  // Reset current page when storyData changes (e.g., if a user manually changes URL storyId)
  useEffect(() => {
    setCurrentPageIndex(0);
    setIsReadingAloud(false); // Stop reading aloud if story changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [storyId]);


  if (!storyData) {
    // This will be shown briefly before redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-200 to-red-300 text-white text-3xl font-bold">
        Oops! Story not found... heading back!
      </div>
    );
  }

  const currentPage = storyData.pages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === storyData.pages.length - 1;

  const goToNextPage = () => {
    if (!isLastPage) {
      setCurrentPageIndex((prev) => prev + 1);
      // If reading aloud, restart audio for the new page if page-specific audios exist
      // or simply continue the full story audio
    } else {
      // Optional: Show "Story Finished" animation/message
      console.log("Story finished!");
      setIsReadingAloud(false); // Stop reading when done
      if (audioRef.current) audioRef.current.pause();
    }
  };

  const goToPreviousPage = () => {
    if (!isFirstPage) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const toggleReadAloud = () => {
    setIsReadingAloud(!isReadingAloud);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-green-300 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-500"></div>
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-1500"></div>

      {/* Back to Stories Button */}
      <Link href="/play/story-time" className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back to stories">
        📖
      </Link>

      <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg animate-fadeInDown text-center px-4 z-10">
        {storyData.title}
      </h1>

      <div className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-4xl w-full flex flex-col items-center justify-center min-h-[60vh] z-10">
        {/* Story Image */}
        <img
          src={currentPage.image}
          alt={`Page ${currentPageIndex + 1} of ${storyData.title}`}
          className="w-full h-auto max-h-[40vh] object-contain rounded-2xl shadow-lg mb-6 animate-scaleIn"
        />

        {/* Story Text */}
        <p className="text-3xl md:text-4xl font-semibold text-gray-700 text-center mb-6 animate-fadeInUp leading-relaxed">
          {currentPage.text}
        </p>

        {/* Navigation Buttons */}
        <div className="flex justify-between w-full max-w-xl space-x-4 mb-4">
          <button
            onClick={goToPreviousPage}
            disabled={isFirstPage}
            className={`p-4 md:p-5 rounded-full shadow-lg transition-all text-5xl md:text-6xl
              ${isFirstPage ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-400 text-white hover:bg-orange-500 transform active:scale-95'}`}
            aria-label="Previous page"
          >
            ◀️
          </button>
          <button
            onClick={toggleReadAloud}
            className="p-4 md:p-5 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all text-5xl md:text-6xl transform active:scale-95"
            aria-label={isReadingAloud ? "Pause reading aloud" : "Read aloud"}
          >
            {isReadingAloud ? '🔇' : '🔊'} {/* Mute/Unmute icon for read-aloud */}
          </button>
          <button
            onClick={goToNextPage}
            disabled={isLastPage}
            className={`p-4 md:p-5 rounded-full shadow-lg transition-all text-5xl md:text-6xl
              ${isLastPage ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-400 text-white hover:bg-orange-500 transform active:scale-95'}`}
            aria-label="Next page"
          >
            ▶️
          </button>
        </div>

        {/* "Story Finished" Message/Button */}
        {isLastPage && !isReadingAloud && (
          <div className="mt-8 animate-pop">
            <p className="text-4xl font-bold text-green-700 mb-4 animate-pulse">
              🎉 The End! Great Job! 🎉
            </p>
            <Link
              href="/play/story-time"
              className="px-8 py-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors text-3xl font-bold transform hover:scale-105 active:scale-95"
            >
              Read Another Story!
            </Link>
          </div>
        )}
      </div>

      {/* Hidden Audio Player */}
      <audio ref={audioRef} onEnded={() => setIsReadingAloud(false)}></audio>

      {/* Custom Tailwind CSS animations (add these to your global CSS or tailwind.config.js) */}
      <style jsx>{`
        @keyframes blob-slow { /* Same as previous, but included for completeness */
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(0, 20px) scale(0.9); }
          75% { transform: translate(-20px, -10px) scale(1.05); }
        }
        .animate-blob-slow {
          animation: blob-slow 10s infinite ease-in-out;
        }

        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes pop { /* Already defined, but for clarity */
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.5s ease-out;
        }

        @keyframes fadeInDown { /* Already defined */
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out forwards;
        }

        @keyframes fadeInUp { /* Already defined */
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}