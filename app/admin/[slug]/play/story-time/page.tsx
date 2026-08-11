// app/play/story-time/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// --- Sample Data (Used if API fails or returns no data) ---
// This structure mimics what we'd map from your Course model
const sampleStories = [
  {
    id: 'sample-1',
    slug: 'the-little-bear',
    title: 'The Little Bear Who Lost His Roar (Sample)',
    imageUrl: 'https://placehold.co/400x300/A78BFA/ffffff?text=Bear+Story', // Placeholder image
    audioUrl: '/audio/bear-roar.mp3', // Sample audio path
  },
  {
    id: 'sample-2',
    slug: 'brave-princess-lily',
    title: 'Brave Princess Lily (Sample)',
    imageUrl: 'https://placehold.co/400x300/F472B6/ffffff?text=Princess+Story', // Placeholder image
    audioUrl: '/audio/princess-lily.mp3', // Sample audio path
  },
  {
    id: 'sample-3',
    slug: 'the-giggle-monster',
    title: 'The Giggle Monster (Sample)',
    imageUrl: 'https://placehold.co/400x300/60A5FA/ffffff?text=Monster+Story', // Placeholder image
    audioUrl: '/audio/giggle-monster.mp3', // Sample audio path
  },
];

// --- IMPORTANT: Replace this with the actual ID of your "Playgroup" AcademicLevel from your database ---
// You would typically create an AcademicLevel entry for "Playgroup" first.
const PLAYGROUP_ACADEMIC_LEVEL_ID = 'YOUR_PLAYGROUP_ACADEMIC_LEVEL_ID'; // e.g., '65e7b2f3a4c5d6e7f8a9b0c1'

export default function StoryTimePage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [stories, setStories] = useState<typeof sampleStories>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


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

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch courses from your API, filtering by the playgroup academic level
        const response = await fetch(`${apiBaseUrl}/courses?academicLevelId=${PLAYGROUP_ACADEMIC_LEVEL_ID}`);

        if (response.ok) {
          // throw new Error(`HTTP error! status: ${response.status}`);
    
            const data = await response.json();

            if (data && data.length > 0) {
              // Map API Course data to the format expected by your UI
              const mappedStories = data.map((course: any) => ({
                id: course.id,
                slug: course.code, // Assuming 'code' can be used as a unique slug for stories
                title: course.title,
                cover: course.imageUrl || `https://placehold.co/400x300/A78BFA/ffffff?text=${encodeURIComponent(course.title)}`, // Use imageUrl from API, fallback to placeholder
                audio: course.audioUrl || `/audio/${course.code}-full.mp3`, // Assuming audioUrl exists or can be derived
              }));
              setStories(mappedStories);
            } else {
              // No data from API, use sample data
              // console.warn("No courses found for Playgroup academic level. Displaying sample data.");
              setStories(sampleStories);
            }
          }
          else{
            // No data from API, use sample data
            // console.warn("No courses found for Playgroup academic level. Displaying sample data.");
            setStories(sampleStories);
          }
      } catch (e: any) {
        // console.error("Failed to fetch stories:", e);
        setError("Failed to load stories. Displaying sample data.");
        setStories(sampleStories); // Fallback to sample data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []); // Empty dependency array means this runs once on mount

  const handleStorySelect = (story: any) => {
    // Optional: Play a short click/selection sound before navigating
    if (audioRef.current && story.audio) {
      audioRef.current.src = story.audio;
      audioRef.current.play().catch(e => console.error("Error playing preview sound:", e));
    }

    // Navigate to the specific story's view page using its slug
    router.push(`story-time/${story.slug}`);
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
