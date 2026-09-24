// app/play/story-time/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// --- Sample Data (Used if API returns no data) ---
const sampleStories = [
  {
    id: 'the-little-bear',
    slug: 'the-little-bear',
    title: 'The Little Bear Who Lost His Roar',
    imageUrl: 'https://placehold.co/400x300/A78BFA/ffffff?text=Bear+Story',
    audioUrl: '/audio/bear-roar.mp3',
  },
  {
    id: 'brave-princess-lily',
    slug: 'brave-princess-lily',
    title: 'Brave Princess Lily',
    imageUrl: 'https://placehold.co/400x300/F472B6/ffffff?text=Princess+Story',
    audioUrl: '/audio/princess-lily.mp3',
  },
  {
    id: 'the-giggle-monster',
    slug: 'the-giggle-monster',
    title: 'The Giggle Monster',
    imageUrl: 'https://placehold.co/400x300/60A5FA/ffffff?text=Monster+Story',
    audioUrl: '/audio/giggle-monster.mp3',
  },
];

export default function StoryTimePage() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string) || '';
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [stories, setStories] = useState<any[]>(sampleStories);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/activities?companySlug=${slug}&type=story-time`);
        if (response.ok) {
          const resData = await response.json();
          const liveActivities = resData?.data?.activities || [];
          if (liveActivities.length > 0) {
            const mapped = liveActivities.map((act: any) => ({
              id: act.id,
              slug: act.id,
              title: act.title,
              imageUrl: act.mediaAsset?.url || `https://placehold.co/400x300/A78BFA/ffffff?text=${encodeURIComponent(act.title)}`,
              audioUrl: null,
            }));
            setStories(mapped);
          } else {
            setStories(sampleStories);
          }
        } else {
          setStories(sampleStories);
        }
      } catch (e: any) {
        setStories(sampleStories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [slug]);

  const handleStorySelect = (story: any) => {
    if (audioRef.current && story.audioUrl) {
      audioRef.current.src = story.audioUrl;
      audioRef.current.play().catch(e => console.error("Error playing preview sound:", e));
    }
    router.push(`/admin/${slug}/play/story-time/${story.slug || story.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-indigo-300 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements for playfulness */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow animation-delay-1000"></div>

      {/* Back to Home Button */}
      <Link href={`/admin/${slug}/play`} className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back home">
        🏡
      </Link>

      <h1 className="text-6xl font-extrabold text-white mb-8 drop-shadow-lg animate-fadeInDown text-center px-4">
        📖 Story Time Adventures! 📖
      </h1>

      {isLoading ? (
        <div className="text-white text-4xl font-bold animate-pulse">Loading stories...</div>
      ) : error ? (
        <div className="text-red-700 text-3xl font-bold mb-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full relative z-10">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => handleStorySelect(story)}
              className={`relative rounded-3xl p-5 bg-white shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex flex-col items-center justify-between border-4 border-white border-opacity-50`}
            >
              <img
                src={story.imageUrl}
                alt={story.title}
                className="w-full h-auto max-h-64 object-cover rounded-2xl mb-4 shadow-lg group-hover:shadow-xl transition-shadow"
              />
              <p className="text-3xl font-bold text-purple-800 text-center leading-tight group-hover:text-purple-600 transition-colors px-2">
                {story.title}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Audio Element for optional preview sound */}
      <audio ref={audioRef} className="hidden"></audio>

      <p className="mt-12 text-2xl text-white opacity-90 animate-fadeInUp text-center px-4">
        Tap a book to start a new adventure! ✨
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
