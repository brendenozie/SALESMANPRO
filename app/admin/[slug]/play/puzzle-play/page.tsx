// app/play/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- Sample Data (Used if API fails or returns no data) ---
const samplePuzzles = [
  { id: 'sample-1', slug: 'shape-match', type: 'Shape Match (Sample)', icon: '🔺' },
  { id: 'sample-2', slug: 'animal-shadows', type: 'Animal Shadows (Sample)', icon: '🦊' },
  { id: 'sample-3', slug: 'number-order', type: 'Number Order (Sample)', icon: '🔢' },
];

// --- IMPORTANT: Replace this with the actual ID of your "Playgroup" AcademicLevel from your database ---
const PLAYGROUP_ACADEMIC_LEVEL_ID = 'YOUR_PLAYGROUP_ACADEMIC_LEVEL_ID'; // e.g., '65e7b2f3a4c5d6e7f8a9b0c1'

export default function PlayHomePage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [puzzles, setPuzzles] = useState<typeof samplePuzzles>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPuzzles = async () => {
      setIsLoading(true);
      setError(null);
      try {
          // Fetch courses from your API, filtering by the playgroup academic level
          const response = await fetch(`/api/student/courses?academicLevelId=${PLAYGROUP_ACADEMIC_LEVEL_ID}`);

          if (response.ok) {
            
          const data = await response.json();

          if (data && data.length > 0) {
            // Filter for courses that are likely puzzles (e.g., based on a naming convention or a specific tag/type if added to schema)
            // For now, we'll assume any course in 'PLAYGROUP_ACADEMIC_LEVEL_ID' could be a puzzle.
            // You might want to add a 'type' field (e.g., 'STORY', 'SONG', 'PUZZLE') to your Course model
            // to make this filtering more robust.
            const mappedPuzzles = data.map((course: any) => ({
              id: course.id,
              slug: course.code, // Assuming 'code' can be used as a unique slug for puzzles
              type: course.title, // Use title as the puzzle type/name
              icon: course.imageUrl || '🧩', // Use imageUrl for icon, fallback to puzzle piece emoji
            }));
            setPuzzles(mappedPuzzles);
          } else {
            console.warn("No courses found for Playgroup academic level. Displaying sample puzzle data.");
            setPuzzles(samplePuzzles);
          }
        } else {
          console.warn("No courses found for Playgroup academic level. Displaying sample puzzle data.");
          setPuzzles(samplePuzzles);
        }
      } catch (e: any) {
        console.error("Failed to fetch puzzles:", e);
        setError("Failed to load puzzles. Displaying sample data.");
        setPuzzles(samplePuzzles); // Fallback to sample data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPuzzles();
  }, []); // Empty dependency array means this runs once on mount

  const handlePuzzleClick = (puzzleSlug: string) => {
    if (audioRef.current) {
      audioRef.current.src = '/audio/puzzle-click.mp3'; // Ensure this audio file exists in public/audio
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
    router.push(`/play/puzzle-game/${puzzleSlug}`); // Navigate to the puzzle game page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements for playfulness */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow animation-delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow animation-delay-2000"></div>

      {/* Information/Help Button */}
      <Link href="/info" className="absolute top-6 right-6 text-6xl animate-bounce z-20" aria-label="More information">
        ℹ️
      </Link>

      <h1 className="text-7xl font-extrabold text-white mb-12 drop-shadow-lg animate-fadeInDown text-center px-4">
        Pick a Puzzle! 🤔
      </h1>

      {isLoading ? (
        <div className="text-white text-4xl font-bold animate-pulse">Loading puzzles...</div>
      ) : error ? (
        <div className="text-red-700 text-3xl font-bold mb-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full relative z-10">
          {puzzles.map((puzzle) => (
            <button
              key={puzzle.id}
              onClick={() => handlePuzzleClick(puzzle.slug)}
              className="rounded-3xl p-5 bg-white shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex flex-col items-center justify-between border-4 border-white border-opacity-50 group"
            >
              <div className={`text-7xl mb-4 group-hover:animate-wiggle-strong animate-pop`}>
                {puzzle.icon}
              </div>
              <p className="text-3xl font-bold text-green-800 text-center leading-tight group-hover:text-green-600 transition-colors px-2">
                {puzzle.type}
              </p>
            </button>
          ))}
        </div>
      )}

      <p className="mt-16 text-3xl text-white opacity-90 animate-fadeInUp text-center px-4">
        Choose an adventure and let's have fun! 🎉
      </p>

      {/* Audio Element for optional click sound */}
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

        @keyframes pop-once {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .animate-pop-once {
          animation: pop-once 0.3s ease-out;
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite ease-in-out;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 5s linear infinite;
        }

        @keyframes pulse-light {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-light {
          animation: pulse-light 2s infinite ease-in-out;
        }

        @keyframes wiggle-strong {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-wiggle-strong {
          animation: wiggle-strong 0.2s infinite alternate;
        }

        @keyframes pop { /* For initial pop of puzzle icons */
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
