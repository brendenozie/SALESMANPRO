// app/play/make-friends/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


// --- Sample Data (Used if API fails or returns no data) ---
const sampleFriendActivities = [
  { id: 'sample-1', slug: 'learn-sharing', title: 'Learn About Sharing (Sample)', icon: '🍎', introAudio: '/audio/sharing-intro.mp3' },
  { id: 'sample-2', slug: 'practice-hello', title: 'Practice Saying Hello (Sample)', icon: '👋', introAudio: '/audio/hello-intro.mp3' },
  { id: 'sample-3', slug: 'play-together', title: 'Play a Game Together (Sample)', icon: '🎲', introAudio: '/audio/game-intro.mp3' },
];

// --- IMPORTANT: Replace this with the actual ID of your "Playgroup" AcademicLevel from your database ---
// Or create a specific "Social Skills" AcademicLevel if you want to categorize them separately.
const PLAYGROUP_ACADEMIC_LEVEL_ID = 'YOUR_PLAYGROUP_ACADEMIC_LEVEL_ID'; // e.g., '65e7b2f3a4c5d6e7f8a9b0c1'

export default function MakeFriendsPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [friendActivities, setFriendActivities] = useState<typeof sampleFriendActivities>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch courses from your API, filtering by the playgroup academic level
        const response = await fetch(`${apiBaseUrl}/student/courses?academicLevelId=${PLAYGROUP_ACADEMIC_LEVEL_ID}`);

        if (response.ok) {
          // throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();

        if (data && data.length > 0) {
          // Filter for courses that are likely friendship activities (e.g., based on audioUrl and description)
          // You might want to add a 'type' field (e.g., 'SOCIAL_SKILL') to your Course model
          // to make this filtering more robust.
            const mappedActivities = data
                .filter((course: any) => course.audioUrl && course.description) // Ensure it has audio and description
                .map((course: any) => ({
                  id: course.id,
                  slug: course.code, // Assuming 'code' can be used as a unique slug for activities
                  title: course.title,
                  icon: course.imageUrl || '🤝', // Use imageUrl for icon, fallback to handshake emoji
                  introAudio: course.audioUrl,
                  description: course.description, // Map Course.description to activity.description
                }));
              setFriendActivities(mappedActivities);
            } else {
              console.warn("No courses with friendship-related content found for Playgroup academic level. Displaying sample data.");
              setFriendActivities(sampleFriendActivities);
            }
          } else {
            console.warn("No courses with friendship-related content found for Playgroup academic level. Displaying sample data.");
            setFriendActivities(sampleFriendActivities);
          }
      } catch (e: any) {
        console.error("Failed to fetch friendship activities:", e);
        setError("Failed to load activities. Displaying sample data.");
        setFriendActivities(sampleFriendActivities); // Fallback to sample data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []); // Empty dependency array means this runs once on mount

  const handleActivitySelect = (activity: any) => {
    // Optional: Play a short click sound effect or activity-specific intro sound
    if (audioRef.current) {
      audioRef.current.src = activity.introAudio || '/audio/activity-click.mp3'; // Fallback to generic click sound
      audioRef.current.play().catch(e => console.error("Error playing activity sound:", e));
    }
    // Navigate to the dedicated activity view page using the activity's slug
    router.push(`make-friends/${activity.slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 to-red-300 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements for playfulness */}
      <div className="absolute top-10 left-10 w-28 h-28 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow"></div>
      <div className="absolute bottom-10 right-10 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-slow animation-delay-1000"></div>

      {/* Back to Home Button */}
      <Link href="/play" className="absolute top-6 left-6 text-6xl animate-bounce z-20" aria-label="Go back home">
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
