// app/play/sing-along/[songId]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// --- Sample Data (Used if API fails or song not found) ---
// This structure mimics what we'd map from your Course model
const sampleSongsData = {
  'twinkle-twinkle': {
    title: 'Twinkle, Twinkle Little Star (Sample)',
    icon: '🌟',
    audio: '/audio/twinkle.mp3',
    lyrics: [
      "Twinkle, twinkle, little star,",
      "How I wonder what you are.",
      "Up above the world so high,",
      "Like a diamond in the sky.",
      "Twinkle, twinkle, little star,",
      "How I wonder what you are."
    ]
  },
  'wheels-on-the-bus': {
    title: 'Wheels on the Bus (Sample)',
    icon: '🚌',
    audio: '/audio/wheels.mp3',
    lyrics: [
      "The wheels on the bus go round and round,",
      "Round and round, round and round.",
      "The wheels on the bus go round and round,",
      "All through the town."
    ]
  },
  'old-macdonald': {
    title: 'Old MacDonald (Sample)',
    icon: '🐷',
    audio: '/audio/macdonald.mp3',
    lyrics: [
      "Old MacDonald had a farm, E-I-E-I-O!",
      "And on his farm he had a cow, E-I-E-I-O!",
      "With a moo-moo here and a moo-moo there,",
      "Here a moo, there a moo, everywhere a moo-moo.",
      "Old MacDonald had a farm, E-I-E-I-O!"
    ]
  },
};

export default function SingAlongViewPage() {
  const params = useParams();
  const router = useRouter();
  const songSlug = Array.isArray(params.songId) ? params.songId[0] : params.songId;

  const [currentSongData, setCurrentSongData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch song data based on songSlug (which maps to Course.code)
  useEffect(() => {
    const fetchSong = async () => {
      setIsLoading(true);
      setError(null);
      setCurrentSongData(null); // Clear previous data

      try {
        // Fetch course by its 'code' (slug)
        // Note: Your current API only fetches by 'id'. We need to adjust this.
        // For now, we'll fetch all courses and find by code.
        // A dedicated API route like /api/courses/by-code/[code] would be more efficient.
        // For this example, we'll use the GET /api/courses and filter.
        const response = await fetch(`${apiBaseUrl}/student/courses`); // Fetch all to find by code

        if (response.ok) {
          
        const allCourses = await response.json();
        const courseData = allCourses.find((course: any) => course.code === songSlug);

        if (courseData) {
          setCurrentSongData({
            title: courseData.title,
            icon: courseData.imageUrl || '🎵', // Use imageUrl for icon, fallback to music note
            audio: courseData.audioUrl,
            lyrics: courseData.lyrics || [], // Use lyrics from API, fallback to empty array
          });
        } else {
          // No data from API, try to use specific sample data or generic fallback
          console.warn(`No course found for slug: ${songSlug}. Displaying sample data.`);
          setCurrentSongData(sampleSongsData[songSlug as keyof typeof sampleSongsData] || null);
          if (!sampleSongsData[songSlug as keyof typeof sampleSongsData]) {
            setError("Song not found. Redirecting...");
            router.replace('/play/sing-along');
            return;
          }
        }
      }else {
        // No data from API, try to use specific sample data or generic fallback
        console.warn(`No course found for slug: ${songSlug}. Displaying sample data.`);
        setCurrentSongData(sampleSongsData[songSlug as keyof typeof sampleSongsData] || null);
        if (!sampleSongsData[songSlug as keyof typeof sampleSongsData]) {
          setError("Song not found. Redirecting...");
          router.replace('/play/sing-along');
          return;
        }
      }
      } catch (e: any) {
        console.error("Failed to fetch song:", e);
        setError("Failed to load song. Displaying sample data.");
        setCurrentSongData(sampleSongsData[songSlug as keyof typeof sampleSongsData] || null);
        if (!sampleSongsData[songSlug as keyof typeof sampleSongsData]) {
          router.replace('/play/sing-along');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSong();
  }, [songSlug, router]); // Re-fetch if songSlug changes

  // Handle audio playback when isPlaying changes
  useEffect(() => {
    if (audioRef.current && currentSongData?.audio) {
      audioRef.current.src = currentSongData.audio; // Set audio source
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing song audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSongData]);

  // Ensure audio stops if component unmounts (e.g., user navigates away)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  if (isLoading || !currentSongData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-200 to-red-300 text-white text-3xl font-bold">
        {isLoading ? "Loading song..." : "Oops! Song not found... heading back!"}
      </div>
    );
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const stopSong = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Rewind to start
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-orange-400 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-500"></div>
      <div className="absolute bottom-1/4 left-1/4 w-52 h-52 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-slow animation-delay-1500"></div>

      {/* Back to Songs Button */}
      <Link href="/play/sing-along" className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back to songs">
        🎶
      </Link>

      <h1 className="text-6xl font-extrabold text-white mb-6 drop-shadow-lg animate-fadeInDown text-center px-4 z-10">
        {currentSongData.title}
      </h1>

      <div className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-4xl w-full flex flex-col items-center justify-center min-h-[60vh] z-10">
        {/* Song Icon (Animated when playing) */}
        <div className={`text-9xl mb-6 animate-pop ${isPlaying ? 'animate-spin-fast' : ''}`}>
          {currentSongData.icon}
        </div>

        {/* Lyrics Display */}
        <div className="text-center mb-8 px-4 max-h-[30vh] overflow-y-auto custom-scrollbar">
          {currentSongData.lyrics && currentSongData.lyrics.length > 0 ? (
            currentSongData.lyrics.map((line: string, index: number) => (
              <p key={index} className="text-3xl md:text-4xl font-semibold text-gray-700 leading-relaxed mb-2 animate-fadeInUp delay-50ms" style={{ animationDelay: `${index * 50}ms` }}>
                {line}
              </p>
            ))
          ) : (
            <p className="text-3xl md:text-4xl font-semibold text-gray-500 leading-relaxed mb-2">
              No lyrics available for this song.
            </p>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex space-x-6 w-full justify-center">
          <button
            onClick={togglePlayPause}
            className="p-5 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors text-6xl transform active:scale-95"
            aria-label={isPlaying ? "Pause song" : "Play song"}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={stopSong}
            className="p-5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors text-6xl transform active:scale-95"
            aria-label="Stop song"
          >
            ⏹️
          </button>
        </div>

        {/* "Keep Singing" message */}
        {isPlaying && (
          <p className="mt-8 text-3xl font-bold text-green-700 animate-pulse">
            🎤 Keep Singing Along! 🎤
          </p>
        )}
      </div>

      {/* Hidden Audio Player */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)}></audio>

      {/* Custom Tailwind CSS animations */}
      <style jsx>{`
        /* Include all necessary animations from previous pages or global CSS */
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

        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.5s ease-out;
        }

        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-fast {
          animation: spin-fast 1s linear infinite; /* Faster spin for active song */
        }

        /* Custom Scrollbar for Lyrics */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ffb86c; /* Match orange theme */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ff9f4d;
        }
      `}</style>
    </div>
  );
}
