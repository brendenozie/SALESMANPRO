// app/play/make-friends/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// --- Sample Data (Used if API fails or returns no data) ---
const sampleFriendActivities = [
  { id: 'learn-sharing', slug: 'learn-sharing', title: 'Learn About Sharing', icon: '🍎', introAudio: '/audio/sharing-intro.mp3' },
  { id: 'practice-hello', slug: 'practice-hello', title: 'Practice Saying Hello', icon: '👋', introAudio: '/audio/hello-intro.mp3' },
  { id: 'play-together', slug: 'play-together', title: 'Play a Game Together', icon: '🎲', introAudio: '/audio/game-intro.mp3' },
];

export default function MakeFriendsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string) || '';
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [friendActivities, setFriendActivities] = useState<any[]>(sampleFriendActivities);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/activities?companySlug=${slug}&type=make-friends`);
        if (response.ok) {
          const resData = await response.json();
          const live = resData?.data?.activities || [];
          if (live.length > 0) {
            const mapped = live.map((course: any) => ({
              id: course.id,
              slug: course.id,
              title: course.title,
              icon: course.activityType?.icon || '🤝',
              introAudio: course.mediaAsset?.url || null,
              description: course.description,
            }));
            setFriendActivities(mapped);
          } else {
            setFriendActivities(sampleFriendActivities);
          }
        } else {
          setFriendActivities(sampleFriendActivities);
        }
      } catch (e: any) {
        setFriendActivities(sampleFriendActivities);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [slug]);

  const handleActivitySelect = (activity: any) => {
    if (audioRef.current && activity.introAudio) {
      audioRef.current.src = activity.introAudio;
      audioRef.current.play().catch(e => console.error("Error playing activity sound:", e));
    }
    router.push(`/admin/${slug}/play/make-friends/${activity.slug || activity.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 to-red-300 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements for playfulness */}
      <div className="absolute top-10 left-10 w-28 h-28 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow"></div>
      <div className="absolute bottom-10 right-10 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow animation-delay-1000"></div>

      {/* Back to Home Button */}
      <Link href={`/admin/${slug}/play`} className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back home">
        🏡
      </Link>

      <h1 className="text-6xl font-extrabold text-white mb-8 drop-shadow-lg animate-fadeInDown text-center px-4">
        💖 Let's Be Friends! 💖
      </h1>

      {isLoading ? (
        <div className="text-white text-4xl font-bold animate-pulse">Loading friendship activities...</div>
      ) : error ? (
        <div className="text-red-700 text-3xl font-bold mb-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full relative z-10">
          {friendActivities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => handleActivitySelect(activity)}
              className="rounded-3xl p-5 bg-white shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex flex-col items-center justify-between border-4 border-white border-opacity-50 group"
            >
              <div className={`text-7xl mb-4 group-hover:animate-heartbeat animate-pop`}>
                {activity.icon}
              </div>
              <p className="text-3xl font-bold text-red-800 text-center leading-tight group-hover:text-red-600 transition-colors px-2">
                {activity.title}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Audio Element for optional selection sound */}
      <audio ref={audioRef} className="hidden"></audio>

      <p className="mt-12 text-2xl text-white opacity-90 animate-fadeInUp text-center px-4">
        Explore ways to be a great friend! 🤗
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

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.05); }
          30% { transform: scale(1); }
          45% { transform: scale(1.05); }
          60% { transform: scale(1); }
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes pop {
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
