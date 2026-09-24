// app/play/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// --- Sample Data (Used if API fails or returns no data) ---
const samplePuzzles = [
  { id: 'shape-match', slug: 'shape-match', type: 'Shape Match', icon: '🔺' },
  { id: 'animal-shadows', slug: 'animal-shadows', type: 'Animal Shadows', icon: '🦊' },
  { id: 'number-order', slug: 'number-order', type: 'Number Order', icon: '🔢' },
];

export default function PlayHomePage() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string) || '';
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [puzzles, setPuzzles] = useState<any[]>(samplePuzzles);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPuzzles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/activities?companySlug=${slug}&type=puzzle-play`);
        if (response.ok) {
          const resData = await response.json();
          const live = resData?.data?.activities || [];
          if (live.length > 0) {
            const mapped = live.map((course: any) => ({
              id: course.id,
              slug: course.id,
              type: course.title,
              icon: course.activityType?.icon || '🧩',
            }));
            setPuzzles(mapped);
          } else {
            setPuzzles(samplePuzzles);
          }
        } else {
          setPuzzles(samplePuzzles);
        }
      } catch (e: any) {
        setPuzzles(samplePuzzles);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPuzzles();
  }, [slug]);

  const handlePuzzleClick = (puzzleSlug: string) => {
    if (audioRef.current) {
      audioRef.current.src = '/audio/puzzle-click.mp3';
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
    router.push(`/admin/${slug}/play/puzzle-play/${puzzleSlug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements for playfulness */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow animation-delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow animation-delay-2000"></div>

      {/* Back to Play Hub Button */}
      <Link href={`/admin/${slug}/play`} className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back to play">
        🏡
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
