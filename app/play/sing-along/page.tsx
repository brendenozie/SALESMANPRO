// app/play/sing-along/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- Sample Data (Used if API fails or returns no data) ---
// This structure mimics what we'd map from your Course model
const sampleSongs = [
  { id: 'sample-1', slug: 'twinkle-twinkle', title: 'Twinkle, Twinkle Little Star (Sample)', icon: '🌟', audio: '/audio/twinkle.mp3' },
  { id: 'sample-2', slug: 'wheels-on-the-bus', title: 'Wheels on the Bus (Sample)', icon: '🚌', audio: '/audio/wheels.mp3' },
  { id: 'sample-3', slug: 'old-macdonald', title: 'Old MacDonald (Sample)', icon: '🐷', audio: '/audio/macdonald.mp3' },
];

// --- IMPORTANT: Replace this with the actual ID of your "Playgroup" AcademicLevel from your database ---
// Or create a specific "Sing Along" AcademicLevel if you want to categorize them separately.
const PLAYGROUP_ACADEMIC_LEVEL_ID = 'YOUR_PLAYGROUP_ACADEMIC_LEVEL_ID'; // e.g., '65e7b2f3a4c5d6e7f8a9b0c1'

export default function SingAlongPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [songs, setSongs] = useState<typeof sampleSongs>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch courses from your API, filtering by the playgroup academic level
        const response = await fetch(`/api/courses?academicLevelId=${PLAYGROUP_ACADEMIC_LEVEL_ID}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          // Map API Course data to the format expected by your UI
          const mappedSongs = data
            .filter((course: any) => course.audioUrl) // Only include courses that have an audioUrl
            .map((course: any) => ({
              id: course.id,
              slug: course.code, // Assuming 'code' can be used as a unique slug for songs
              title: course.title,
              // For the icon, you can use imageUrl if you store image icons,
              // or keep a hardcoded emoji based on title/type if needed.
              // For simplicity, we'll use a generic music note emoji or a placeholder if imageUrl is not an emoji.
              icon: course.imageUrl || '🎵', // Use imageUrl if it's an emoji/short string, else default
              audio: course.audioUrl,
            }));
          setSongs(mappedSongs);
        } else {
          // No data from API, use sample data
          console.warn("No courses with audio found for Playgroup academic level. Displaying sample data.");
          setSongs(sampleSongs);
        }
      } catch (e: any) {
        console.error("Failed to fetch songs:", e);
        setError("Failed to load songs. Displaying sample data.");
        setSongs(sampleSongs); // Fallback to sample data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []); // Empty dependency array means this runs once on mount

  const handleSongSelect = (song: any) => {
    // Optional: Play a short click sound effect before navigating
    if (audioRef.current && song.audio) {
      audioRef.current.src = song.audio;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
    // Navigate to the dedicated song view page using the song's slug
    router.push(`/play/sing-along/${song.slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-orange-300 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements for playfulness */}
      <div className="absolute top-10 left-10 w-28 h-28 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow"></div>
      <div className="absolute bottom-10 right-10 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow animation-delay-1000"></div>

      {/* Back to Home Button */}
      <Link href="/play" className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back home">
        🏡
      </Link>

      <h1 className="text-6xl font-extrabold text-white mb-8 drop-shadow-lg animate-fadeInDown text-center px-4">
        🎶 Let's Sing Together! 🎶
      </h1>

      {isLoading ? (
        <div className="text-white text-4xl font-bold animate-pulse">Loading songs...</div>
      ) : error ? (
        <div className="text-red-700 text-3xl font-bold mb-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full relative z-10">
          {songs.map((song) => (
            <button
              key={song.id}
              onClick={() => handleSongSelect(song)}
              className="rounded-3xl p-5 bg-white shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex flex-col items-center justify-between border-4 border-white border-opacity-50 group"
            >
              <div className={`text-7xl mb-4 group-hover:animate-wiggle-small`}>
                {song.icon}
              </div>
              <p className="text-3xl font-bold text-orange-800 text-center leading-tight group-hover:text-orange-600 transition-colors px-2">
                {song.title}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Audio Element for optional click/preview sound */}
      <audio ref={audioRef} className="hidden"></audio>

      <p className="mt-12 text-2xl text-white opacity-90 animate-fadeInUp text-center px-4">
        Tap a song and let's make some music! 🎤
      </p>

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
        @keyframes wiggle-small {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        .animate-wiggle-small {
          animation: wiggle-small 0.3s infinite alternate;
        }
      `}</style>
    </div>
  );
}
