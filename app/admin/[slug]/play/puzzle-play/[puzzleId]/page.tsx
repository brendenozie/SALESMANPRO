// app/play/puzzle-game/[puzzleId]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// --- Sample Data (Used if API fails or puzzle not found) ---
const samplePuzzlesData = {
  'shape-match': {
    title: 'Shape Match Fun (Sample)',
    icon: '🔺',
    description: 'Drag the shapes to match their outlines! (Sample Content)',
    gameContent: 'This is where your interactive Shape Match game UI would go! (Sample)',
    audio: '/audio/puzzle-match.mp3' // Specific audio for this puzzle
  },
  'animal-shadows': {
    title: 'Animal Shadow Challenge (Sample)',
    icon: '🦊',
    description: 'Can you match the animals to their shadows? (Sample Content)',
    gameContent: 'This is where your interactive Animal Shadows game UI would go! (Sample)',
    audio: '/audio/puzzle-shadows.mp3'
  },
  'number-order': {
    title: 'Number Order Quest (Sample)',
    icon: '🔢',
    description: 'Put the numbers in the right order! (Sample Content)',
    gameContent: 'This is where your interactive Number Order game UI would go! (Sample)',
    audio: '/audio/puzzle-numbers.mp3'
  },
};

export default function PuzzleGamePage() {
  const params = useParams();
  const router = useRouter();
  const puzzleSlug = Array.isArray(params.puzzleId) ? params.puzzleId[0] : params.puzzleId;

  const [currentPuzzleData, setCurrentPuzzleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false); // State to control game-specific sound


    // const { slug } = await params;
  
    // const session = await getAuthSession();
  
    // // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    // const identifier = slug || session?.user?.id || '';
  
    // // 2. Retrieve the memoized company data (no extra DB cost)
    // const company = await findCompanyCached(identifier, "page");
  
    // if (!company) {
    //   return <div>Company not found</div>;
    // }
  
    // // Use the actual database ID for your API calls, ensuring consistency
    // const companyId = company.id;

  // Fetch puzzle data based on puzzleSlug (which maps to Course.code)
  useEffect(() => {
    const fetchPuzzle = async () => {
      setIsLoading(true);
      setError(null);
      setCurrentPuzzleData(null); // Clear previous data

      try {
          // Fetch all courses and find by 'code' (slug)
          const response = await fetch(`${apiBaseUrl}/student/courses`);

          if (response.ok) {
                // throw new Error(`HTTP error! status: ${response.status}`);

              const allCourses = await response.json();
              const courseData = allCourses.find((course: any) => course.code === puzzleSlug);

              if (courseData) {
                setCurrentPuzzleData({
                  title: courseData.title,
                  icon: courseData.imageUrl || '🧩', // Use imageUrl for icon, fallback to puzzle piece
                  description: courseData.description,
                  gameContent: courseData.description, // Mapping description to gameContent for now
                  audio: courseData.audioUrl,
                });
              } else {
                // No data from API, try to use specific sample data or generic fallback
                // console.warn(`No course found for slug: ${puzzleSlug}. Displaying sample data.`);
                setCurrentPuzzleData(samplePuzzlesData[puzzleSlug as keyof typeof samplePuzzlesData] || null);
                if (!samplePuzzlesData[puzzleSlug as keyof typeof samplePuzzlesData]) {
                  setError("Puzzle not found. Redirecting...");
                  router.replace('/play');
                  return;
                }
              }
            } else {
              // No data from API, try to use specific sample data or generic fallback
              // console.warn(`No course found for slug: ${puzzleSlug}. Displaying sample data.`);
              setCurrentPuzzleData(samplePuzzlesData[puzzleSlug as keyof typeof samplePuzzlesData] || null);
              if (!samplePuzzlesData[puzzleSlug as keyof typeof samplePuzzlesData]) {
                setError("Puzzle not found. Redirecting...");
                router.replace('/play');
                return;
              }
            }
      } catch (e: any) {
        // console.error("Failed to fetch puzzle:", e);
        setError("Failed to load puzzle. Displaying sample data.");
        setCurrentPuzzleData(samplePuzzlesData[puzzleSlug as keyof typeof samplePuzzlesData] || null);
        if (!samplePuzzlesData[puzzleSlug as keyof typeof samplePuzzlesData]) {
          router.replace('/play');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPuzzle();
  }, [puzzleSlug, router]); // Re-fetch if puzzleSlug changes

  // Play puzzle-specific introductory sound when page loads or puzzleData changes
  useEffect(() => {
    if (audioRef.current && currentPuzzleData?.audio) {
      audioRef.current.src = currentPuzzleData.audio;
      audioRef.current.play().then(() => setIsPlayingSound(true)).catch(e => console.error("Error playing puzzle intro audio:", e));
    }
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [currentPuzzleData]); // Re-run if currentPuzzleData changes

  if (isLoading || !currentPuzzleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-200 to-red-300 text-white text-3xl font-bold">
        {isLoading ? "Loading puzzle..." : "Oops! Puzzle not found... heading back!"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-300 to-green-400 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-500"></div>
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-1500"></div>

      {/* Back to Play Home Button */}
      <Link href="/play" className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back to play home">
        🏡
      </Link>

      <h1 className="text-6xl font-extrabold text-white mb-6 drop-shadow-lg animate-fadeInDown text-center px-4 z-10">
        {currentPuzzleData.title} {currentPuzzleData.icon}
      </h1>

      <div className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-5xl w-full flex flex-col items-center justify-center min-h-[60vh] z-10">
        <p className="text-3xl md:text-4xl font-semibold text-gray-700 text-center mb-8 animate-fadeInUp leading-relaxed">
          {currentPuzzleData.description}
        </p>

        {/* This is the main area for the actual interactive puzzle game */}
        <div className="w-full h-[40vh] md:h-[50vh] bg-gray-100 rounded-2xl border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-4xl font-bold animate-pulse-light">
          {currentPuzzleData.gameContent}
        </div>

        {/* Optional: Controls specific to the puzzle, e.g., Reset, Hint */}
        <div className="mt-8 flex space-x-6">
          <button className="px-6 py-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors text-3xl font-bold transform active:scale-95">
            Reset
          </button>
          <button className="px-6 py-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors text-3xl font-bold transform active:scale-95">
            Hint
          </button>
        </div>

        {/* "Playing" or "Thinking" message */}
        <p className="mt-8 text-3xl font-bold text-green-700 animate-pop">
          Let's solve this puzzle! ✨
        </p>
      </div>

      {/* Hidden Audio Player */}
      <audio ref={audioRef} onEnded={() => setIsPlayingSound(false)}></audio>

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

        @keyframes pulse-light { /* Re-used from PlayHomePage */
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-light {
          animation: pulse-light 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
