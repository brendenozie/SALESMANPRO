// app/play/sing-along/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// --- Sample Data (Used if API fails or returns no data) ---
const sampleSongs = [
  { id: 'twinkle-twinkle', slug: 'twinkle-twinkle', title: 'Twinkle, Twinkle Little Star', icon: '🌟', audio: '/audio/twinkle.mp3' },
  { id: 'wheels-on-the-bus', slug: 'wheels-on-the-bus', title: 'Wheels on the Bus', icon: '🚌', audio: '/audio/wheels.mp3' },
  { id: 'old-macdonald', slug: 'old-macdonald', title: 'Old MacDonald Had a Farm', icon: '🐷', audio: '/audio/macdonald.mp3' },
];

export default function SingAlongPage() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string) || '';
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [songs, setSongs] = useState<any[]>(sampleSongs);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/activities?companySlug=${slug}&type=sing-along`);
        if (response.ok) {
          const resData = await response.json();
          const live = resData?.data?.activities || [];
          if (live.length > 0) {
            const mapped = live.map((course: any) => ({
              id: course.id,
              slug: course.id,
              title: course.title,
              icon: course.activityType?.icon || '🎵',
              audio: course.mediaAsset?.url || null,
            }));
            setSongs(mapped);
          } else {
            setSongs(sampleSongs);
          }
        } else {
          setSongs(sampleSongs);
        }
      } catch (e: any) {
        setSongs(sampleSongs);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [slug]);

  const handleSongSelect = (song: any) => {
    if (audioRef.current && song.audio) {
      audioRef.current.src = song.audio;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
    router.push(`/admin/${slug}/play/sing-along/${song.slug || song.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-orange-300 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements for playfulness */}
      <div className="absolute top-10 left-10 w-28 h-28 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow"></div>
      <div className="absolute bottom-10 right-10 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow animation-delay-1000"></div>

      {/* Back to Home Button */}
      <Link href={`/admin/${slug}/play`} className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back home">
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
